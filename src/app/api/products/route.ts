
import { NextResponse, type NextRequest } from 'next/server';
import { getAllProducts } from '@/lib/products-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const products = getAllProducts(category || undefined);
    return NextResponse.json(products);
  } catch (error: any) {
    console.error("API Error in /api/products route:", error.message, error.stack); 
    return NextResponse.json({ message: `Server error: ${error.message || "Failed to fetch products"}` }, { status: 500 });
  }
}
