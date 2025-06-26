
import { NextResponse, type NextRequest } from 'next/server';
import { addBooking, getAllBookings } from '@/lib/bookings-data';
import { z } from 'zod';

const createBookingSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required."),
  serviceName: z.string().min(1, "Service name is required."),
  clientName: z.string().min(2, "Client name must be at least 2 characters.").max(100),
  clientEmail: z.string().email("Invalid email address."),
  requestedDateRaw: z.string().min(1, "Preferred date is required."), // Simple validation for now
  requestedTimeRaw: z.string().min(1, "Preferred time is required."), // Simple validation for now
  clientNotes: z.string().max(500, "Notes cannot exceed 500 characters.").optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createBookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid booking data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const bookingData = validation.data;
    // The addBooking data layer function now handles fetching the service and adding the freelancerId
    const newBooking = await addBooking(bookingData);
    return NextResponse.json(newBooking, { status: 201 });

  } catch (error: any) {
    console.error("[API /api/bookings POST] Failed to create booking:", error);
    return NextResponse.json({ message: `Failed to create booking: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const freelancerId = searchParams.get('freelancerId') || undefined;

    // The API now supports filtering bookings by freelancerId
    const bookings = await getAllBookings(freelancerId);
    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error("[API /api/bookings GET] Failed to fetch bookings:", error);
    return NextResponse.json({ message: `Failed to fetch bookings: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
