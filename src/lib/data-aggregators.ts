
// src/lib/data-aggregators.ts
import { getCollection } from './mongodb';
import { Product } from './products-data';
import { getFreelancerProfilesByUserIds } from './user-profile-data';
import { getGuidesByIds } from './tour-guides-data';

/**
 * This file is for functions that need to aggregate data from multiple collections
 * to avoid circular dependencies in the primary data files.
 */

/**
 * Counts the number of products for a specific vendor.
 * @param vendorId - The ID of the vendor.
 * @returns A promise that resolves to the number of products.
 */
export async function getProductCountForVendor(vendorId: string): Promise<number> {
  const productsCollection = await getCollection<Product>('products');
  return productsCollection.countDocuments({ vendorId });
}

/**
 * Enriches a list of items with author/owner information (name and avatar).
 * Use this to fetch data for the feed.
 */
export async function enrichWithAuthors<T extends { ownerId?: string; vendorId?: string; guideId?: string }>(items: T[]): Promise<T[]> {
  if (!items || items.length === 0) return items;

  // Collect all unique IDs that might represent an "author"
  const userIds = new Set<string>();
  const guideIds = new Set<string>();

  items.forEach(item => {
    if (item.ownerId) userIds.add(item.ownerId);
    if (item.vendorId) userIds.add(item.vendorId);
    if (item.guideId && item.guideId !== 'none') guideIds.add(item.guideId);
  });

  // Fetch profiles and guides in parallel
  const [profiles, guides] = await Promise.all([
    userIds.size > 0 ? getFreelancerProfilesByUserIds(Array.from(userIds)) : [],
    guideIds.size > 0 ? getGuidesByIds(Array.from(guideIds)) : []
  ]);

  // Create lookup maps
  const profileMap = new Map(profiles.map(p => [p.userId, p]));
  const guideMap = new Map(guides.map(g => [g.id, g]));

  // Enriched items
  return items.map(item => {
    let authorName = 'Creator';
    let authorAvatar = '';

    // Priority: Guide > Owner > Vendor
    if (item.guideId && guideMap.has(item.guideId)) {
      const guide = guideMap.get(item.guideId);
      authorName = guide?.name || authorName;
      authorAvatar = guide?.avatarUrl || authorAvatar;
    } else {
      const idToLookUp = item.ownerId || item.vendorId;
      if (idToLookUp && profileMap.has(idToLookUp)) {
        const profile = profileMap.get(idToLookUp);
        authorName = profile?.name || authorName;
        authorAvatar = profile?.avatarUrl || authorAvatar;
      }
    }

    // Attach enriched data (using any as T doesn't explicitly have these fields, but we want to return them)
    return {
      ...item,
      authorName,
      authorAvatar
    };
  });
}
