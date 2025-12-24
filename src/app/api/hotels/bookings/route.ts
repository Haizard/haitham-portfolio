import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/rbac';
import {
  createHotelBooking,
  getHotelBookingsByUserId,
  checkRoomAvailability,
  getRoomById,
  getPropertyById
} from '@/lib/hotels-data';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
  })
  : null;

// Validation schemas
const guestInfoSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(5),
  country: z.string().min(2),
});

const createBookingSchema = z.object({
  propertyId: z.string().min(1),
  roomId: z.string().min(1),
  guestInfo: guestInfoSchema,
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.object({
    adults: z.number().int().min(1),
    children: z.number().int().min(0),
    infants: z.number().int().min(0),
  }),
  specialRequests: z.string().optional(),
});

// POST /api/hotels/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    // Verify property exists
    const property = await getPropertyById(validatedData.propertyId);
    if (!property) {
      return NextResponse.json({
        success: false,
        message: 'Property not found',
      }, { status: 404 });
    }

    // Verify room exists
    const room = await getRoomById(validatedData.roomId);
    if (!room) {
      return NextResponse.json({
        success: false,
        message: 'Room not found',
      }, { status: 404 });
    }

    // Verify room belongs to property
    if (room.propertyId !== validatedData.propertyId) {
      return NextResponse.json({
        success: false,
        message: 'Room does not belong to this property',
      }, { status: 400 });
    }

    // Check if room is active
    if (!room.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Room is not available for booking',
      }, { status: 400 });
    }

    // Validate dates
    const checkIn = new Date(validatedData.checkInDate);
    const checkOut = new Date(validatedData.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return NextResponse.json({
        success: false,
        message: 'Check-in date cannot be in the past',
      }, { status: 400 });
    }

    if (checkOut <= checkIn) {
      return NextResponse.json({
        success: false,
        message: 'Check-out date must be after check-in date',
      }, { status: 400 });
    }

    // Calculate number of nights
    const numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Check minimum/maximum stay
    if (numberOfNights < room.availability.minimumStay) {
      return NextResponse.json({
        success: false,
        message: `Minimum stay is ${room.availability.minimumStay} night(s)`,
      }, { status: 400 });
    }

    if (room.availability.maximumStay && numberOfNights > room.availability.maximumStay) {
      return NextResponse.json({
        success: false,
        message: `Maximum stay is ${room.availability.maximumStay} night(s)`,
      }, { status: 400 });
    }

    // Check capacity
    const totalGuests = validatedData.guests.adults + validatedData.guests.children;
    if (totalGuests > room.capacity.adults + room.capacity.children) {
      return NextResponse.json({
        success: false,
        message: 'Number of guests exceeds room capacity',
      }, { status: 400 });
    }

    // Check availability
    const availability = await checkRoomAvailability(
      validatedData.roomId,
      validatedData.checkInDate,
      validatedData.checkOutDate
    );

    if (!availability.available) {
      return NextResponse.json({
        success: false,
        message: 'Room is not available for the selected dates',
      }, { status: 400 });
    }

    // Calculate pricing
    const roomPrice = room.pricing.basePrice * numberOfNights;
    const taxAmount = roomPrice * (room.pricing.taxRate / 100);
    const cleaningFee = room.pricing.cleaningFee || 0;

    // Calculate extra guest fee if applicable
    let extraGuestFee = 0;
    if (room.pricing.extraGuestFee && totalGuests > room.capacity.adults) {
      const extraGuests = totalGuests - room.capacity.adults;
      extraGuestFee = room.pricing.extraGuestFee * extraGuests * numberOfNights;
    }

    const totalPrice = roomPrice + taxAmount + cleaningFee + extraGuestFee;

    // Create Stripe payment intent
    if (!stripe) {
      return NextResponse.json({
        success: false,
        message: 'Payment system is not configured',
      }, { status: 500 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // Convert to cents
      currency: room.pricing.currency.toLowerCase(),
      metadata: {
        propertyId: validatedData.propertyId,
        roomId: validatedData.roomId,
        userId: authResult.user.id,
        checkInDate: validatedData.checkInDate,
        checkOutDate: validatedData.checkOutDate,
      },
    });

    // Create booking
    const booking = await createHotelBooking({
      propertyId: validatedData.propertyId,
      roomId: validatedData.roomId,
      userId: authResult.user.id,
      guestInfo: validatedData.guestInfo,
      checkInDate: validatedData.checkInDate,
      checkOutDate: validatedData.checkOutDate,
      numberOfNights,
      guests: validatedData.guests,
      pricing: {
        roomPrice,
        taxAmount,
        cleaningFee,
        extraGuestFee,
        totalPrice,
        currency: room.pricing.currency,
      },
      paymentInfo: {
        paymentIntentId: paymentIntent.id,
        paymentStatus: 'pending',
      },
      status: 'pending',
      specialRequests: validatedData.specialRequests,
    });

    return NextResponse.json({
      success: true,
      booking,
      paymentIntent: {
        clientSecret: paymentIntent.client_secret,
        amount: totalPrice,
        currency: room.pricing.currency,
      },
      message: 'Booking created successfully',
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Error creating booking:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create booking',
    }, { status: 500 });
  }
}

// GET /api/hotels/bookings - Get user's bookings
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Get user's bookings
    const bookings = await getHotelBookingsByUserId(authResult.user.id);

    return NextResponse.json({
      success: true,
      bookings,
      count: bookings.length,
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch bookings',
    }, { status: 500 });
  }
}

