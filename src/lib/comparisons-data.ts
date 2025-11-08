import { ObjectId } from 'mongodb';
import clientPromise from './mongodb';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ComparisonItem {
  itemId: string;
  addedAt: string;
}

export interface Comparison {
  _id?: ObjectId;
  id?: string;
  userId: string;
  comparisonType: 'property' | 'vehicle' | 'tour' | 'transfer';
  items: ComparisonItem[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// COMPARISON OPERATIONS
// ============================================================================

/**
 * Get or create comparison for user and type
 */
export async function getOrCreateComparison(
  userId: string,
  comparisonType: Comparison['comparisonType']
): Promise<Comparison> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const comparisons = db.collection<Comparison>('comparisons');

  // Try to find existing comparison
  let comparison = await comparisons.findOne({ userId, comparisonType });

  if (!comparison) {
    // Create new comparison
    const newComparison: Comparison = {
      userId,
      comparisonType,
      items: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await comparisons.insertOne(newComparison);
    comparison = {
      ...newComparison,
      _id: result.insertedId,
    };
  }

  return {
    ...comparison,
    id: comparison._id.toString(),
  };
}

/**
 * Get user's comparisons
 */
export async function getUserComparisons(userId: string): Promise<Comparison[]> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const comparisons = db.collection<Comparison>('comparisons');

  const results = await comparisons
    .find({ userId })
    .sort({ updatedAt: -1 })
    .toArray();

  return results.map((c) => ({
    ...c,
    id: c._id.toString(),
  }));
}

/**
 * Get comparison by ID
 */
export async function getComparisonById(
  comparisonId: string,
  userId: string
): Promise<Comparison | null> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const comparisons = db.collection<Comparison>('comparisons');

  const comparison = await comparisons.findOne({
    _id: new ObjectId(comparisonId),
    userId,
  });

  if (!comparison) return null;

  return {
    ...comparison,
    id: comparison._id.toString(),
  };
}

/**
 * Add item to comparison (max 3 items)
 */
export async function addItemToComparison(
  userId: string,
  comparisonType: Comparison['comparisonType'],
  itemId: string
): Promise<Comparison | null> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const comparisons = db.collection<Comparison>('comparisons');

  // Get or create comparison
  const comparison = await getOrCreateComparison(userId, comparisonType);

  // Check if item already exists
  const itemExists = comparison.items.some((item) => item.itemId === itemId);
  if (itemExists) {
    return comparison;
  }

  // Check if comparison is full (max 3 items)
  if (comparison.items.length >= 3) {
    throw new Error('Comparison is full. Maximum 3 items allowed.');
  }

  const comparisonItem: ComparisonItem = {
    itemId,
    addedAt: new Date().toISOString(),
  };

  const result = await comparisons.findOneAndUpdate(
    { _id: comparison._id },
    {
      $push: { items: comparisonItem },
      $set: { updatedAt: new Date().toISOString() },
    },
    { returnDocument: 'after' }
  );

  if (!result) return null;

  return {
    ...result,
    id: result._id.toString(),
  };
}

/**
 * Remove item from comparison
 */
export async function removeItemFromComparison(
  userId: string,
  comparisonType: Comparison['comparisonType'],
  itemId: string
): Promise<Comparison | null> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const comparisons = db.collection<Comparison>('comparisons');

  const result = await comparisons.findOneAndUpdate(
    { userId, comparisonType },
    {
      $pull: { items: { itemId } },
      $set: { updatedAt: new Date().toISOString() },
    },
    { returnDocument: 'after' }
  );

  if (!result) return null;

  return {
    ...result,
    id: result._id.toString(),
  };
}

/**
 * Clear comparison (remove all items)
 */
export async function clearComparison(
  userId: string,
  comparisonType: Comparison['comparisonType']
): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const comparisons = db.collection<Comparison>('comparisons');

  const result = await comparisons.updateOne(
    { userId, comparisonType },
    {
      $set: {
        items: [],
        updatedAt: new Date().toISOString(),
      },
    }
  );

  return result.modifiedCount > 0;
}

/**
 * Delete comparison
 */
export async function deleteComparison(
  comparisonId: string,
  userId: string
): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const comparisons = db.collection<Comparison>('comparisons');

  const result = await comparisons.deleteOne({
    _id: new ObjectId(comparisonId),
    userId,
  });

  return result.deletedCount > 0;
}

/**
 * Check if item is in comparison
 */
export async function isItemInComparison(
  userId: string,
  comparisonType: Comparison['comparisonType'],
  itemId: string
): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const comparisons = db.collection<Comparison>('comparisons');

  const count = await comparisons.countDocuments({
    userId,
    comparisonType,
    'items.itemId': itemId,
  });

  return count > 0;
}

/**
 * Get comparison item count
 */
export async function getComparisonItemCount(
  userId: string,
  comparisonType: Comparison['comparisonType']
): Promise<number> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const comparisons = db.collection<Comparison>('comparisons');

  const comparison = await comparisons.findOne({ userId, comparisonType });
  return comparison?.items.length || 0;
}

