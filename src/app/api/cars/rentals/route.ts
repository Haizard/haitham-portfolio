import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/rbac';
import { createCarRental, getCarRentalsByUserId, checkVehicleAvailability, getVehicleById } from '@/lib/cars-data';
import { differenceInDays, parseISO } from 'date-fns';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
  })
  : null;

// Validation schemas
const driverInfoSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().min(5).max(20),
  licenseNumber: z.string().min(5).max(30),
  licenseExpiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const createRentalSchema = z.object({
  vehicleId: z.string().min(1),
  driverInfo: driverInfoSchema,
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pickupTime: z.string().regex(/^\d{2}:\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnTime: z.string().regex(/^\d{2}:\d{2}$/),
  pickupLocation: z.string().min(5),
  returnLocation: z.string().min(5),
  additionalDrivers: z.array(driverInfoSchema).optional(),
  specialRequests: z.string().max(500).optional(),
});

// POST /api/cars/rentals - Create a new rental
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const body = await request.json();
    const validatedData = createRentalSchema.parse(body);

    // Validate dates
    const pickup = parseISO(validatedData.pickupDate);
    const returnD = parseISO(validatedData.returnDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (pickup < now) {
      return NextResponse.json(
        { success: false, error: 'Pickup date cannot be in the past' },
        { status: 400 }
      );
    }

    if (returnD <= pickup) {
      return NextResponse.json(
        { success: false, error: 'Return date must be after pickup date' },
        { status: 400 }
      );
    }

    // Validate driver's license expiry
    const licenseExpiry = parseISO(validatedData.driverInfo.licenseExpiry);
    if (licenseExpiry < returnD) {
      return NextResponse.json(
        { success: false, error: 'Driver license will expire before return date' },
        { status: 400 }
      );
    }

    // Validate driver age (must be at least 21)
    const dob = parseISO(validatedData.driverInfo.dateOfBirth);
    const age = differenceInDays(now, dob) / 365.25;
    if (age < 21) {
      return NextResponse.json(
        { success: false, error: 'Driver must be at least 21 years old' },
        { status: 400 }
      );
    }

    // Get vehicle
    const vehicle = await getVehicleById(validatedData.vehicleId);
    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Check availability
    const availability = await checkVehicleAvailability(
      validatedData.vehicleId,
      validatedData.pickupDate,
      validatedData.returnDate
    );

    if (!availability.available) {
      return NextResponse.json(
        { success: false, error: 'Vehicle is not available for the selected dates' },
        { status: 400 }
      );
    }

    // Calculate pricing
    const numberOfDays = differenceInDays(returnD, pickup);
    let subtotal = 0;
    const dailyRate = vehicle.pricing.dailyRate;

    // Use weekly or monthly rate if applicable
    if (numberOfDays >= 30 && vehicle.pricing.monthlyRate) {
      const months = Math.floor(numberOfDays / 30);
      const remainingDays = numberOfDays % 30;
      subtotal = (months * vehicle.pricing.monthlyRate) + (remainingDays * dailyRate);
    } else if (numberOfDays >= 7 && vehicle.pricing.weeklyRate) {
      const weeks = Math.floor(numberOfDays / 7);
      const remainingDays = numberOfDays % 7;
      subtotal = (weeks * vehicle.pricing.weeklyRate) + (remainingDays * dailyRate);
    } else {
      subtotal = numberOfDays * dailyRate;
    }

    const insuranceFee = (vehicle.pricing.insuranceFee || 0) * numberOfDays;
    const deposit = vehicle.pricing.deposit;
    const totalPrice = subtotal + insuranceFee + deposit;

    // Create Stripe payment intent
    if (!stripe) {
      return NextResponse.json(
        { success: false, error: 'Payment system is not configured' },
        { status: 500 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert to cents
      currency: vehicle.pricing.currency.toLowerCase(),
      metadata: {
        vehicleId: validatedData.vehicleId,
        userId: user.id,
        pickupDate: validatedData.pickupDate,
        returnDate: validatedData.returnDate,
        numberOfDays: numberOfDays.toString(),
      },
    });

    // Create rental
    const rental = await createCarRental({
      vehicleId: validatedData.vehicleId,
      userId: user.id,
      driverInfo: validatedData.driverInfo,
      pickupDate: validatedData.pickupDate,
      pickupTime: validatedData.pickupTime,
      returnDate: validatedData.returnDate,
      returnTime: validatedData.returnTime,
      numberOfDays,
      pickupLocation: validatedData.pickupLocation,
      returnLocation: validatedData.returnLocation,
      pricing: {
        dailyRate,
        totalDays: numberOfDays,
        subtotal,
        insuranceFee,
        deposit,
        totalPrice,
        currency: vehicle.pricing.currency,
      },
      paymentInfo: {
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'pending',
      },
      status: 'pending',
      additionalDrivers: validatedData.additionalDrivers,
      specialRequests: validatedData.specialRequests,
    });

    return NextResponse.json(
      {
        success: true,
        rental,
        paymentIntent: {
          clientSecret: paymentIntent.client_secret,
          amount: totalPrice,
          currency: vehicle.pricing.currency,
        },
        message: 'Rental created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating rental:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create rental' },
      { status: 500 }
    );
  }
}

// GET /api/cars/rentals - Get user's rentals
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const rentals = await getCarRentalsByUserId(user.id);

    return NextResponse.json({
      success: true,
      rentals,
      count: rentals.length,
    });
  } catch (error) {
    console.error('Error fetching rentals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rentals' },
      { status: 500 }
    );
  }
}

