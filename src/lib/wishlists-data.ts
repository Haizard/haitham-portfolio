import { ObjectId } from 'mongodb';
import clientPromise from './mongodb';
import crypto from 'crypto';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface WishlistItem {
  itemType: 'property' | 'vehicle' | 'tour' | 'transfer';
  itemId: string;
  addedAt: string;
  notes?: string;
}

export interface Wishlist {
  _id?: ObjectId;
  id?: string;
  userId: string;
  name: string;
  description?: string;
  items: WishlistItem[];
  isDefault: boolean;
  isPublic: boolean;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// WISHLIST OPERATIONS
// ============================================================================

/**
 * Create a new wishlist
 */
export async function createWishlist(
  userId: string,
  name: string,
  options: {
    description?: string;
    isDefault?: boolean;
    isPublic?: boolean;
  } = {}
): Promise<Wishlist> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const wishlists = db.collection<Wishlist>('wishlists');

  // If this is set as default, unset other defaults
  if (options.isDefault) {
    await wishlists.updateMany(
      { userId, isDefault: true },
      { $set: { isDefault: false, updatedAt: new Date().toISOString() } }
    );
  }

  const wishlist: Wishlist = {
    userId,
    name,
    description: options.description,
    items: [],
    isDefault: options.isDefault || false,
    isPublic: options.isPublic || false,
    shareToken: options.isPublic ? crypto.randomBytes(16).toString('hex') : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const result = await wishlists.insertOne(wishlist);
  wishlist._id = result.insertedId;
  wishlist.id = result.insertedId.toString();

  return wishlist;
}

/**
 * Get user's wishlists
 */
export async function getUserWishlists(userId: string): Promise<Wishlist[]> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const wishlists = db.collection<Wishlist>('wishlists');

  const results = await wishlists
    .find({ userId })
    .sort({ isDefault: -1, createdAt: -1 })
    .toArray();

  return results.map((w) => ({
    ...w,
    id: w._id.toString(),
  }));
}

/**
 * Get wishlist by ID
 */
export async function getWishlistById(
  wishlistId: string,
  userId?: string
): Promise<Wishlist | null> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const wishlists = db.collection<Wishlist>('wishlists');

  const query: any = { _id: new ObjectId(wishlistId) };
  if (userId) {
    query.userId = userId;
  }

  const wishlist = await wishlists.findOne(query);
  if (!wishlist) return null;

  return {
    ...wishlist,
    id: wishlist._id.toString(),
  };
}

/**
 * Get wishlist by share token (public)
 */
export async function getWishlistByShareToken(
  shareToken: string
): Promise<Wishlist | null> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const wishlists = db.collection<Wishlist>('wishlists');

  const wishlist = await wishlists.findOne({ shareToken, isPublic: true });
  if (!wishlist) return null;

  return {
    ...wishlist,
    id: wishlist._id.toString(),
  };
}

/**
 * Update wishlist
 */
export async function updateWishlist(
  wishlistId: string,
  userId: string,
  updates: {
    name?: string;
    description?: string;
    isDefault?: boolean;
    isPublic?: boolean;
  }
): Promise<Wishlist | null> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const wishlists = db.collection<Wishlist>('wishlists');

  // If setting as default, unset other defaults
  if (updates.isDefault) {
    await wishlists.updateMany(
      { userId, isDefault: true, _id: { $ne: new ObjectId(wishlistId) } },
      { $set: { isDefault: false, updatedAt: new Date().toISOString() } }
    );
  }

  const updateData: any = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // Generate share token if making public
  if (updates.isPublic && !updateData.shareToken) {
    updateData.shareToken = crypto.randomBytes(16).toString('hex');
  }

  // Remove share token if making private
  if (updates.isPublic === false) {
    updateData.shareToken = null;
  }

  const result = await wishlists.findOneAndUpdate(
    { _id: new ObjectId(wishlistId), userId },
    { $set: updateData },
    { returnDocument: 'after' }
  );

  if (!result) return null;

  return {
    ...result,
    id: result._id.toString(),
  };
}

/**
 * Delete wishlist
 */
export async function deleteWishlist(
  wishlistId: string,
  userId: string
): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const wishlists = db.collection<Wishlist>('wishlists');

  const result = await wishlists.deleteOne({
    _id: new ObjectId(wishlistId),
    userId,
  });

  return result.deletedCount > 0;
}

/**
 * Add item to wishlist
 */
export async function addItemToWishlist(
  wishlistId: string,
  userId: string,
  item: Omit<WishlistItem, 'addedAt'>
): Promise<Wishlist | null> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const wishlists = db.collection<Wishlist>('wishlists');

  // Check if item already exists
  const existing = await wishlists.findOne({
    _id: new ObjectId(wishlistId),
    userId,
    'items.itemId': item.itemId,
  });

  if (existing) {
    // Item already in wishlist, just return the wishlist
    return {
      ...existing,
      id: existing._id.toString(),
    };
  }

  const wishlistItem: WishlistItem = {
    ...item,
    addedAt: new Date().toISOString(),
  };

  const result = await wishlists.findOneAndUpdate(
    { _id: new ObjectId(wishlistId), userId },
    {
      $push: { items: wishlistItem },
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
 * Remove item from wishlist
 */
export async function removeItemFromWishlist(
  wishlistId: string,
  userId: string,
  itemId: string
): Promise<Wishlist | null> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const wishlists = db.collection<Wishlist>('wishlists');

  const result = await wishlists.findOneAndUpdate(
    { _id: new ObjectId(wishlistId), userId },
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
 * Check if item is in any wishlist
 */
export async function isItemInWishlist(
  userId: string,
  itemId: string
): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const wishlists = db.collection<Wishlist>('wishlists');

  const count = await wishlists.countDocuments({
    userId,
    'items.itemId': itemId,
  });

  return count > 0;
}

/**
 * Get default wishlist or create one
 */
export async function getOrCreateDefaultWishlist(
  userId: string
): Promise<Wishlist> {
  const client = await clientPromise;
  const db = client.db('booking_platform');
  const wishlists = db.collection<Wishlist>('wishlists');

  // Try to find existing default wishlist
  let wishlist = await wishlists.findOne({ userId, isDefault: true });

  if (!wishlist) {
    // Create default wishlist
    return await createWishlist(userId, 'My Favorites', { isDefault: true });
  }

  return {
    ...wishlist,
    id: wishlist._id.toString(),
  };
}

