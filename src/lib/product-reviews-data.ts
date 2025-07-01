
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import { updateProductRating } from './products-data'; // To update the product's main rating

const PRODUCT_REVIEWS_COLLECTION = 'productReviews';

export interface ProductReview {
  _id?: ObjectId;
  id?: string;
  productId: string;
  reviewerId: string; // ID of the user leaving the review
  reviewerName: string; // Name of the reviewer
  reviewerAvatar?: string; // Avatar of the reviewer
  rating: number; // 1-5
  comment: string;
  createdAt: Date;
}

function docToProductReview(doc: any): ProductReview {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as ProductReview;
}

// Function to get all reviews for a specific product
export async function getReviewsForProduct(productId: string): Promise<ProductReview[]> {
  if (!ObjectId.isValid(productId)) {
    return [];
  }
  const collection = await getCollection<ProductReview>(PRODUCT_REVIEWS_COLLECTION);
  const reviewDocs = await collection.find({ productId }).sort({ createdAt: -1 }).toArray();
  return reviewDocs.map(docToProductReview);
}

// Function to add a new review and update the product's average rating
export async function addProductReview(reviewData: Omit<ProductReview, 'id' | '_id' | 'createdAt'>): Promise<ProductReview> {
  const reviewsCollection = await getCollection<Omit<ProductReview, 'id' | '_id'>>(PRODUCT_REVIEWS_COLLECTION);
  
  // TODO: In a real app, you would add logic here to verify if the user has purchased the product
  // before allowing them to leave a review.

  const now = new Date();
  const docToInsert = { ...reviewData, createdAt: now };

  const result = await reviewsCollection.insertOne(docToInsert as any);
  const newReview = { _id: result.insertedId, id: result.insertedId.toString(), ...docToInsert };

  // After adding the review, recalculate and update the product's average rating
  const allReviewsForProduct = await getReviewsForProduct(reviewData.productId);
  const totalReviews = allReviewsForProduct.length;
  const averageRating = totalReviews > 0
    ? allReviewsForProduct.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  await updateProductRating(
    reviewData.productId,
    parseFloat(averageRating.toFixed(2)),
    totalReviews
  );

  return newReview;
}
