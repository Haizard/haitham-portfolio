// src/app/api/tours/[tourIdOrSlug]/reviews/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getBookingReviews, getReviewStatistics } from '@/lib/booking-reviews-data';
import { getTourByIdOrSlug } from '@/lib/tours-data';

/**
 * GET /api/tours/[tourIdOrSlug]/reviews
 * Get all reviews for a specific tour with statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tourIdOrSlug: string }> }
) {
  try {
    const { tourIdOrSlug } = await params;
    
    // Get tour to get the actual ID
    const tour = await getTourByIdOrSlug(tourIdOrSlug);
    if (!tour) {
      return NextResponse.json({ message: 'Tour not found' }, { status: 404 });
    }
    
    const { searchParams } = new URL(request.url);
    
    const limit = searchParams.get('limit');
    const skip = searchParams.get('skip');
    const minRating = searchParams.get('minRating');
    
    const filters: any = {
      reviewType: 'tour' as const,
      targetId: tour.id!,
      status: 'published',
    };
    
    if (limit) filters.limit = parseInt(limit);
    if (skip) filters.skip = parseInt(skip);
    if (minRating) filters.minRating = parseInt(minRating);
    
    const [reviews, statistics] = await Promise.all([
      getBookingReviews(filters),
      getReviewStatistics('tour', tour.id!),
    ]);
    
    return NextResponse.json(
      {
        reviews,
        statistics,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API /tours/[tourIdOrSlug]/reviews GET] Error:', error);
    return NextResponse.json(
      { message: `Failed to fetch reviews: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

