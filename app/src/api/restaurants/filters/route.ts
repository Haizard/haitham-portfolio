
// src/app/api/restaurants/filters/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getRestaurantFilterData } from '@/lib/restaurants-data';

export async function GET(request: NextRequest) {
  try {
    const filterData = await getRestaurantFilterData();
    return NextResponse.json(filterData);
  } catch (error: any) {
    console.error("[API /api/restaurants/filters GET] Error:", error);
    return NextResponse.json({ message: `Failed to fetch filter data: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}

    