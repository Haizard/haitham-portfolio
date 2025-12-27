
import { NextResponse, type NextRequest } from 'next/server';
import { getAllProducts, addProduct, type Product, type ProductType } from '@/lib/products-data';
import { z } from 'zod';
import { getFreelancerProfilesByUserIds } from '@/lib/user-profile-data';

// This would come from an authenticated session
const MOCK_VENDOR_ID = "freelancer123"; // Using a different ID to distinguish from client/freelancer mocks

// Schema for creating a new product
const affiliateLinkSchema = z.object({
  vendorName: z.string().min(1, "Vendor name is required").max(100),
  url: z.string().url("Invalid URL format"),
  priceDisplay: z.string().min(1, "Price display is required").max(50),
  icon: z.string().optional(),
});

const baseProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(150),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000),
  categoryId: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Image URL must be a valid URL"),
  imageHint: z.string().min(1, "Image hint is required").max(50),
  videoUrl: z.string().url("Video URL must be valid").optional().or(z.literal('')),
  tags: z.array(z.string()).optional(), // Expect an array of strings now
  productType: z.enum(['creator', 'affiliate'], { required_error: "Product type is required." }),
});

const creatorProductSchema = baseProductSchema.extend({
  productType: z.literal('creator'),
  price: z.number().min(0, "Price must be non-negative"),
  stock: z.number().int().min(0, "Stock must be a non-negative integer").optional().default(0),
  sku: z.string().max(50).optional().nullable(),
  links: z.array(affiliateLinkSchema).max(0, "Creator products cannot have affiliate links.").optional().transform(() => undefined),
});

const affiliateProductSchema = baseProductSchema.extend({
  productType: z.literal('affiliate'),
  links: z.array(affiliateLinkSchema).min(1, "Affiliate products must have at least one link").max(5),
  price: z.number().optional().transform(() => undefined),
  stock: z.number().optional().transform(() => undefined),
  sku: z.string().optional().transform(() => undefined),
});

const productCreateSchema = z.discriminatedUnion("productType", [
  creatorProductSchema,
  affiliateProductSchema,
]);


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryIds = searchParams.get('categoryIds')?.split(',') || undefined;
    const priceRangeStr = searchParams.get('priceRange')?.split(',');
    const priceMin = priceRangeStr && !isNaN(parseFloat(priceRangeStr[0])) ? parseFloat(priceRangeStr[0]) : undefined;
    const priceMax = priceRangeStr && priceRangeStr[1] && !isNaN(parseFloat(priceRangeStr[1])) ? parseFloat(priceRangeStr[1]) : undefined;
    const sortBy = searchParams.get('sortBy') as 'sales' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'featured' | undefined;

    const productType = searchParams.get('productType') as ProductType | undefined;
    const vendorId = searchParams.get('vendorId') || undefined;
    const slug = searchParams.get('slug') || undefined;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : undefined;

    // Pass all filters to the data function
    const products = await getAllProducts({
      categoryIds,
      productType,
      vendorId,
      slug,
      priceMin,
      priceMax,
      sortBy
    }, limit);

    // --- ENRICHMENT STEP ---
    if (products.length > 0) {
      // Get unique vendor IDs from the products
      const vendorIds = [...new Set(products.map(p => p.vendorId))].filter(Boolean);
      // Fetch the corresponding freelancer profiles
      if (vendorIds.length > 0) {
        const vendorProfiles = await getFreelancerProfilesByUserIds(vendorIds);
        // Create a map for easy lookup
        const vendorMap = new Map(vendorProfiles.map(p => p ? [p.userId, p.name] : [null, null]));

        // Add vendorName to each product
        products.forEach(p => {
          p.vendorName = vendorMap.get(p.vendorId) || 'Unknown Vendor';
        });
      }
    }
    // --- END ENRICHMENT ---

    // If fetching by slug, expect one result and return it as an object, not an array.
    if (slug) {
      if (products.length > 0) {
        return NextResponse.json(products[0]);
      } else {
        return NextResponse.json({ message: `Product with slug "${slug}" not found.` }, { status: 404 });
      }
    }

    return NextResponse.json(products);
  } catch (error: any) {
    console.error("API Error in /api/products GET route:", error.message, error.stack);
    return NextResponse.json({ message: `Server error: ${error.message || "Failed to fetch products"}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // In a real app, this would come from an authenticated session.
    // If an admin is creating a product, they might specify a vendorId in the body.
    // If a vendor is creating a product, their ID comes from the session.
    const vendorId = MOCK_VENDOR_ID;

    const body = await request.json();
    const validation = productCreateSchema.safeParse(body);

    if (!validation.success) {
      console.error("API Product Create Validation Error:", validation.error.flatten());
      return NextResponse.json({ message: "Invalid product data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // The data is already correctly typed by the discriminated union
    const productData = {
      ...validation.data,
      vendorId: vendorId, // Assign the product to the logged-in vendor
    } as Omit<Product, 'id' | '_id' | 'slug' | 'categoryName'>;

    // Ensure tagIds array is present, even if empty, to avoid MongoDB errors if schema expects it
    if (!productData.tags) {
      productData.tags = [];
    }

    const newProduct = await addProduct(productData);
    return NextResponse.json(newProduct, { status: 201 });

  } catch (error: any) {
    console.error("API Error in /api/products POST route:", error.message, error.stack);
    if (error.message?.includes('already exists')) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: `Server error: ${error.message || "Failed to create product"}` }, { status: 500 });
  }
}
