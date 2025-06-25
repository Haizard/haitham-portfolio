
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import { updateJobReviewStatus } from './jobs-data';
import { updateFreelancerProfile } from './user-profile-data';

const REVIEWS_COLLECTION = 'reviews';

export type ReviewerRole = 'client' | 'freelancer';

export interface Review {
  _id?: ObjectId;
  id?: string;
  jobId: string;
  reviewerId: string; // ID of the user leaving the review (e.g., mockClient123)
  revieweeId: string; // ID of the user being reviewed (e.g., mockFreelancer456)
  reviewerRole: ReviewerRole;
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
  // Enriched data
  reviewerName?: string;
  reviewerAvatar?: string;
}

function docToReview(doc: any): Review {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as Review;
}

export async function addReview(reviewData: Omit<Review, 'id' | '_id' | 'createdAt'>): Promise<Review> {
  const reviewsCollection = await getCollection<Omit<Review, 'id' | '_id'>>(REVIEWS_COLLECTION);
  
  const now = new Date();
  const docToInsert = { ...reviewData, createdAt: now };

  const result = await reviewsCollection.insertOne(docToInsert as any);
  const newReview = { _id: result.insertedId, id: result.insertedId.toString(), ...docToInsert };

  // After adding the review, trigger updates
  // 1. Update the job to note that a review has been left
  await updateJobReviewStatus(newReview.jobId, newReview.reviewerRole, newReview.id!);

  // 2. Recalculate and update the freelancer's average rating
  // This should only happen when a client reviews a freelancer
  if (newReview.reviewerRole === 'client') {
    const allReviews = await getReviewsForFreelancer(newReview.revieweeId);
    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    await updateFreelancerProfile(newReview.revieweeId, {
      averageRating: parseFloat(averageRating.toFixed(2)),
      reviewCount: totalReviews,
    });
  }

  return newReview;
}

export async function getReviewsForFreelancer(freelancerId: string): Promise<Review[]> {
  const collection = await getCollection<Review>(REVIEWS_COLLECTION);
  // For now, only fetch reviews left by clients for freelancers
  const reviewDocs = await collection.find({ revieweeId: freelancerId, reviewerRole: 'client' }).sort({ createdAt: -1 }).toArray();
  // In a real app, you would enrich with reviewer details (name, avatar) from the users collection
  return reviewDocs.map(doc => {
      const review = docToReview(doc);
      // Mock enrichment
      review.reviewerName = "Mock Client";
      review.reviewerAvatar = `https://placehold.co/100x100.png?text=MC`;
      return review;
  });
}
