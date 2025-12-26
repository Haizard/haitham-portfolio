// src/app/api/restaurants/[restaurantId]/reviews/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { addRestaurantReview, getReviewsForRestaurant } from '@/lib/restaurants-data';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getSession } from '@/lib/session';

// Schema for validating a new product review submission
const reviewSubmitSchema = z.object({
  rating: z.coerce.number().min(1, "Rating must be between 1 and 5.").max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters.").max(2000),
  // In a real app, reviewerId would come from the session, not the body
  reviewerId: z.string().min(1, "Reviewer ID is required."),
  reviewerName: z.string().min(1, "Reviewer name is required."),
  reviewerAvatar: z.string().url().optional(),
});

// GET handler to fetch all reviews for a product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params;
    if (!ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ message: "Invalid Restaurant ID provided for reviews." }, { status: 400 });
    }
    const reviews = await getReviewsForRestaurant(restaurantId);
    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error(`[API /restaurants/${params.restaurantId}/reviews GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch reviews: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}

// POST handler to submit a new review for a product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const { restaurantId } = await params;
    if (!ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ message: "Invalid Restaurant ID provided for review submission." }, { status: 400 });
    }

    const body = await request.json();
    const validation = reviewSubmitSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid review data.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const newReview = await addRestaurantReview({
      restaurantId,
      ...validation.data
    });

    return NextResponse.json(newReview, { status: 201 });

  } catch (error: any) {
    console.error(`[API /restaurants/${params.restaurantId}/reviews POST] Error:`, error);
    return NextResponse.json({ message: `Failed to submit review: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}
