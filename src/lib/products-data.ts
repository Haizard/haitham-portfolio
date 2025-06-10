
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';

const PRODUCTS_COLLECTION = 'products';

export interface AffiliateLink {
  vendorName: string;
  url: string;
  priceDisplay: string;
  icon?: string;
}

export type ProductType = 'affiliate' | 'creator';

export interface Product {
  _id?: ObjectId;
  id?: string;
  slug: string;
  name: string;
  description: string;
  category: string; // Kept as string for now, can be categoryId later
  imageUrl: string;
  imageHint: string;
  productType: ProductType;
  tags?: string[]; // Kept as string array for now, can be tagIds later

  // For affiliate products
  links?: AffiliateLink[];

  // For creator's own products
  price?: number;
  stock?: number;
  sku?: string;
}

// For MongoDB document representation
interface ProductDocument extends Omit<Product, 'id'> {
  _id: ObjectId;
}

function docToProduct(doc: any): Product {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as Product;
}

function createProductSlug(name: string): string {
  if (!name) return `product-${Date.now()}`;
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 70); // Max length for slug
}

async function isProductSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  const collection = await getCollection<ProductDocument>(PRODUCTS_COLLECTION);
  const query: Filter<ProductDocument> = { slug };
  if (excludeId && ObjectId.isValid(excludeId)) {
    query._id = { $ne: new ObjectId(excludeId) };
  }
  const count = await collection.countDocuments(query);
  return count === 0;
}

export async function getAllProducts(category?: string, productType?: ProductType): Promise<Product[]> {
  const collection = await getCollection<ProductDocument>(PRODUCTS_COLLECTION);
  const query: Filter<ProductDocument> = {};
  if (category && category.toLowerCase() !== 'all') {
    query.category = { $regex: new RegExp(`^${category}$`, 'i') }; // Case-insensitive match
  }
  if (productType) {
    query.productType = productType;
  }
  const productDocs = await collection.find(query).sort({ name: 1 }).toArray();
  return productDocs.map(docToProduct);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!ObjectId.isValid(id)) {
    console.warn(`getProductById: Invalid ID format: ${id}`);
    return null;
  }
  const collection = await getCollection<ProductDocument>(PRODUCTS_COLLECTION);
  const productDoc = await collection.findOne({ _id: new ObjectId(id) });
  return productDoc ? docToProduct(productDoc) : null;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const collection = await getCollection<ProductDocument>(PRODUCTS_COLLECTION);
  const productDoc = await collection.findOne({ slug });
  return productDoc ? docToProduct(productDoc) : null;
}

export async function addProduct(productData: Omit<Product, 'id' | '_id' | 'slug'>): Promise<Product> {
  const collection = await getCollection<Omit<ProductDocument, '_id'>>(PRODUCTS_COLLECTION);
  let slug = createProductSlug(productData.name);
  let counter = 1;
  while (!(await isProductSlugUnique(slug))) {
    slug = `${createProductSlug(productData.name)}-${counter}`;
    counter++;
  }

  const docToInsert: Omit<ProductDocument, '_id'> = {
    ...productData,
    slug,
    // Ensure default values for optional fields if not provided
    tags: productData.tags || [],
    links: productData.productType === 'affiliate' ? (productData.links || []) : undefined,
    price: productData.productType === 'creator' ? (productData.price || 0) : undefined,
    stock: productData.productType === 'creator' ? (productData.stock || 0) : undefined,
    sku: productData.productType === 'creator' ? (productData.sku || '') : undefined,
  };

  const result = await collection.insertOne(docToInsert as any);
  
  const newProduct: Product = {
    _id: result.insertedId,
    id: result.insertedId.toString(),
    ...docToInsert
  };
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Omit<Product, 'id' | '_id' | 'slug'>>): Promise<Product | null> {
  if (!ObjectId.isValid(id)) {
    console.warn(`updateProduct: Invalid ID format: ${id}`);
    return null;
  }
  const collection = await getCollection<ProductDocument>(PRODUCTS_COLLECTION);
  
  const existingProduct = await collection.findOne({ _id: new ObjectId(id) });
  if (!existingProduct) {
    console.warn(`updateProduct: Product with ID ${id} not found.`);
    return null;
  }

  const updatePayload = { ...updates };

  if (updates.name && updates.name !== existingProduct.name) {
    let newSlug = createProductSlug(updates.name);
    let counter = 1;
    while (!(await isProductSlugUnique(newSlug, id))) {
      newSlug = `${createProductSlug(updates.name)}-${counter}`;
      counter++;
    }
    (updatePayload as Product).slug = newSlug;
  }
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );

  if (!result) {
    console.warn(`updateProduct: Product with ID '${id}' not found or update failed post-operation.`);
    return null;
  }
  return docToProduct(result);
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) {
    console.warn(`deleteProduct: Invalid ID format: ${id}`);
    return false;
  }
  const collection = await getCollection<ProductDocument>(PRODUCTS_COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  
  return result.deletedCount === 1;
}

export async function countProducts(): Promise<number> {
  const collection = await getCollection<ProductDocument>(PRODUCTS_COLLECTION);
  return collection.countDocuments();
}
