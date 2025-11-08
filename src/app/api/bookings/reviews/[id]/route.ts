// src/app/api/bookings/reviews/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import {
  getBookingReviewById,
  updateBookingReview,
  deleteBookingReview,
  markReviewHelpful,
  addOwnerResponse,
} from '@/lib/booking-reviews-data';

// Validation schema for review updates
const reviewUpdateSchema = z.object({
  ratings: z.object({
    overall: z.number().min(1).max(5).optional(),
    cleanliness: z.number().min(1).max(5).optional(),
    service: z.number().min(1).max(5).optional(),
    valueForMoney: z.number().min(1).max(5).optional(),
    comfort: z.number().min(1).max(5).optional(),
    location: z.number().min(1).max(5).optional(),
    condition: z.number().min(1).max(5).optional(),
    experience: z.number().min(1).max(5).optional(),
  }).optional(),
  comment: z.string().min(10).max(2000).optional(),
  images: z.array(z.string().url()).optional(),
  status: z.enum(['published', 'flagged', 'hidden']).optional(),
  flaggedReason: z.string().optional(),
});

const ownerResponseSchema = z.object({
  comment: z.string().min(10).max(1000),
  responderName: z.string().min(1),
});

/**
 * GET /api/bookings/reviews/[id]
 * Get a single review by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await getBookingReviewById(id);

    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json(review, { status: 200 });
  } catch (error: any) {
    console.error('[API /bookings/reviews/[id] GET] Error:', error);
    return NextResponse.json(
      { message: `Failed to fetch review: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/bookings/reviews/[id]
 * Update a review (user can edit their own, admin can moderate)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.user || !session.user.id) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const review = await getBookingReviewById(id);

    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    const body = await request.json();

    // Check if this is a helpful mark action
    if (body.action === 'mark_helpful') {
      await markReviewHelpful(id, session.user.id);
      const updatedReview = await getBookingReviewById(id);
      return NextResponse.json(updatedReview, { status: 200 });
    }

    // Check if this is an owner response
    if (body.action === 'add_response') {
      const validation = ownerResponseSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json(
          {
            message: 'Invalid response data',
            errors: validation.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      // TODO: Verify user is the owner of the property/vehicle/tour
      const updatedReview = await addOwnerResponse(id, validation.data);
      return NextResponse.json(updatedReview, { status: 200 });
    }

    // Regular review update
    const validation = reviewUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          message: 'Invalid review data',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Check authorization
    const isAdmin = session.user.role === 'admin';
    const isOwner = review.userId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { message: 'You can only edit your own reviews' },
        { status: 403 }
      );
    }

    // Users can only edit content, admins can moderate
    const updates: any = {};
    if (isOwner) {
      if (validation.data.ratings) updates.ratings = validation.data.ratings;
      if (validation.data.comment) updates.comment = validation.data.comment;
      if (validation.data.images) updates.images = validation.data.images;
    }

    if (isAdmin) {
      // Admins can update status and flagged reason
      if (validation.data.status) updates.status = validation.data.status;
      if (validation.data.flaggedReason) updates.flaggedReason = validation.data.flaggedReason;
      // Admins can also edit content if needed
      if (validation.data.ratings) updates.ratings = validation.data.ratings;
      if (validation.data.comment) updates.comment = validation.data.comment;
      if (validation.data.images) updates.images = validation.data.images;
    }

    const updatedReview = await updateBookingReview(id, updates);

    return NextResponse.json(updatedReview, { status: 200 });
  } catch (error: any) {
    console.error('[API /bookings/reviews/[id] PATCH] Error:', error);
    return NextResponse.json(
      { message: `Failed to update review: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bookings/reviews/[id]
 * Delete a review (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session.user || !session.user.id) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    // Only admins can delete reviews
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only administrators can delete reviews' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const success = await deleteBookingReview(id);

    if (!success) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('[API /bookings/reviews/[id] DELETE] Error:', error);
    return NextResponse.json(
      { message: `Failed to delete review: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

