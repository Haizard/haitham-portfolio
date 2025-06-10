
import { NextResponse, type NextRequest } from 'next/server';
import { getProductById, updateProduct, deleteProduct, type Product } from '@/lib/products-data';
import { z } from 'zod';

// Schemas for updating a product - similar to creation but all fields are optional for PUT
const affiliateLinkUpdateSchema = z.object({
  vendorName: z.string().min(1).optional(),
  url: z.string().url().optional(),
  priceDisplay: z.string().min(1).optional(),
  icon: z.string().optional(),
});

const baseProductUpdateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  category: z.string().min(1, "Category is required").optional(),
  imageUrl: z.string().url("Image URL must be valid").optional(),
  imageHint: z.string().min(1, "Image hint is required").optional(),
  tags: z.array(z.string()).optional(),
});

const creatorProductUpdateSchema = baseProductUpdateSchema.extend({
  productType: z.literal('creator').optional(),
  price: z.number().min(0, "Price must be non-negative").optional(),
  stock: z.number().int().min(0, "Stock must be a non-negative integer").optional(),
  sku: z.string().optional().nullable(), // Allow sku to be explicitly set to null to clear it
  links: z.array(affiliateLinkUpdateSchema).optional().transform((val) => val === undefined ? undefined : null), // if links are passed for creator, force to null
});

const affiliateProductUpdateSchema = baseProductUpdateSchema.extend({
  productType: z.literal('affiliate').optional(),
  links: z.array(affiliateLinkUpdateSchema).min(1, "Affiliate products must have at least one link").optional(),
  price: z.number().optional().transform(() => undefined),
  stock: z.number().optional().transform(() => undefined),
  sku: z.string().optional().transform(() => undefined),
});

// For PUT, we can't use discriminatedUnion easily if productType itself is not part of the update.
// So, we allow either shape, and rely on the existing productType if not provided.
const productUpdateSchema = z.union([creatorProductUpdateSchema, affiliateProductUpdateSchema])
  .refine(data => {
    // If productType is being changed, ensure the new structure is valid.
    // This is complex for partial updates. Usually, productType is not changed in an update.
    // For simplicity here, we assume productType isn't changed or if it is, other fields align.
    // More robust validation would check existing type against incoming update.
    if (data.productType === 'creator' && data.links !== undefined && data.links !== null) return false; // Creator products shouldn't have links set (unless forced to null)
    if (data.productType === 'affiliate' && data.price !== undefined) return false; // Affiliate shouldn't have own price
    return true;
  }, {
    message: "Invalid field combination for product type.",
  });


export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;
    const product = await getProductById(productId);

    if (product) {
      return NextResponse.json(product);
    } else {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`API Error in /api/products/${params.productId} GET route:`, error.message);
    return NextResponse.json({ message: `Server error: ${error.message || "Failed to fetch product"}` }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;
    const body = await request.json();
    
    const validation = productUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid product data for update", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    // Fields like slug are handled by the updateProduct function if name changes
    const productData = validation.data as Partial<Omit<Product, 'id' | '_id' | 'slug'>>;
    
    if (Object.keys(productData).length === 0) {
        return NextResponse.json({ message: "No update fields provided" }, { status: 400 });
    }

    const updatedProduct = await updateProduct(productId, productData);

    if (updatedProduct) {
      return NextResponse.json(updatedProduct);
    } else {
      return NextResponse.json({ message: "Product not found or update failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`API Error in /api/products/${params.productId} PUT route:`, error.message);
     if (error.message?.includes('conflict')) {
        return NextResponse.json({ message: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: `Server error: ${error.message || "Failed to update product"}` }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;
    const success = await deleteProduct(productId);

    if (success) {
      return NextResponse.json({ message: "Product deleted successfully" });
    } else {
      return NextResponse.json({ message: "Product not found or delete failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`API Error in /api/products/${params.productId} DELETE route:`, error.message);
    return NextResponse.json({ message: `Server error: ${error.message || "Failed to delete product"}` }, { status: 500 });
  }
}
