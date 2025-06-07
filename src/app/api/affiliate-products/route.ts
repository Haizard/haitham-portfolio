
import { NextResponse, type NextRequest } from 'next/server';
import { getAllAffiliateProducts } from '@/lib/affiliate-products-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const products = getAllAffiliateProducts(category || undefined);
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch affiliate products:", error);
    return NextResponse.json({ message: "Failed to fetch affiliate products" }, { status: 500 });
  }
}
