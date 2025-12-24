
import { NextResponse, type NextRequest } from 'next/server';
import { createTourBooking, getAllTourBookings, getTourById } from '@/lib/tours-data';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth-middleware';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  })
  : null;

// Validation schema for tour booking creation
const tourBookingCreateSchema = z.object({
  tourId: z.string().min(1, 'Tour ID is required'),
  tourDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  tourTime: z.string().optional(),
  participants: z.object({
    adults: z.number().int().min(0),
    children: z.number().int().min(0),
    seniors: z.number().int().min(0),
  }),
  contactInfo: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().min(1, 'Phone number is required'),
  }),
  specialRequests: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
});

type TourBookingCreateInput = z.infer<typeof tourBookingCreateSchema>;

// POST /api/tours/bookings - Create a new tour booking
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();
    const validatedData = tourBookingCreateSchema.parse(body);

    // Get tour details
    const tour = await getTourById(validatedData.tourId);
    if (!tour) {
      return NextResponse.json({ message: 'Tour not found' }, { status: 404 });
    }

    if (!tour.isActive) {
      return NextResponse.json({ message: 'This tour is not currently available' }, { status: 400 });
    }

    // Calculate total participants
    const totalParticipants =
      validatedData.participants.adults +
      validatedData.participants.children +
      validatedData.participants.seniors;

    if (totalParticipants === 0) {
      return NextResponse.json({ message: 'At least one participant is required' }, { status: 400 });
    }

    // Calculate pricing (using tour base price with discounts for children/seniors)
    const adultPrice = tour.price;
    const childPrice = tour.price * 0.7; // 30% discount for children
    const seniorPrice = tour.price * 0.85; // 15% discount for seniors

    const subtotal =
      (validatedData.participants.adults * adultPrice) +
      (validatedData.participants.children * childPrice) +
      (validatedData.participants.seniors * seniorPrice);

    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    // Create Stripe Payment Intent
    if (!stripe) {
      return NextResponse.json(
        { message: 'Payment system is not configured' },
        { status: 500 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        tourId: validatedData.tourId,
        tourName: tour.name,
        userId: session.userId,
        tourDate: validatedData.tourDate,
        totalParticipants: totalParticipants.toString(),
      },
    });

    // Create booking
    const booking = await createTourBooking({
      tourId: validatedData.tourId,
      tourName: tour.name,
      tourSlug: tour.slug,
      userId: session.userId,
      tourDate: validatedData.tourDate,
      tourTime: validatedData.tourTime,
      participants: validatedData.participants,
      totalParticipants,
      pricing: {
        adultPrice,
        childPrice,
        seniorPrice,
        subtotal,
        tax,
        total,
      },
      contactInfo: validatedData.contactInfo,
      specialRequests: validatedData.specialRequests,
      dietaryRestrictions: validatedData.dietaryRestrictions,
      accessibilityNeeds: validatedData.accessibilityNeeds,
      paymentInfo: {
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: 'pending',
      },
      status: 'pending',
    });

    return NextResponse.json({
      booking,
      clientSecret: paymentIntent.client_secret,
    }, { status: 201 });

  } catch (error: any) {
    console.error('[API /api/tours/bookings POST] Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: `Failed to create tour booking: ${error.message}` },
      { status: 500 }
    );
  }
}

// GET /api/tours/bookings - Get user's tour bookings or filter by query params
export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const { searchParams } = new URL(request.url);

    const filters: any = {};

    // If user is not admin, only show their bookings
    if (!session.roles.includes('admin')) {
      filters.userId = session.userId;
    } else {
      // Admin can filter by userId
      const userId = searchParams.get('userId');
      if (userId) {
        filters.userId = userId;
      }
    }

    // Additional filters
    const tourId = searchParams.get('tourId');
    const status = searchParams.get('status');
    const tourDate = searchParams.get('tourDate');

    if (tourId) filters.tourId = tourId;
    if (status) filters.status = status;
    if (tourDate) filters.tourDate = tourDate;

    const bookings = await getAllTourBookings(filters);

    return NextResponse.json(bookings);

  } catch (error: any) {
    console.error('[API /api/tours/bookings GET] Error:', error);
    return NextResponse.json(
      { message: `Failed to fetch tour bookings: ${error.message}` },
      { status: 500 }
    );
  }
}

