import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/rbac';
import { getCarRentalById, updateCarRental, getVehicleById } from '@/lib/cars-data';

const updateRentalSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'active', 'completed', 'cancelled']).optional(),
  mileageStart: z.number().int().min(0).optional(),
  mileageEnd: z.number().int().min(0).optional(),
  cancellationReason: z.string().max(500).optional(),
});

// GET /api/cars/rentals/[id] - Get rental by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth();
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.message },
        { status: 401 }
      );
    }

    const rental = await getCarRentalById(params.id);
    if (!rental) {
      return NextResponse.json(
        { success: false, error: 'Rental not found' },
        { status: 404 }
      );
    }

    // Check permissions: rental owner, vehicle owner, or admin
    const isRentalOwner = rental.userId === authResult.user!.id;
    const vehicle = await getVehicleById(rental.vehicleId);
    const isVehicleOwner = vehicle?.ownerId === authResult.user!.id;
    const isAdmin = authResult.user!.roles.includes('admin');

    if (!isRentalOwner && !isVehicleOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to view this rental' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      rental,
    });
  } catch (error) {
    console.error('Error fetching rental:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rental' },
      { status: 500 }
    );
  }
}

// PATCH /api/cars/rentals/[id] - Update rental
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth();
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.message },
        { status: 401 }
      );
    }

    const rental = await getCarRentalById(params.id);
    if (!rental) {
      return NextResponse.json(
        { success: false, error: 'Rental not found' },
        { status: 404 }
      );
    }

    // Check permissions
    const isRentalOwner = rental.userId === authResult.user!.id;
    const vehicle = await getVehicleById(rental.vehicleId);
    const isVehicleOwner = vehicle?.ownerId === authResult.user!.id;
    const isAdmin = authResult.user!.roles.includes('admin');

    const body = await request.json();
    const validatedData = updateRentalSchema.parse(body);

    // Permission checks based on action
    if (validatedData.status) {
      // Only rental owner can cancel
      if (validatedData.status === 'cancelled') {
        if (!isRentalOwner && !isAdmin) {
          return NextResponse.json(
            { success: false, error: 'Only the rental owner can cancel' },
            { status: 403 }
          );
        }

        // Cannot cancel if already active or completed
        if (rental.status === 'active' || rental.status === 'completed') {
          return NextResponse.json(
            { success: false, error: `Cannot cancel rental with status: ${rental.status}` },
            { status: 400 }
          );
        }

        // Add cancellation timestamp
        validatedData.cancellationReason = body.cancellationReason || 'No reason provided';
        const updates: any = {
          ...validatedData,
          cancelledAt: new Date().toISOString(),
        };

        const updatedRental = await updateCarRental(params.id, updates);
        return NextResponse.json({
          success: true,
          rental: updatedRental,
          message: 'Rental cancelled successfully',
        });
      }

      // Only vehicle owner can confirm, activate, or complete
      if (['confirmed', 'active', 'completed'].includes(validatedData.status)) {
        if (!isVehicleOwner && !isAdmin) {
          return NextResponse.json(
            { success: false, error: 'Only the vehicle owner can update rental status' },
            { status: 403 }
          );
        }
      }
    }

    // Mileage updates (only vehicle owner)
    if (validatedData.mileageStart !== undefined || validatedData.mileageEnd !== undefined) {
      if (!isVehicleOwner && !isAdmin) {
        return NextResponse.json(
          { success: false, error: 'Only the vehicle owner can update mileage' },
          { status: 403 }
        );
      }

      // Validate mileage
      if (validatedData.mileageEnd !== undefined && validatedData.mileageStart !== undefined) {
        if (validatedData.mileageEnd < validatedData.mileageStart) {
          return NextResponse.json(
            { success: false, error: 'End mileage cannot be less than start mileage' },
            { status: 400 }
          );
        }
      }
    }

    const updatedRental = await updateCarRental(params.id, validatedData);

    return NextResponse.json({
      success: true,
      rental: updatedRental,
      message: 'Rental updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating rental:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update rental' },
      { status: 500 }
    );
  }
}

