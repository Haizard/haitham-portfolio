import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRoomAvailability, getRoomById } from '@/lib/hotels-data';

// Validation schema
const availabilitySchema = z.object({
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// GET /api/hotels/rooms/[id]/availability - Check room availability
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const checkInDate = searchParams.get('checkInDate');
    const checkOutDate = searchParams.get('checkOutDate');

    if (!checkInDate || !checkOutDate) {
      return NextResponse.json({
        success: false,
        message: 'Check-in and check-out dates are required',
      }, { status: 400 });
    }

    // Validate dates
    const validatedData = availabilitySchema.parse({
      checkInDate,
      checkOutDate,
    });

    // Verify room exists
    const room = await getRoomById(id);
    if (!room) {
      return NextResponse.json({
        success: false,
        message: 'Room not found',
      }, { status: 404 });
    }

    // Check if room is active
    if (!room.isActive) {
      return NextResponse.json({
        success: false,
        message: 'Room is not available for booking',
        available: false,
        availableRooms: 0,
      });
    }

    // Validate date logic
    const checkIn = new Date(validatedData.checkInDate);
    const checkOut = new Date(validatedData.checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return NextResponse.json({
        success: false,
        message: 'Check-in date cannot be in the past',
      }, { status: 400 });
    }

    if (checkOut <= checkIn) {
      return NextResponse.json({
        success: false,
        message: 'Check-out date must be after check-in date',
      }, { status: 400 });
    }

    // Calculate number of nights
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    // Check minimum/maximum stay requirements
    if (nights < room.availability.minimumStay) {
      return NextResponse.json({
        success: false,
        message: `Minimum stay is ${room.availability.minimumStay} night(s)`,
        available: false,
        availableRooms: 0,
      });
    }

    if (room.availability.maximumStay && nights > room.availability.maximumStay) {
      return NextResponse.json({
        success: false,
        message: `Maximum stay is ${room.availability.maximumStay} night(s)`,
        available: false,
        availableRooms: 0,
      });
    }

    // Check availability
    const availability = await checkRoomAvailability(
      id,
      validatedData.checkInDate,
      validatedData.checkOutDate
    );

    // Calculate pricing
    const basePrice = room.pricing.basePrice * nights;
    const taxAmount = basePrice * (room.pricing.taxRate / 100);
    const cleaningFee = room.pricing.cleaningFee || 0;
    const totalPrice = basePrice + taxAmount + cleaningFee;

    return NextResponse.json({
      success: true,
      available: availability.available,
      availableRooms: availability.availableRooms,
      nights,
      pricing: {
        basePrice,
        taxAmount,
        cleaningFee,
        totalPrice,
        currency: room.pricing.currency,
        pricePerNight: room.pricing.basePrice,
      },
      room: {
        id: room.id,
        name: room.name,
        type: room.type,
        capacity: room.capacity,
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Error checking availability:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check availability',
    }, { status: 500 });
  }
}

