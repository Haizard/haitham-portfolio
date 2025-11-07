import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getVehicleById, checkVehicleAvailability } from '@/lib/cars-data';
import { differenceInDays, parseISO } from 'date-fns';

const availabilityQuerySchema = z.object({
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// GET /api/cars/vehicles/[id]/availability - Check vehicle availability
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    
    const pickupDate = searchParams.get('pickupDate');
    const returnDate = searchParams.get('returnDate');

    if (!pickupDate || !returnDate) {
      return NextResponse.json(
        { success: false, error: 'pickupDate and returnDate are required' },
        { status: 400 }
      );
    }

    // Validate dates
    try {
      availabilityQuerySchema.parse({ pickupDate, returnDate });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Invalid date format. Use YYYY-MM-DD', details: error.errors },
          { status: 400 }
        );
      }
      throw error;
    }

    // Validate date logic
    const pickup = parseISO(pickupDate);
    const returnD = parseISO(returnDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (pickup < now) {
      return NextResponse.json(
        { success: false, error: 'Pickup date cannot be in the past' },
        { status: 400 }
      );
    }

    if (returnD <= pickup) {
      return NextResponse.json(
        { success: false, error: 'Return date must be after pickup date' },
        { status: 400 }
      );
    }

    // Get vehicle
    const vehicle = await getVehicleById(params.id);
    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Check availability
    const availability = await checkVehicleAvailability(params.id, pickupDate, returnDate);

    // Calculate pricing
    const numberOfDays = differenceInDays(returnD, pickup);
    let totalPrice = 0;
    let dailyRate = vehicle.pricing.dailyRate;

    // Use weekly or monthly rate if applicable
    if (numberOfDays >= 30 && vehicle.pricing.monthlyRate) {
      const months = Math.floor(numberOfDays / 30);
      const remainingDays = numberOfDays % 30;
      totalPrice = (months * vehicle.pricing.monthlyRate) + (remainingDays * dailyRate);
    } else if (numberOfDays >= 7 && vehicle.pricing.weeklyRate) {
      const weeks = Math.floor(numberOfDays / 7);
      const remainingDays = numberOfDays % 7;
      totalPrice = (weeks * vehicle.pricing.weeklyRate) + (remainingDays * dailyRate);
    } else {
      totalPrice = numberOfDays * dailyRate;
    }

    const insuranceFee = (vehicle.pricing.insuranceFee || 0) * numberOfDays;
    const deposit = vehicle.pricing.deposit;
    const grandTotal = totalPrice + insuranceFee + deposit;

    return NextResponse.json({
      success: true,
      available: availability.available,
      numberOfDays,
      pricing: {
        dailyRate,
        numberOfDays,
        subtotal: totalPrice,
        insuranceFee,
        deposit,
        totalPrice: grandTotal,
        currency: vehicle.pricing.currency,
      },
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        category: vehicle.category,
        transmission: vehicle.transmission,
        fuelType: vehicle.fuelType,
        seats: vehicle.seats,
        mileageLimit: vehicle.pricing.mileageLimit,
        extraMileageFee: vehicle.pricing.extraMileageFee,
      },
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check availability' },
      { status: 500 }
    );
  }
}

