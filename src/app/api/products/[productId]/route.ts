
import { NextResponse, type NextRequest } from 'next/server';
import { getProductById, updateProduct, deleteProduct, type Product } from '@/lib/products-data';
import { z } from 'zod';
import { ObjectId } from 'mongodb';


// This would come from an authenticated session
const MOCK_VENDOR_ID = "freelancer123";

// Schemas for updating a product - all fields are optional.
// productType is NOT updatable here to keep it simple. If type needs changing, delete & recreate.
const affiliateLinkUpdateSchema = z.object({
  vendorName: z.string().min(1, "Vendor name is required").max(100),
  url: z.string().url("Invalid URL format"),
  priceDisplay: z.string().min(1, "Price display is required").max(50),
  icon: z.string().optional(),
});

const productUpdateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(150).optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000).optional(),
  categoryId: z.string().min(1, "Category is required").optional(), // Changed from category
  imageUrl: z.string().url("Image URL must be valid").optional(),
  imageHint: z.string().min(1, "Image hint is required").max(50).optional(),
  tagIds: z.array(z.string()).optional(), // Changed from tags
  // For 'creator' type products
  price: z.number().min(0, "Price must be non-negative").optional(),
  stock: z.number().int().min(0, "Stock must be a non-negative integer").optional(),
  sku: z.string().max(50).optional().nullable(),
  // For 'affiliate' type products
  links: z.array(affiliateLinkUpdateSchema).min(1, "Affiliate products must have at least one link").max(5).optional(),
  // productType: z.enum(["creator", "affiliate"]).optional(), // Not allowing type change for simplicity
}).refine(data => {
    // If 'price', 'stock', or 'sku' are provided, 'links' should not be (and vice-versa).
    // This helps ensure that an update doesn't accidentally mix properties of different product types.
    const creatorFieldsPresent = data.price !== undefined || data.stock !== undefined || data.sku !== undefined;
    const affiliateFieldsPresent = data.links !== undefined;

    if (creatorFieldsPresent && affiliateFieldsPresent) {
        return false; // Cannot have fields for both types in one update.
    }
    return true;
}, {
    message: "Cannot mix creator product fields (price, stock, SKU) with affiliate product fields (links). Update fields relevant to the product's existing type.",
    // path: ["price"], // Or a general path
});


export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId;
    // It's possible the identifier is a slug, not an ID. Let's try to fetch by both.
    let product: Product | null = null;
    if (ObjectId.isValid(productId)) {
        product = await getProductById(productId);
    } else {
        // If it's not a valid ObjectId, we assume it's a slug.
        // This is a common pattern for pages that can be accessed via slug or ID.
        product = await getProductBySlug(productId);
    }

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
    const productToUpdate = await getProductById(productId);
    if (!productToUpdate) {
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // --- Authorization Check ---
    // In a real app, this might also check for an admin role.
    if (productToUpdate.vendorId !== MOCK_VENDOR_ID && productToUpdate.vendorId !== 'admin') {
        return NextResponse.json({ message: "Unauthorized: You do not own this product." }, { status: 403 });
    }
    // ---
    
    const body = await request.json();
    const validation = productUpdateSchema.safeParse(body);
    if (!validation.success) {
      console.error("API Product Update Validation Error:", validation.error.flatten());
      return NextResponse.json({ message: "Invalid product data for update", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const productData = validation.data as Partial<Omit<Product, 'id' | '_id' | 'slug' | 'productType'>>;
    
    if (Object.keys(productData).length === 0) {
        return NextResponse.json({ message: "No update fields provided" }, { status: 400 });
    }

    const updatedProduct = await updateProduct(productId, productData);

    if (updatedProduct) {
      return NextResponse.json(updatedProduct);
    } else {
      // This could be because the product wasn't found, or the update operation itself failed in the data layer.
      const existingProduct = await getProductById(productId);
      if (!existingProduct) {
         return NextResponse.json({ message: "Product not found" }, { status: 404 });
      }
      return NextResponse.json({ message: "Product update failed for an unknown reason" }, { status: 500 });
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
    
    const productToDelete = await getProductById(productId);
    if (!productToDelete) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    // --- Authorization Check ---
    if (productToDelete.vendorId !== MOCK_VENDOR_ID && productToDelete.vendorId !== 'admin') {
      return NextResponse.json({ message: "Unauthorized: You do not own this product." }, { status: 403 });
    }
    // ---

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
