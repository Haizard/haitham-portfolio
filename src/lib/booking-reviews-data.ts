// src/lib/booking-reviews-data.ts
import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';

const BOOKING_REVIEWS_COLLECTION = 'bookingReviews';

export type ReviewType = 'hotel' | 'car_rental' | 'tour' | 'transfer';
export type ReviewStatus = 'published' | 'flagged' | 'hidden';

export interface BookingReview {
  _id?: ObjectId;
  id?: string;
  
  // Reference Information
  bookingId: string; // ID of the booking (hotel/car/transfer/tour booking)
  userId: string; // ID of the user who left the review
  reviewType: ReviewType; // Type of booking being reviewed
  targetId: string; // ID of the property/vehicle/tour being reviewed
  
  // Ratings (1-5 scale)
  ratings: {
    overall: number; // Required overall rating
    cleanliness?: number; // For hotels
    service?: number; // For all types
    valueForMoney?: number; // For all types
    comfort?: number; // For hotels and cars
    location?: number; // For hotels
    condition?: number; // For cars and transfers
    experience?: number; // For tours
  };
  
  // Review Content
  comment: string; // Review text (min 10 chars)
  images?: string[]; // Optional review images (Cloudinary URLs)
  
  // User Information (denormalized for performance)
  userName: string;
  userAvatar?: string;
  
  // Engagement
  helpful: number; // Count of users who found this helpful
  helpfulBy?: string[]; // Array of user IDs who marked as helpful
  
  // Moderation
  status: ReviewStatus;
  verified: boolean; // True if user actually completed the booking
  flaggedReason?: string; // Reason if flagged
  
  // Response from owner/operator
  ownerResponse?: {
    comment: string;
    respondedAt: string;
    responderName: string;
  };
  
  createdAt: string;
  updatedAt: string;
}

function docToReview(doc: any): BookingReview {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as BookingReview;
}

/**
 * Create a new booking review
 */
export async function createBookingReview(
  reviewData: Omit<BookingReview, 'id' | '_id' | 'createdAt' | 'updatedAt' | 'helpful' | 'status' | 'verified'>
): Promise<BookingReview> {
  const collection = await getCollection<Omit<BookingReview, 'id' | '_id'>>(BOOKING_REVIEWS_COLLECTION);
  
  const now = new Date().toISOString();
  const docToInsert = {
    ...reviewData,
    helpful: 0,
    helpfulBy: [],
    status: 'published' as ReviewStatus,
    verified: true, // TODO: Verify booking completion
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(docToInsert as any);
  const newReview = { _id: result.insertedId, id: result.insertedId.toString(), ...docToInsert };

  // Update the target's rating (property/vehicle/tour)
  await updateTargetRating(reviewData.reviewType, reviewData.targetId);

  return newReview;
}

/**
 * Get all reviews with optional filters
 */
export async function getBookingReviews(filters: {
  reviewType?: ReviewType;
  targetId?: string;
  userId?: string;
  bookingId?: string;
  status?: ReviewStatus;
  minRating?: number;
  limit?: number;
  skip?: number;
}): Promise<BookingReview[]> {
  const collection = await getCollection<BookingReview>(BOOKING_REVIEWS_COLLECTION);
  
  const query: any = {};
  
  if (filters.reviewType) query.reviewType = filters.reviewType;
  if (filters.targetId) query.targetId = filters.targetId;
  if (filters.userId) query.userId = filters.userId;
  if (filters.bookingId) query.bookingId = filters.bookingId;
  if (filters.status) query.status = filters.status;
  if (filters.minRating) query['ratings.overall'] = { $gte: filters.minRating };
  
  let queryBuilder = collection.find(query).sort({ createdAt: -1 });
  
  if (filters.skip) queryBuilder = queryBuilder.skip(filters.skip);
  if (filters.limit) queryBuilder = queryBuilder.limit(filters.limit);
  
  const docs = await queryBuilder.toArray();
  return docs.map(docToReview);
}

/**
 * Get a single review by ID
 */
export async function getBookingReviewById(id: string): Promise<BookingReview | null> {
  if (!ObjectId.isValid(id)) return null;
  
  const collection = await getCollection<BookingReview>(BOOKING_REVIEWS_COLLECTION);
  const doc = await collection.findOne({ _id: new ObjectId(id) });
  return docToReview(doc);
}

/**
 * Update a review (for moderation or editing)
 */
export async function updateBookingReview(
  id: string,
  updates: Partial<Omit<BookingReview, 'id' | '_id' | 'createdAt'>>
): Promise<BookingReview | null> {
  if (!ObjectId.isValid(id)) return null;
  
  const collection = await getCollection<BookingReview>(BOOKING_REVIEWS_COLLECTION);
  
  const updateDoc = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateDoc },
    { returnDocument: 'after' }
  );
  
  if (result) {
    // If rating changed, update target rating
    if (updates.ratings) {
      const review = docToReview(result);
      await updateTargetRating(review.reviewType, review.targetId);
    }
  }
  
  return docToReview(result);
}

/**
 * Delete a review
 */
