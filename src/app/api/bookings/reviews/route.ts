// src/app/api/bookings/reviews/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import {
  createBookingReview,
  getBookingReviews,
  type ReviewType,
} from '@/lib/booking-reviews-data';
import { getHotelBookingById } from '@/lib/hotels-data';
import { getCarRentalById } from '@/lib/cars-data';
import { getTransferBookingById } from '@/lib/transfers-data';
import { getTourBookingById } from '@/lib/tours-data';

// Validation schema for review submission
const reviewSubmitSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reviewType: z.enum(['hotel', 'car_rental', 'tour', 'transfer']),
  targetId: z.string().min(1, 'Target ID is required'),
  ratings: z.object({
    overall: z.number().min(1).max(5),
    cleanliness: z.number().min(1).max(5).optional(),
    service: z.number().min(1).max(5).optional(),
    valueForMoney: z.number().min(1).max(5).optional(),
    comfort: z.number().min(1).max(5).optional(),
    location: z.number().min(1).max(5).optional(),
    condition: z.number().min(1).max(5).optional(),
    experience: z.number().min(1).max(5).optional(),
  }),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(2000),
  images: z.array(z.string().url()).optional(),
});

/**
 * POST /api/bookings/reviews
 * Submit a new review for a completed booking
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.user || !session.user.id) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const validation = reviewSubmitSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: 'Invalid review data',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { bookingId, reviewType, targetId, ratings, comment, images } = validation.data;

    // Verify booking exists and belongs to user
    let booking: any = null;
    let bookingUserId: string | null = null;

    switch (reviewType) {
      case 'hotel':
        booking = await getHotelBookingById(bookingId);
        bookingUserId = booking?.userId;
        break;
      case 'car_rental':
        booking = await getCarRentalById(bookingId);
        bookingUserId = booking?.userId;
        break;
      case 'transfer':
        booking = await getTransferBookingById(bookingId);
        bookingUserId = booking?.userId;
        break;
      case 'tour':
        booking = await getTourBookingById(bookingId);
        bookingUserId = booking?.userId;
        break;
    }

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    if (bookingUserId !== session.user.id) {
      return NextResponse.json(
        { message: 'You can only review your own bookings' },
        { status: 403 }
      );
    }

    // Check if booking is completed
    if (booking.status !== 'completed' && booking.status !== 'confirmed') {
      return NextResponse.json(
        { message: 'You can only review completed bookings' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this booking
    const existingReviews = await getBookingReviews({ bookingId });
    if (existingReviews.length > 0) {
      return NextResponse.json(
        { message: 'You have already reviewed this booking' },
        { status: 409 }
      );
    }

    // Create the review
    const newReview = await createBookingReview({
      bookingId,
      userId: session.user.id,
      reviewType,
      targetId,
      ratings,
      comment,
      images,
      userName: session.user.name || 'Anonymous',
      userAvatar: session.user.avatar,
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error: any) {
    console.error('[API /bookings/reviews POST] Error:', error);
    return NextResponse.json(
      { message: `Failed to submit review: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings/reviews
 * Get reviews with optional filters
 * Query params: reviewType, targetId, userId, bookingId, status, minRating, limit, skip
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters: any = {};
    
    const reviewType = searchParams.get('reviewType');
    if (reviewType) filters.reviewType = reviewType as ReviewType;
    
    const targetId = searchParams.get('targetId');
    if (targetId) filters.targetId = targetId;
    
    const userId = searchParams.get('userId');
    if (userId) filters.userId = userId;
    
    const bookingId = searchParams.get('bookingId');
    if (bookingId) filters.bookingId = bookingId;
    
    const status = searchParams.get('status');
    if (status) filters.status = status;
    
    const minRating = searchParams.get('minRating');
    if (minRating) filters.minRating = parseInt(minRating);
    
    const limit = searchParams.get('limit');
    if (limit) filters.limit = parseInt(limit);
    
    const skip = searchParams.get('skip');
    if (skip) filters.skip = parseInt(skip);
    
    // Default to only published reviews for public access
    if (!filters.status) {
      filters.status = 'published';
    }
    
    const reviews = await getBookingReviews(filters);
    
    return NextResponse.json(reviews, { status: 200 });
  } catch (error: any) {
    console.error('[API /bookings/reviews GET] Error:', error);
    return NextResponse.json(
      { message: `Failed to fetch reviews: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

