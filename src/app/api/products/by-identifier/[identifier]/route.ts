
import { NextResponse, type NextRequest } from 'next/server';
import { getProductById, getProductBySlug, type Product } from '@/lib/products-data';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { identifier: string } }
) {
  try {
    const { identifier } = params;
    let product: Product | null = null;
    
    // Check if the identifier is a valid MongoDB ObjectId
    if (ObjectId.isValid(identifier)) {
      product = await getProductById(identifier);
    }
    
    // If not found by ID, or if it's not a valid ID format, try finding by slug
    if (!product) {
      product = await getProductBySlug(identifier);
    }

    if (product) {
      return NextResponse.json(product);
    } else {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`API Error in /api/products/by-identifier/${params.identifier} GET route:`, error.message);
    return NextResponse.json({ message: `Server error: ${error.message || "Failed to fetch product"}` }, { status: 500 });
  }
}
