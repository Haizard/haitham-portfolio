
import { NextResponse, type NextRequest } from 'next/server';
import { addProductReview, getReviewsForProduct } from '@/lib/product-reviews-data';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

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
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    // Note: productId from the URL could be a slug. The review system requires an ObjectId.
    // The calling component on the product detail page MUST fetch the product by slug first,
    // then use its actual ObjectId to call this review endpoint.
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ message: "Invalid Product ID provided for reviews." }, { status: 400 });
    }
    const reviews = await getReviewsForProduct(productId);
    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error(`[API /products/reviews GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch reviews: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}

// POST handler to submit a new review for a product
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ message: "Invalid Product ID provided for review submission." }, { status: 400 });
    }

    const body = await request.json();
    const validation = reviewSubmitSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid review data.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const newReview = await addProductReview({
      productId,
      ...validation.data
    });

    return NextResponse.json(newReview, { status: 201 });

  } catch (error: any) {
    console.error(`[API /products/reviews POST] Error:`, error);
    return NextResponse.json({ message: `Failed to submit review: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}
