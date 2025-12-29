import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/rbac';
import { getHotelBookingById, updateHotelBooking, getPropertyById } from '@/lib/hotels-data';

// Validation schema for updates
const updateBookingSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled']).optional(),
  specialRequests: z.string().optional(),
  cancellationReason: z.string().optional(),
});

// GET /api/hotels/bookings/[id] - Get booking by ID
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

    const booking = await getHotelBookingById(id);

    if (!booking) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found',
      }, { status: 404 });
    }

    // Check if user is the booking owner or property owner or admin
    const isBookingOwner = booking.userId === authResult.user.id;
    const isAdmin = authResult.user.roles.includes('admin');

    let isPropertyOwner = false;
    if (!isBookingOwner && !isAdmin) {
      const property = await getPropertyById(booking.propertyId);
      isPropertyOwner = property?.ownerId === authResult.user.id;
    }

    if (!isBookingOwner && !isPropertyOwner && !isAdmin) {
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
    console.error('Error fetching booking:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch booking',
    }, { status: 500 });
  }
}

// PATCH /api/hotels/bookings/[id] - Update booking
export async function PATCH(
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

    const booking = await getHotelBookingById(id);

    if (!booking) {
      return NextResponse.json({
        success: false,
        message: 'Booking not found',
      }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateBookingSchema.parse(body);

    // Check permissions based on what's being updated
    const isBookingOwner = booking.userId === authResult.user.id;
    const isAdmin = authResult.user.roles.includes('admin');

    const property = await getPropertyById(booking.propertyId);
    const isPropertyOwner = property?.ownerId?.toString() === authResult.user.id;

    // Only booking owner can cancel
    if (validatedData.status === 'cancelled' && !isBookingOwner && !isAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Only the booking owner can cancel a booking',
      }, { status: 403 });
    }

    // Only property owner or admin can confirm/check-in/check-out
    if (
      validatedData.status &&
      ['confirmed', 'checked_in', 'checked_out'].includes(validatedData.status) &&
      !isPropertyOwner &&
      !isAdmin
    ) {
      console.warn(`[HOTEL_PERM_DENIED] User ${authResult.user.id} tried to update booking ${id} to ${validatedData.status}. Property owner is ${property?.ownerId}`);
      return NextResponse.json({
        success: false,
        message: 'Only the property owner can update booking status',
      }, { status: 403 });
    }

    // Prevent cancellation if already checked in or checked out
    if (
      validatedData.status === 'cancelled' &&
      ['checked_in', 'checked_out'].includes(booking.status)
    ) {
      return NextResponse.json({
        success: false,
        message: 'Cannot cancel a booking that has already started or completed',
      }, { status: 400 });
    }

    // Add cancellation timestamp if cancelling
    const updateData: any = { ...validatedData };
    if (validatedData.status === 'cancelled') {
      updateData.cancelledAt = new Date().toISOString();
    }

    // Update booking
    const updatedBooking = await updateHotelBooking(id, updateData);

    if (!updatedBooking) {
      return NextResponse.json({
        success: false,
        message: 'Failed to update booking',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: 'Booking updated successfully',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Error updating booking:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update booking',
    }, { status: 500 });
  }
}
