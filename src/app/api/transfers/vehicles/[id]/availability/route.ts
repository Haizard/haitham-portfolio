import { NextRequest, NextResponse } from 'next/server';
import { checkTransferVehicleAvailability, getTransferVehicleById } from '@/lib/transfers-data';

// GET /api/transfers/vehicles/[id]/availability - Check vehicle availability
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const pickupDate = searchParams.get('pickupDate');
    const pickupTime = searchParams.get('pickupTime');

    if (!pickupDate || !pickupTime) {
      return NextResponse.json({
        success: false,
        message: 'pickupDate and pickupTime are required',
      }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(pickupDate)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD',
      }, { status: 400 });
    }

    // Validate time format (HH:mm)
    if (!/^\d{2}:\d{2}$/.test(pickupTime)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid time format. Use HH:mm',
      }, { status: 400 });
    }

    const vehicle = await getTransferVehicleById(id);
    if (!vehicle) {
      return NextResponse.json({
        success: false,
        message: 'Transfer vehicle not found',
      }, { status: 404 });
    }

    const availability = await checkTransferVehicleAvailability(
      id,
      pickupDate,
      pickupTime
    );

    return NextResponse.json({
      success: true,
      available: availability.available,
      vehicle: {
        id: vehicle.id,
        category: vehicle.category,
        make: vehicle.make,
        model: vehicle.model,
        capacity: vehicle.capacity,
        pricing: vehicle.pricing,
      },
    });

  } catch (error) {
    console.error('Error checking transfer vehicle availability:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check availability',
    }, { status: 500 });
  }
}

