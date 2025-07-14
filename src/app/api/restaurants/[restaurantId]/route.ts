
import { NextResponse, type NextRequest } from 'next/server';
import { getRestaurantById, updateRestaurantProfile } from '@/lib/restaurants-data';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import { getSession } from '@/lib/session';

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


const restaurantUpdateSchema = z.object({
  name: z.string().min(1, "Restaurant name is required."),
  logoUrl: z.string().url("A valid logo URL is required."),
  location: z.string().min(1, "Location is required."),
  cuisineTypes: z.array(z.string()).min(1, "At least one cuisine type is required."),
  status: z.enum(["Open", "Closed"]),
  specialDeals: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const session = await getSession();
    const { restaurantId } = params;

    // Authorization check
    // In a real app, you'd have a mapping of user ID to restaurant ID.
    // For now, we'll assume any logged-in user can edit the restaurant for demo purposes.
    // A better check would be: if (session.user.restaurantId !== restaurantId) { ... }
    if (!session.user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
     if (!restaurantId || !ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ message: "A valid restaurant ID is required." }, { status: 400 });
    }

    const body = await request.json();
    const validation = restaurantUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid update data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedRestaurant = await updateRestaurantProfile(restaurantId, validation.data);

    if (!updatedRestaurant) {
      return NextResponse.json({ message: "Restaurant not found or update failed" }, { status: 404 });
    }
    
    return NextResponse.json(updatedRestaurant);

  } catch (error: any) {
    console.error(`[API /api/restaurants/${params.restaurantId} PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to update restaurant: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
