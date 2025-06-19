
import { NextResponse, type NextRequest } from 'next/server';
import { getBookingById, updateBookingStatus, deleteBooking, type BookingStatus } from '@/lib/bookings-data';
import { z } from 'zod';

const updateBookingStatusSchema = z.object({
  status: z.enum(["Pending", "Confirmed", "Cancelled", "Completed"], {
    required_error: "Status is required.",
    invalid_type_error: "Invalid status value.",
  }),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    // TODO: Add authentication for admin or specific user access
    const booking = await getBookingById(params.bookingId);
    if (!booking) {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }
    return NextResponse.json(booking);
  } catch (error: any) {
    console.error(`[API /api/bookings/${params.bookingId} GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch booking: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    // TODO: Add authentication to ensure only admins can update status
    const body = await request.json();
    const validation = updateBookingStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid status data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { status } = validation.data;
    const updatedBooking = await updateBookingStatus(params.bookingId, status as BookingStatus);

    if (!updatedBooking) {
      return NextResponse.json({ message: "Booking not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedBooking);

  } catch (error: any) {
    console.error(`[API /api/bookings/${params.bookingId} PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to update booking status: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    // TODO: Add authentication to ensure only admins can delete
    const success = await deleteBooking(params.bookingId);
    if (success) {
      return NextResponse.json({ message: "Booking deleted successfully" });
    } else {
      return NextResponse.json({ message: "Booking not found or delete failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`[API /api/bookings/${params.bookingId} DELETE] Error:`, error);
    return NextResponse.json({ message: `Failed to delete booking: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
