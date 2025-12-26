// src/app/api/restaurants/[restaurantId]/analytics/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getRestaurantAnalytics } from '@/lib/orders-data';
import { getSession } from '@/lib/session';
import { ObjectId } from 'mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ restaurantId: string }> }
) {
  try {
    const session = await getSession();
    // In a real app, you would verify the user owns this restaurantId
    if (!session.user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { restaurantId } = await params;
    if (!restaurantId || !ObjectId.isValid(restaurantId)) {
      return NextResponse.json({ message: "Valid restaurant ID is required." }, { status: 400 });
    }

    const analyticsData = await getRestaurantAnalytics(restaurantId);

    return NextResponse.json(analyticsData);

  } catch (error: any) {
    console.error(`[API /api/restaurants/${params.restaurantId}/analytics GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch analytics data: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
