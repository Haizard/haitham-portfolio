import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/rbac';
import {
  getTransferBookingById,
  updateTransferBooking,
  getTransferVehicleById,
} from '@/lib/transfers-data';

const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'assigned', 'in_progress', 'completed', 'cancelled']).optional(),
  driverNotes: z.string().max(500).optional(),
  actualPickupTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  actualDropoffTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  actualDistance: z.number().min(0).optional(),
  cancellationReason: z.string().max(500).optional(),
});

// GET /api/transfers/bookings/[id] - Get booking by ID
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

    const booking = await getTransferBookingById(id);
    if (!booking) {
      return NextResponse.json({
        success: false,
        message: 'Transfer booking not found',
      }, { status: 404 });
    }

    // Check permissions: booking owner, vehicle owner, or admin
    const isBookingOwner = booking.userId === authResult.user.id;
    const vehicle = await getTransferVehicleById(booking.vehicleId);
    const isVehicleOwner = vehicle?.ownerId === authResult.user.id;
    const isAdmin = authResult.user.roles.includes('admin');

    if (!isBookingOwner && !isVehicleOwner && !isAdmin) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to view this booking',
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      booking,
    });

  } catch (error) {
    console.error('Error fetching transfer booking:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch transfer booking',
    }, { status: 500 });
  }
}

// PATCH /api/transfers/bookings/[id] - Update booking
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const booking = await getTransferBookingById(id);
    if (!booking) {
      return NextResponse.json({
        success: false,
        message: 'Transfer booking not found',
      }, { status: 404 });
    }

    // Check permissions
    const isBookingOwner = booking.userId === authResult.user.id;
    const vehicle = await getTransferVehicleById(booking.vehicleId);
    const isVehicleOwner = vehicle?.ownerId === authResult.user.id;
    const isAdmin = authResult.user.roles.includes('admin');

    const body = await request.json();
    const validatedData = updateBookingSchema.parse(body);

    // Status updates
    if (validatedData.status) {
      // Customers can only cancel their own bookings
      if (isBookingOwner && !isVehicleOwner && !isAdmin) {
        if (validatedData.status !== 'cancelled') {
          return NextResponse.json({
            success: false,
            message: 'You can only cancel your own bookings',
          }, { status: 403 });
        }
        if (booking.status === 'in_progress' || booking.status === 'completed') {
          return NextResponse.json({
            success: false,
            message: 'Cannot cancel a booking that is in progress or completed',
          }, { status: 400 });
        }
      }

      // Vehicle owners can update to confirmed, assigned, in_progress, completed
      if (isVehicleOwner && !isAdmin) {
        const allowedStatuses = ['confirmed', 'assigned', 'in_progress', 'completed', 'cancelled'];
        if (!allowedStatuses.includes(validatedData.status)) {
          return NextResponse.json({
            success: false,
            message: 'Invalid status update',
          }, { status: 400 });
        }
      }
    }

    // Driver notes and actual times (only vehicle owner or admin)
    if (
      (validatedData.driverNotes !== undefined ||
        validatedData.actualPickupTime !== undefined ||
        validatedData.actualDropoffTime !== undefined ||
        validatedData.actualDistance !== undefined) &&
      !isVehicleOwner &&
      !isAdmin
    ) {
      return NextResponse.json({
        success: false,
        message: 'Only the vehicle owner can update driver notes and actual times',
      }, { status: 403 });
    }

    const updatedBooking = await updateTransferBooking(id, validatedData);

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: 'Transfer booking updated successfully',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Error updating transfer booking:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update transfer booking',
    }, { status: 500 });
  }
}

