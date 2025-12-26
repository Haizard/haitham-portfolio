// src/app/api/restaurants/by-owner/[ownerId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getRestaurantByOwnerId, createRestaurantForUser } from '@/lib/restaurants-data';
import { getSession } from '@/lib/session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ownerId: string }> }
) {
  try {
    const session = await getSession();
    const { ownerId } = await params;

    if (!ownerId) {
      return NextResponse.json({ message: "Owner ID is required." }, { status: 400 });
    }

    // Authorization: ensure the logged-in user is requesting their own data
    if (!session.user || session.user.id !== ownerId) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 403 });
    }

    let restaurant = await getRestaurantByOwnerId(ownerId);

    if (!restaurant) {
      // If no restaurant exists, create a default one for this new owner
      console.log(`No restaurant found for owner ${ownerId}, creating a new one.`);
      restaurant = await createRestaurantForUser(ownerId, { name: session.user.name, email: session.user.email });
    }

    return NextResponse.json(restaurant);

  } catch (error: any) {
    console.error(`[API /api/restaurants/by-owner/${params.ownerId} GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch restaurant: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
