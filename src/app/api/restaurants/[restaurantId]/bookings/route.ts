// src/app/api/restaurants/[restaurantId]/bookings/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { addTableBooking, getBookingsForRestaurant } from '@/lib/restaurants-data';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const bookingSchema = z.object({
  customerName: z.string().min(2, "Name is required."),
  customerEmail: z.string().email("A valid email is required."),
  bookingDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: "Invalid date format." }),
  bookingTime: z.string().min(1, "Time is required."),
  guestCount: z.coerce.number().int().min(1, "At least one guest is required.").max(20, "For parties larger than 20, please contact us directly."),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = params;
    if (!ObjectId.isValid(restaurantId)) {
        return NextResponse.json({ message: "Invalid restaurant ID." }, { status: 400 });
    }

    const body = await request.json();
    const validation = bookingSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid booking data.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const newBooking = await addTableBooking({ restaurantId, ...validation.data });
    return NextResponse.json(newBooking, { status: 201 });

  } catch (error: any) {
    console.error(`[API /restaurants/.../bookings POST] Error:`, error);
    return NextResponse.json({ message: `Failed to create booking: ${error.message}` }, { status: 500 });
  }
}


export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = params;
    if (!ObjectId.isValid(restaurantId)) {
        return NextResponse.json({ message: "Invalid restaurant ID." }, { status: 400 });
    }
    // TODO: Authorize that the requester owns this restaurant
    const bookings = await getBookingsForRestaurant(restaurantId);
    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error(`[API /restaurants/.../bookings GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch bookings: ${error.message}` }, { status: 500 });
  }
}
