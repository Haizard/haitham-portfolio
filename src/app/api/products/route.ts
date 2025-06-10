
import { NextResponse, type NextRequest } from 'next/server';
import { getAllProducts, addProduct, type Product, type ProductType } from '@/lib/products-data';
import { z } from 'zod';

// Schema for creating a new product
const affiliateLinkSchema = z.object({
  vendorName: z.string().min(1),
  url: z.string().url(),
  priceDisplay: z.string().min(1),
  icon: z.string().optional(),
});

const baseProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Image URL must be valid"),
  imageHint: z.string().min(1, "Image hint is required"),
  tags: z.array(z.string()).optional(),
});

const creatorProductSchema = baseProductSchema.extend({
  productType: z.literal('creator'),
  price: z.number().min(0, "Price must be non-negative"),
  stock: z.number().int().min(0, "Stock must be a non-negative integer").optional(),
  sku: z.string().optional(),
  links: z.array(affiliateLinkSchema).optional().transform(() => undefined), // Ensure links is undefined for creator
});

const affiliateProductSchema = baseProductSchema.extend({
  productType: z.literal('affiliate'),
  links: z.array(affiliateLinkSchema).min(1, "Affiliate products must have at least one link"),
  price: z.number().optional().transform(() => undefined), // Ensure price is undefined for affiliate
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
    const category = searchParams.get('category') || undefined;
    const productType = searchParams.get('productType') as ProductType | undefined;
    
    const products = await getAllProducts(category, productType);
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("API Error in /api/products GET route:", error.message, error.stack); 
    return NextResponse.json({ message: `Server error: ${error.message || "Failed to fetch products"}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = productCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid product data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const productData = validation.data as Omit<Product, 'id' | '_id' | 'slug'>;
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