export async function deleteBookingReview(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  
  const collection = await getCollection<BookingReview>(BOOKING_REVIEWS_COLLECTION);
  
  // Get review before deleting to update target rating
  const review = await getBookingReviewById(id);
  
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  
  if (result.deletedCount > 0 && review) {
    // Update target rating after deletion
    await updateTargetRating(review.reviewType, review.targetId);
    return true;
  }
  
  return false;
}

/**
 * Mark review as helpful
 */
export async function markReviewHelpful(reviewId: string, userId: string): Promise<boolean> {
  if (!ObjectId.isValid(reviewId)) return false;
  
  const collection = await getCollection<BookingReview>(BOOKING_REVIEWS_COLLECTION);
  
  // Check if user already marked as helpful
  const review = await getBookingReviewById(reviewId);
  if (!review) return false;
  
  if (review.helpfulBy?.includes(userId)) {
    // Remove helpful mark
    await collection.updateOne(
      { _id: new ObjectId(reviewId) },
      {
        $pull: { helpfulBy: userId },
        $inc: { helpful: -1 },
        $set: { updatedAt: new Date().toISOString() }
      }
    );
  } else {
    // Add helpful mark
    await collection.updateOne(
      { _id: new ObjectId(reviewId) },
      {
        $addToSet: { helpfulBy: userId },
        $inc: { helpful: 1 },
        $set: { updatedAt: new Date().toISOString() }
      }
    );
  }
  
  return true;
}

/**
 * Add owner response to a review
 */
export async function addOwnerResponse(
  reviewId: string,
  response: { comment: string; responderName: string }
): Promise<BookingReview | null> {
  if (!ObjectId.isValid(reviewId)) return null;
  
  const collection = await getCollection<BookingReview>(BOOKING_REVIEWS_COLLECTION);
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(reviewId) },
    {
      $set: {
        ownerResponse: {
          ...response,
          respondedAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      }
    },
    { returnDocument: 'after' }
  );
  
  return docToReview(result);
}

/**
 * Update target (property/vehicle/tour) rating based on reviews
 */
async function updateTargetRating(reviewType: ReviewType, targetId: string): Promise<void> {
  // Get all published reviews for this target
  const reviews = await getBookingReviews({
    reviewType,
    targetId,
    status: 'published',
  });
  
  if (reviews.length === 0) {
    // No reviews, set rating to 0
    await updateTargetInDatabase(reviewType, targetId, 0, 0);
    return;
  }
  
  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.ratings.overall, 0);
  const averageRating = totalRating / reviews.length;
  
  // Update the target's rating in its respective collection
  await updateTargetInDatabase(reviewType, targetId, parseFloat(averageRating.toFixed(2)), reviews.length);
}

/**
 * Update rating in the appropriate collection
 */
async function updateTargetInDatabase(
  reviewType: ReviewType,
  targetId: string,
  rating: number,
  reviewCount: number
): Promise<void> {
  if (!ObjectId.isValid(targetId)) return;
  
  let collectionName: string;
  
  switch (reviewType) {
    case 'hotel':
      collectionName = 'properties';
      break;
    case 'car_rental':
      collectionName = 'vehicles';
      break;
    case 'transfer':
      collectionName = 'transferVehicles';
      break;
    case 'tour':
      collectionName = 'tours';
      break;
    default:
      return;
  }
  
  const collection = await getCollection(collectionName);
  await collection.updateOne(
    { _id: new ObjectId(targetId) },
    {
      $set: {
        rating,
        reviewCount,
        updatedAt: new Date().toISOString(),
      }
    }
  );
}

/**
 * Get review statistics for a target
 */
export async function getReviewStatistics(reviewType: ReviewType, targetId: string) {
  const reviews = await getBookingReviews({
    reviewType,
    targetId,
    status: 'published',
  });
  
  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      averageRatings: {},
    };
  }
  
  // Calculate rating distribution
  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(review => {
    const rating = Math.round(review.ratings.overall) as 1 | 2 | 3 | 4 | 5;
    ratingDistribution[rating]++;
  });
  
  // Calculate average for each rating category
  const averageRatings: any = {
    overall: reviews.reduce((sum, r) => sum + r.ratings.overall, 0) / reviews.length,
  };
  
  // Calculate averages for optional ratings
  const ratingKeys = ['cleanliness', 'service', 'valueForMoney', 'comfort', 'location', 'condition', 'experience'];
  ratingKeys.forEach(key => {
    const reviewsWithRating = reviews.filter(r => r.ratings[key as keyof typeof r.ratings] !== undefined);
    if (reviewsWithRating.length > 0) {
      averageRatings[key] = reviewsWithRating.reduce(
        (sum, r) => sum + (r.ratings[key as keyof typeof r.ratings] || 0), 0
      ) / reviewsWithRating.length;
    }
  });
  
  return {
    totalReviews: reviews.length,
    averageRating: parseFloat(averageRatings.overall.toFixed(2)),
    ratingDistribution,
    averageRatings: Object.fromEntries(
      Object.entries(averageRatings).map(([k, v]) => [k, parseFloat((v as number).toFixed(2))])
    ),
  };
}

