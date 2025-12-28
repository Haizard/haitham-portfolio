import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/rbac';
import {
  createTransferBooking,
  getTransferBookingsByUserId,
  getTransferVehicleById,
  checkTransferVehicleAvailability,
} from '@/lib/transfers-data';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
  })
  : null;

const passengerInfoSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  numberOfPassengers: z.number().int().min(1),
  numberOfLuggage: z.number().int().min(0),
});

const locationSchema = z.object({
  address: z.string().min(5),
  city: z.string().min(2),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
  flightNumber: z.string().optional(),
  terminal: z.string().optional(),
});

const createBookingSchema = z.object({
  vehicleId: z.string().min(1),
  transferType: z.enum(['airport_to_city', 'city_to_airport', 'point_to_point', 'hourly']),
  pickupLocation: locationSchema,
  dropoffLocation: locationSchema,
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  pickupTime: z.string().regex(/^\d{2}:\d{2}$/),
  estimatedDuration: z.number().int().min(1), // minutes
  estimatedDistance: z.number().min(0), // kilometers
  passengerInfo: passengerInfoSchema,
  specialRequests: z.string().max(500).optional(),
  childSeatsRequired: z.number().int().min(0).optional(),
  wheelchairAccessible: z.boolean().optional(),
});

// POST /api/transfers/bookings - Create transfer booking
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
      const body = await request.json();
      const validatedData = createBookingSchema.parse(body);

      // Get vehicle
      const authResult = await requireAuth();
      if (authResult instanceof NextResponse) {
        return authResult;
      }

      const vehicle = await getTransferVehicleById(validatedData.vehicleId);
      if (!vehicle) {
        return NextResponse.json({
          success: false,
          message: 'Transfer vehicle not found',
        }, { status: 404 });
      }

      // Check capacity
      if (validatedData.passengerInfo.numberOfPassengers > vehicle.capacity.passengers) {
        return NextResponse.json({
          success: false,
          message: `Vehicle capacity exceeded. Maximum ${vehicle.capacity.passengers} passengers.`,
        }, { status: 400 });
      }

      if (validatedData.passengerInfo.numberOfLuggage > vehicle.capacity.luggage) {
        return NextResponse.json({
          success: false,
          message: `Luggage capacity exceeded. Maximum ${vehicle.capacity.luggage} pieces.`,
        }, { status: 400 });
      }

      // Check availability
      const availability = await checkTransferVehicleAvailability(
        validatedData.vehicleId,
        validatedData.pickupDate,
        validatedData.pickupTime
      );

      if (!availability.available) {
        return NextResponse.json({
          success: false,
          message: 'Vehicle is not available for the selected date and time',
        }, { status: 400 });
      }

      // Calculate pricing
      const basePrice = vehicle.pricing.basePrice;
      const distanceCharge = validatedData.estimatedDistance * vehicle.pricing.pricePerKm;

      // Check for airport surcharge
      let airportSurcharge = 0;
      if (
        (validatedData.transferType === 'airport_to_city' ||
          validatedData.transferType === 'city_to_airport') &&
        vehicle.pricing.airportSurcharge
      ) {
        airportSurcharge = vehicle.pricing.airportSurcharge;
      }

      // Check for night surcharge (10pm - 6am)
      let nightSurcharge = 0;
      const pickupHour = parseInt(validatedData.pickupTime.split(':')[0]);
      if ((pickupHour >= 22 || pickupHour < 6) && vehicle.pricing.nightSurcharge) {
        nightSurcharge = vehicle.pricing.nightSurcharge;
      }

      const totalPrice = basePrice + distanceCharge + airportSurcharge + nightSurcharge;

      // Create Stripe payment intent
      if (!stripe) {
        return NextResponse.json({
          success: false,
          message: 'Payment system is not configured',
        }, { status: 500 });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalPrice * 100), // Convert to cents
        currency: vehicle.pricing.currency.toLowerCase(),
        metadata: {
          vehicleId: validatedData.vehicleId,
          userId: authResult.user.id,
          transferType: validatedData.transferType,
          pickupDate: validatedData.pickupDate,
          pickupTime: validatedData.pickupTime,
        },
      });

      // Create booking
      const booking = await createTransferBooking({
        vehicleId: validatedData.vehicleId,
        userId: authResult.user.id,
        transferType: validatedData.transferType,
        pickupLocation: validatedData.pickupLocation,
        dropoffLocation: validatedData.dropoffLocation,
        pickupDate: validatedData.pickupDate,
        pickupTime: validatedData.pickupTime,
        estimatedDuration: validatedData.estimatedDuration,
        estimatedDistance: validatedData.estimatedDistance,
        passengerInfo: validatedData.passengerInfo,
        specialRequests: validatedData.specialRequests,
        childSeatsRequired: validatedData.childSeatsRequired,
        wheelchairAccessible: validatedData.wheelchairAccessible,
        pricing: {
          basePrice,
          distanceCharge,
          airportSurcharge,
          nightSurcharge,
          totalPrice,
          currency: vehicle.pricing.currency,
        },
        paymentInfo: {
          paymentIntentId: paymentIntent.id,
          paymentStatus: 'pending',
        },
        status: 'pending',
      });

      return NextResponse.json({
        success: true,
        booking,
        clientSecret: paymentIntent.client_secret,
        message: 'Transfer booking created successfully',
      }, { status: 201 });

    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json({
          success: false,
          message: 'Validation error',
          errors: error.errors,
        }, { status: 400 });
      }

      console.error('Error creating transfer booking:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to create transfer booking',
      }, { status: 500 });
    }
  }

// GET /api/transfers/bookings - Get user's transfer bookings
export async function GET(request: NextRequest) {
    try {
      const authResult = await requireAuth();
      if (authResult instanceof NextResponse) {
        return authResult;
      }

      const bookings = await getTransferBookingsByUserId(authResult.user.id);

      return NextResponse.json({
        success: true,
        bookings,
        count: bookings.length,
      });

    } catch (error) {
      console.error('Error fetching transfer bookings:', error);
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch transfer bookings',
      }, { status: 500 });
    }
  }

