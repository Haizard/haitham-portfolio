// src/lib/data-aggregators.ts
import { getCollection } from './mongodb';
import { Product } from './products-data';

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
