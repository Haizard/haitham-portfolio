
import { NextResponse, type NextRequest } from 'next/server';
import { addReview, getReviewsForFreelancer } from '@/lib/reviews-data';
import { z } from 'zod';
import { getJobById } from '@/lib/jobs-data';

// This would come from auth in a real app
const MOCK_CURRENT_USER_AS_CLIENT_ID = "mockClient123";

const reviewSubmitSchema = z.object({
  jobId: z.string().min(1, "Job ID is required."),
  revieweeId: z.string().min(1, "User being reviewed is required."),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters.").max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = reviewSubmitSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid review data.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { jobId, revieweeId, rating, comment } = validation.data;
    const reviewerId = MOCK_CURRENT_USER_AS_CLIENT_ID; // In real app, get from session

    const job = await getJobById(jobId);
    if (!job) {
      return NextResponse.json({ message: "Associated job not found." }, { status: 404 });
    }
    if (job.clientId !== reviewerId) {
      return NextResponse.json({ message: "Unauthorized: You are not the client for this job." }, { status: 403 });
    }
    if (job.status !== 'completed') {
      return NextResponse.json({ message: "Cannot leave a review for a job that is not completed." }, { status: 400 });
    }
    if (job.clientReviewId) {
      return NextResponse.json({ message: "You have already submitted a review for this job." }, { status: 409 });
    }

    const newReview = await addReview({
      jobId,
      reviewerId,
      revieweeId,
      reviewerRole: 'client',
      rating,
      comment,
    });

    return NextResponse.json(newReview, { status: 201 });

  } catch (error: any) {
    console.error('[API /reviews POST] Error:', error);
    return NextResponse.json({ message: `Failed to submit review: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const freelancerId = searchParams.get('freelancerId');

  if (!freelancerId) {
    return NextResponse.json({ message: "freelancerId query parameter is required." }, { status: 400 });
  }

  try {
    const reviews = await getReviewsForFreelancer(freelancerId);
    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error('[API /reviews GET] Error:', error);
    return NextResponse.json({ message: `Failed to fetch reviews: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}
