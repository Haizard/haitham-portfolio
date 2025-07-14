
import { NextResponse, type NextRequest } from 'next/server';
import { getMenuForRestaurant } from '@/lib/restaurants-data';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = params;
    if (!restaurantId || !ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ message: "Valid restaurant ID is required." }, { status: 400 });
    }
    
    const menuData = await getMenuForRestaurant(restaurantId);

    return NextResponse.json(menuData);

  } catch (error: any) {
    console.error(`[API /api/restaurants/${params.restaurantId}/menu GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch menu data: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
