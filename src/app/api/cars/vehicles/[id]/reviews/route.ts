// src/app/api/cars/vehicles/[id]/reviews/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getBookingReviews, getReviewStatistics } from '@/lib/booking-reviews-data';

/**
 * GET /api/cars/vehicles/[id]/reviews
 * Get all reviews for a specific vehicle with statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    
    const limit = searchParams.get('limit');
    const skip = searchParams.get('skip');
    const minRating = searchParams.get('minRating');
    
    const filters: any = {
      reviewType: 'car_rental' as const,
      targetId: id,
      status: 'published',
    };
    
    if (limit) filters.limit = parseInt(limit);
    if (skip) filters.skip = parseInt(skip);
    if (minRating) filters.minRating = parseInt(minRating);
    
    const [reviews, statistics] = await Promise.all([
      getBookingReviews(filters),
      getReviewStatistics('car_rental', id),
    ]);
    
    return NextResponse.json(
      {
        reviews,
        statistics,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API /cars/vehicles/[id]/reviews GET] Error:', error);
    return NextResponse.json(
      { message: `Failed to fetch reviews: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

