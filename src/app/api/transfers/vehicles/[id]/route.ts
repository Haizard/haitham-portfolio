import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/rbac';
import {
  getTransferVehicleById,
  updateTransferVehicle,
  deleteTransferVehicle,
} from '@/lib/transfers-data';

const updateVehicleSchema = z.object({
  category: z.enum(['sedan', 'suv', 'van', 'minibus', 'bus', 'luxury']).optional(),
  make: z.string().min(2).optional(),
  model: z.string().min(1).optional(),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1).optional(),
  color: z.string().min(2).optional(),
  licensePlate: z.string().min(3).optional(),
  capacity: z.object({
    passengers: z.number().int().min(1).max(50),
    luggage: z.number().int().min(0).max(50),
  }).optional(),
  features: z.array(z.string()).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    caption: z.string().optional(),
    isPrimary: z.boolean(),
  })).optional(),
  location: z.object({
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
    airport: z.string().optional(),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
  }).optional(),
  pricing: z.object({
    basePrice: z.number().min(0),
    pricePerKm: z.number().min(0),
    pricePerHour: z.number().min(0),
    currency: z.string().length(3),
    airportSurcharge: z.number().min(0).optional(),
    nightSurcharge: z.number().min(0).optional(),
    waitingTimeFee: z.number().min(0).optional(),
  }).optional(),
  driverInfo: z.object({
    name: z.string().min(2),
    phone: z.string().min(5),
    licenseNumber: z.string().min(5),
    yearsOfExperience: z.number().int().min(0),
    languages: z.array(z.string()).min(1),
  }).optional(),
  status: z.enum(['available', 'in_service', 'maintenance', 'inactive']).optional(),
});

// GET /api/transfers/vehicles/[id] - Get vehicle by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const vehicle = await getTransferVehicleById(params.id);

    if (!vehicle) {
      return NextResponse.json({
        success: false,
        message: 'Transfer vehicle not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      vehicle,
    });

  } catch (error) {
    console.error('Error fetching transfer vehicle:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch transfer vehicle',
    }, { status: 500 });
  }
}

// PATCH /api/transfers/vehicles/[id] - Update vehicle
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth();
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
      }, { status: 401 });
    }

    const vehicle = await getTransferVehicleById(params.id);
    if (!vehicle) {
      return NextResponse.json({
        success: false,
        message: 'Transfer vehicle not found',
      }, { status: 404 });
    }

    // Check if user is the owner or admin
    const isOwner = vehicle.ownerId === authResult.user.id;
    const isAdmin = authResult.user.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to update this vehicle',
      }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateVehicleSchema.parse(body);

    const updatedVehicle = await updateTransferVehicle(params.id, validatedData);

    return NextResponse.json({
      success: true,
      vehicle: updatedVehicle,
      message: 'Transfer vehicle updated successfully',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Error updating transfer vehicle:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update transfer vehicle',
    }, { status: 500 });
  }
}

// DELETE /api/transfers/vehicles/[id] - Delete vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth();
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
      }, { status: 401 });
    }

    const vehicle = await getTransferVehicleById(params.id);
    if (!vehicle) {
      return NextResponse.json({
        success: false,
        message: 'Transfer vehicle not found',
      }, { status: 404 });
    }

    // Check if user is the owner or admin
    const isOwner = vehicle.ownerId === authResult.user.id;
    const isAdmin = authResult.user.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to delete this vehicle',
      }, { status: 403 });
    }

    const deleted = await deleteTransferVehicle(params.id);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        message: 'Failed to delete transfer vehicle',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Transfer vehicle deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting transfer vehicle:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete transfer vehicle',
    }, { status: 500 });
  }
}

