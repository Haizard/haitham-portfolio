import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/rbac';
import { getPropertyById, getHotelBookingsByPropertyId } from '@/lib/hotels-data';

// GET /api/hotels/properties/[id]/bookings - Get bookings for a property
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Get the property to check ownership
    const property = await getPropertyById(params.id);
    if (!property) {
      return NextResponse.json({
        success: false,
        message: 'Property not found',
      }, { status: 404 });
    }

    // Check if user is the owner or admin
    const isOwner = property.ownerId === authResult.user.id;
    const isAdmin = authResult.user.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to view bookings for this property',
      }, { status: 403 });
    }

    // Get bookings
    const bookings = await getHotelBookingsByPropertyId(params.id);

    return NextResponse.json({
      success: true,
      bookings,
      count: bookings.length,
    });

  } catch (error) {
    console.error('Error fetching property bookings:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch bookings',
    }, { status: 500 });
  }
}

