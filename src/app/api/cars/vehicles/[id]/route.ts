import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireRoles } from '@/lib/rbac';
import { getVehicleById, updateVehicle, deleteVehicle } from '@/lib/cars-data';

// Validation schemas (partial for updates)
const updateVehicleSchema = z.object({
  make: z.string().min(2).max(50).optional(),
  model: z.string().min(1).max(100).optional(),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1).optional(),
  category: z.enum(['economy', 'compact', 'midsize', 'fullsize', 'suv', 'luxury', 'van']).optional(),
  transmission: z.enum(['automatic', 'manual']).optional(),
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid']).optional(),
  seats: z.number().int().min(2).max(15).optional(),
  doors: z.number().int().min(2).max(5).optional(),
  luggage: z.number().int().min(0).max(10).optional(),
  color: z.string().min(2).max(30).optional(),
  licensePlate: z.string().min(2).max(20).optional(),
  vin: z.string().optional(),
  images: z.array(z.object({
    url: z.string().url(),
    caption: z.string().optional(),
    isPrimary: z.boolean(),
    order: z.number().int().min(0),
  })).optional(),
  features: z.array(z.string()).optional(),
  location: z.object({
    address: z.string().min(5),
    city: z.string().min(2),
    state: z.string().min(2),
    country: z.string().min(2),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    pickupInstructions: z.string().optional(),
  }).optional(),
  pricing: z.object({
    dailyRate: z.number().positive(),
    weeklyRate: z.number().positive().optional(),
    monthlyRate: z.number().positive().optional(),
    currency: z.string().length(3),
    deposit: z.number().min(0),
    mileageLimit: z.number().int().positive().optional(),
    extraMileageFee: z.number().min(0).optional(),
    insuranceFee: z.number().min(0).optional(),
  }).optional(),
  status: z.enum(['available', 'rented', 'maintenance', 'inactive']).optional(),
});

// GET /api/cars/vehicles/[id] - Get vehicle by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const vehicle = await getVehicleById(id);

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      vehicle,
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicle' },
      { status: 500 }
    );
  }
}

// PATCH /api/cars/vehicles/[id] - Update vehicle
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

    const { user } = authResult;

    // Get the vehicle to check ownership
    const vehicle = await getVehicleById(id);
    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner or admin
    const isOwner = vehicle.ownerId === authResult.user!.id;
    const isAdmin = authResult.user!.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to update this vehicle' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateVehicleSchema.parse(body);

    const updatedVehicle = await updateVehicle(id, validatedData);

    return NextResponse.json({
      success: true,
      vehicle: updatedVehicle,
      message: 'Vehicle updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}

// DELETE /api/cars/vehicles/[id] - Delete vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    // Get the vehicle to check ownership
    const vehicle = await getVehicleById(id);
    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Check if user is the owner or admin
    const isOwner = vehicle.ownerId === authResult.user!.id;
    const isAdmin = authResult.user!.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to delete this vehicle' },
        { status: 403 }
      );
    }

    const deleted = await deleteVehicle(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Failed to delete vehicle' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Vehicle deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete vehicle' },
      { status: 500 }
    );
  }
}

