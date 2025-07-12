
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import { getFreelancerProfile } from './user-profile-data'; // To enrich with vendor names

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders'; // Need this for top selling products

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
  category: string; 
  vendorId: string; // ID of the freelancer/vendor who owns this product
  vendorName?: string;
  imageUrl: string;
  imageHint: string;
  productType: ProductType;
  tags?: string[]; 

  // For affiliate products
  links?: AffiliateLink[];

  // For creator's own products
  price?: number;
  stock?: number;
  sku?: string;
  
  // Rating and Review fields
  averageRating?: number;
  reviewCount?: number;

  // Enriched fields for analytics
  sales?: number;
  revenue?: number;
}

// For MongoDB document representation
interface ProductDocument extends Omit<Product, 'id'> {
  _id: ObjectId;
}

function docToProduct(doc: any): Product {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { 
      id: _id?.toString(), 
      ...rest,
      averageRating: rest.averageRating || 0,
      reviewCount: rest.reviewCount || 0,
    } as Product;
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

export async function getAllProducts(
  filters: { 
      category?: string, 
      productType?: ProductType, 
      vendorId?: string,
      slug?: string
  } = {},
  limit?: number,
  excludeId?: string,
  sortBy?: 'sales' | 'name'
): Promise<Product[]> {
  const productsCollection = await getCollection<ProductDocument>(PRODUCTS_COLLECTION);
  const ordersCollection = await getCollection('orders');

  // 1. Get sales data first
  const salesPipeline = [
    { $unwind: "$lineItems" },
    { $match: { "lineItems.status": "Delivered" } },
    {
      $group: {
        _id: "$lineItems.productId",
        sales: { $sum: "$lineItems.quantity" },
        revenue: { $sum: { $multiply: ["$lineItems.quantity", "$lineItems.price"] } }
      }
    }
  ];
  const salesData = await ordersCollection.aggregate(salesPipeline).toArray();
  const salesMap = new Map(salesData.map((item: any) => [item._id.toString(), { sales: item.sales, revenue: item.revenue }]));

  // 2. Fetch products based on filters
  const query: Filter<ProductDocument> = {};
  if (filters.category && filters.category.toLowerCase() !== 'all') {
    query.category = { $regex: new RegExp(`^${filters.category}$`, 'i') };
  }
  if (filters.productType) {
    query.productType = filters.productType;
  }
  if (filters.vendorId) {
    query.vendorId = filters.vendorId;
  }
  if (filters.slug) {
      query.slug = filters.slug;
  }
  if (excludeId && ObjectId.isValid(excludeId)) {
      query._id = { $ne: new ObjectId(excludeId) };
  }

  const sortOptions: any = {};
  if (sortBy === 'name') {
      sortOptions.name = 1;
  } else {
      // Default sort can be by creation date or name
      sortOptions.name = 1;
  }

  const cursor = productsCollection.find(query).sort(sortOptions);
  if (limit) {
      cursor.limit(limit);
  }
  const productDocs = await cursor.toArray();

  // 3. Enrich products with sales data
  let enrichedProducts = productDocs.map(doc => {
    const product = docToProduct(doc);
    const saleInfo = salesMap.get(product.id!);
    product.sales = saleInfo?.sales || 0;
    product.revenue = saleInfo?.revenue || 0;
    return product;
  });

  if (sortBy === 'sales') {
    enrichedProducts = enrichedProducts.sort((a, b) => (b.sales || 0) - (a.sales || 0));
  }


  return enrichedProducts;
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!ObjectId.isValid(id)) {
    console.warn(`getProductById: Invalid ID format: ${id}`);
    return null;
  }
  const collection = await getCollection<ProductDocument>(PRODUCTS_COLLECTION);
  const productDoc = await collection.findOne({ _id: new ObjectId(id) });
  if (!productDoc) return null;

  const product = docToProduct(productDoc);

  // Enrich with vendor name
  if (product.vendorId) {
      const vendorProfile = await getFreelancerProfile(product.vendorId);
      product.vendorName = vendorProfile?.name || 'Unknown Vendor';
  }

  return product;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const collection = await getCollection<ProductDocument>(PRODUCTS_COLLECTION);
  const productDoc = await collection.findOne({ slug });
  if (!productDoc) return null;
  
  const product = docToProduct(productDoc);

  // Enrich with vendor name
  if (product.vendorId) {
      const vendorProfile = await getFreelancerProfile(product.vendorId);
      product.vendorName = vendorProfile?.name || 'Unknown Vendor';
  }
  return product;
}

export async function addProduct(productData: Omit<Product, 'id' | '_id' | 'slug'>): Promise<Product> {
  const collection = await getCollection<Omit<ProductDocument, '_id'>>(PRODUCTS_COLLECTION);
  let slug = createProductSlug(productData.name);
  let counter = 1;
  while (!(await isProductSlugUnique(slug))) {
    slug = `${createProductSlug(productData.name)}-${counter}`;
    counter++;
  }

  if (!productData.vendorId) {
      throw new Error("Cannot add product: vendorId is missing.");
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
    averageRating: 0,
    reviewCount: 0,
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

// --- NEW Function for Admin Dashboard ---
export async function getTopSellingProducts(limit: number = 5): Promise<Product[]> {
    const ordersCollection = await getCollection('orders'); // No specific type needed for aggregation
    const productsCollection = await getCollection<ProductDocument>(PRODUCTS_COLLECTION);

    // 1. Aggregate sales data from orders
    const salesPipeline = [
        { $unwind: "$lineItems" },
        { $match: { "lineItems.status": "Delivered" } },
        { 
            $group: { 
                _id: "$lineItems.productId", 
                sales: { $sum: "$lineItems.quantity" },
                revenue: { $sum: { $multiply: ["$lineItems.quantity", "$lineItems.price"] } }
            } 
        },
        { $sort: { sales: -1 } },
        { $limit: limit }
    ];

    const topProductsData = await ordersCollection.aggregate(salesPipeline).toArray();

    if (topProductsData.length === 0) {
        return [];
    }

    // 2. Fetch product details for the top selling product IDs
    const topProductIds = topProductsData.map(p => new ObjectId(p._id));
    const productDocs = await productsCollection.find({ _id: { $in: topProductIds } }).toArray();

    // 3. Combine sales data with product details
    const productsById = new Map(productDocs.map(p => [p._id.toString(), docToProduct(p)]));
    
    const enrichedTopProducts = topProductsData.map(salesData => {
        const productInfo = productsById.get(salesData._id);
        if (productInfo) {
            return {
                ...productInfo,
                sales: salesData.sales,
                revenue: salesData.revenue,
            };
        }
        return null;
    }).filter((p): p is Product => p !== null);

    return enrichedTopProducts;
}

// New function to be called by review system to update a product's rating
export async function updateProductRating(productId: string, newAverageRating: number, newReviewCount: number): Promise<boolean> {
  if (!ObjectId.isValid(productId)) {
    return false;
  }
  const productsCollection = await getCollection<ProductDocument>(PRODUCTS_COLLECTION);
  const result = await productsCollection.updateOne(
    { _id: new ObjectId(productId) },
    { $set: { averageRating: newAverageRating, reviewCount: newReviewCount } }
  );
  return result.modifiedCount === 1;
}
