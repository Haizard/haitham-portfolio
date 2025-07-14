
import { NextResponse, type NextRequest } from 'next/server';
import { getRestaurantById } from '@/lib/restaurants-data';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = params;
    if (!restaurantId || !ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ message: "A valid restaurant ID is required." }, { status: 400 });
    }
    
    const restaurant = await getRestaurantById(restaurantId);

    if (!restaurant) {
      return NextResponse.json({ message: "Restaurant not found." }, { status: 404 });
    }

    return NextResponse.json(restaurant);

  } catch (error: any) {
    console.error(`[API /api/restaurants/${params.restaurantId} GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch restaurant: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
