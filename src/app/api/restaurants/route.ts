
import { NextResponse, type NextRequest } from 'next/server';
import { getAllRestaurants } from '@/lib/restaurants-data';

export async function GET(request: NextRequest) {
  try {
    // Here you could add logic to handle filters from the request query params
    const restaurants = await getAllRestaurants();
    return NextResponse.json(restaurants);
  } catch (error: any) {
    console.error("[API /api/restaurants GET] Error:", error);
    return NextResponse.json({ message: `Failed to fetch restaurants: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
