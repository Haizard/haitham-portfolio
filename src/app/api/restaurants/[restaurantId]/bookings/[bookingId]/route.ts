// src/app/api/restaurants/[restaurantId]/bookings/[bookingId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { updateTableBookingStatus, type TableBookingStatus } from '@/lib/restaurants-data';
import { z } from 'zod';

const statusUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { restaurantId: string; bookingId: string } }
) {
  try {
    // TODO: Add authentication to ensure the user owns this restaurant.
    const { bookingId } = params;
    const body = await request.json();
    const validation = statusUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid status update data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { status } = validation.data;
    const updatedBooking = await updateTableBookingStatus(bookingId, status);

    if (!updatedBooking) {
      return NextResponse.json({ message: "Booking not found or update failed." }, { status: 404 });
    }

    return NextResponse.json({ message: "Booking status updated successfully.", booking: updatedBooking });
  } catch (error: any) {
    console.error(`[API /restaurants/.../bookings PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to update booking status: ${error.message}` }, { status: 500 });
  }
}
