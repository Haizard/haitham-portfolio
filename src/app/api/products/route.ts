
import { NextResponse, type NextRequest } from 'next/server';
import { getAllProducts } from '@/lib/products-data'; // Updated import

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const products = getAllProducts(category || undefined); // Updated function call
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error); // Updated log message
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 }); // Updated error message
  }
}
