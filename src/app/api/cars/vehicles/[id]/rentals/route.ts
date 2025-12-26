import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/rbac';
import { getVehicleById, getCarRentalsByVehicleId } from '@/lib/cars-data';

// GET /api/cars/vehicles/[id]/rentals - Get rentals for a vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Require authentication
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Get the vehicle to check ownership
    const vehicle = await getVehicleById(id);
    if (!vehicle) {
      return NextResponse.json({
        success: false,
        message: 'Vehicle not found',
      }, { status: 404 });
    }

    // Check if user is the vehicle owner or admin
    const isOwner = vehicle.ownerId === authResult.user.id;
    const isAdmin = authResult.user.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to view rentals for this vehicle',
      }, { status: 403 });
    }

    // Get all rentals for this vehicle
    const rentals = await getCarRentalsByVehicleId(id);

    return NextResponse.json({
      success: true,
      rentals,
      count: rentals.length,
    });

  } catch (error) {
    console.error('Error fetching vehicle rentals:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch vehicle rentals',
    }, { status: 500 });
  }
}

