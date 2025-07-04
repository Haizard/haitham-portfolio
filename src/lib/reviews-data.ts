
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import { updateJobReviewStatus } from './jobs-data';
import { updateFreelancerProfile, getFreelancerProfile } from './user-profile-data';
import { updateClientProfile, getClientProfile } from './client-profile-data';

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

  // 2. Recalculate and update the reviewed user's average rating
  if (newReview.reviewerRole === 'client') {
    // Client is reviewing a freelancer
    const allReviews = await getReviewsForFreelancer(newReview.revieweeId);
    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    await updateFreelancerProfile(newReview.revieweeId, {
      averageRating: parseFloat(averageRating.toFixed(2)),
      reviewCount: totalReviews,
    });
  } else if (newReview.reviewerRole === 'freelancer') {
    // Freelancer is reviewing a client
    const allReviews = await getReviewsForClient(newReview.revieweeId);
    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    await updateClientProfile(newReview.revieweeId, {
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
  
  const reviewerIds = [...new Set(reviewDocs.map(r => r.reviewerId))];
  if(reviewerIds.length === 0) return reviewDocs.map(docToReview);

  // In a real app, you would have a central users collection. Here we fetch from client profiles.
  const reviewerProfiles = await Promise.all(reviewerIds.map(id => getClientProfile(id)));
  const reviewerMap = new Map(reviewerProfiles.map(p => p ? [p.userId, p] : [null, null]));

  // Enrich with reviewer details
  return reviewDocs.map(doc => {
      const review = docToReview(doc);
      const reviewer = reviewerMap.get(review.reviewerId);
      review.reviewerName = reviewer?.name || "Client";
      review.reviewerAvatar = reviewer?.avatarUrl;
      return review;
  });
}

// New function to get reviews FOR a client
export async function getReviewsForClient(clientId: string): Promise<Review[]> {
  const collection = await getCollection<Review>(REVIEWS_COLLECTION);
  // Fetch reviews where the client was the one being reviewed
  const reviewDocs = await collection.find({ revieweeId: clientId, reviewerRole: 'freelancer' }).sort({ createdAt: -1 }).toArray();
  
  const reviewerIds = [...new Set(reviewDocs.map(r => r.reviewerId))];
  if(reviewerIds.length === 0) return reviewDocs.map(docToReview);

  // Fetch from freelancer profiles
  const reviewerProfiles = await Promise.all(reviewerIds.map(id => getFreelancerProfile(id)));
  const reviewerMap = new Map(reviewerProfiles.map(p => p ? [p.userId, p] : [null, null]));

  // Enrich with reviewer details
  return reviewDocs.map(doc => {
      const review = docToReview(doc);
      const reviewer = reviewerMap.get(review.reviewerId);
      review.reviewerName = reviewer?.name || "Freelancer";
      review.reviewerAvatar = reviewer?.avatarUrl;
      return review;
  });
}
