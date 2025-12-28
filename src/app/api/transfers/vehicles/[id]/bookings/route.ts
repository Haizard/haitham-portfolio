import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/rbac';
import { getTransferVehicleById, getTransferBookingsByVehicleId } from '@/lib/transfers-data';

// GET /api/transfers/vehicles/[id]/bookings - Get bookings for a vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Get the vehicle to check ownership
    const vehicle = await getTransferVehicleById(id);
    if (!vehicle) {
      return NextResponse.json({
        success: false,
        message: 'Transfer vehicle not found',
      }, { status: 404 });
    }

    // Check if user is the vehicle owner or admin
    const isOwner = vehicle.ownerId === authResult.user.id;
    const isAdmin = authResult.user.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to view bookings for this vehicle',
      }, { status: 403 });
    }

    // Get all bookings for this vehicle
    const bookings = await getTransferBookingsByVehicleId(id);

    return NextResponse.json({
      success: true,
      bookings,
      count: bookings.length,
    });

  } catch (error) {
    console.error('Error fetching vehicle bookings:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch vehicle bookings',
    }, { status: 500 });
  }
}

