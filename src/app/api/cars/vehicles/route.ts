import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireRoles } from '@/lib/rbac';
import { createVehicle, searchVehicles, type VehicleSearchFilters } from '@/lib/cars-data';

// Validation schemas
const vehicleImageSchema = z.object({
  url: z.string().url(),
  caption: z.string().optional(),
  isPrimary: z.boolean(),
  order: z.number().int().min(0),
});

const vehicleLocationSchema = z.object({
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  country: z.string().min(2),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  pickupInstructions: z.string().optional(),
});

const vehiclePricingSchema = z.object({
  dailyRate: z.number().positive(),
  weeklyRate: z.number().positive().optional(),
  monthlyRate: z.number().positive().optional(),
  currency: z.string().length(3),
  deposit: z.number().min(0),
  mileageLimit: z.number().int().positive().optional(),
  extraMileageFee: z.number().min(0).optional(),
  insuranceFee: z.number().min(0).optional(),
});

const createVehicleSchema = z.object({
  make: z.string().min(2).max(50),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  category: z.enum(['economy', 'compact', 'midsize', 'fullsize', 'suv', 'luxury', 'van']),
  transmission: z.enum(['automatic', 'manual']),
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid']),
  seats: z.number().int().min(2).max(15),
  doors: z.number().int().min(2).max(5),
  luggage: z.number().int().min(0).max(10),
  color: z.string().min(2).max(30),
  licensePlate: z.string().min(2).max(20),
  vin: z.string().optional(),
  images: z.array(vehicleImageSchema).min(1).max(10),
  features: z.array(z.string()).min(0),
  location: vehicleLocationSchema,
  pricing: vehiclePricingSchema,
  videoUrl: z.string().url().optional().or(z.literal('')),
});

// POST /api/cars/vehicles - Create a new vehicle
export async function POST(request: NextRequest) {
  try {
    // Require car_owner or admin role
    // Require car_owner or admin role
    const authResult = await requireRoles(['car_owner', 'admin']);

    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const body = await request.json();
    const validatedData = createVehicleSchema.parse(body);

    // Create vehicle
    const vehicle = await createVehicle({
      ...validatedData,
      ownerId: authResult.user!.id,
      status: 'available', // New vehicles are available by default
    });

    return NextResponse.json(
      {
        success: true,
        vehicle,
        message: 'Vehicle created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}

// GET /api/cars/vehicles - Search vehicles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check if filtering by owner
    const ownerIdParam = searchParams.get('ownerId');
    if (ownerIdParam === 'me') {
      // Require authentication to get own vehicles
      const authResult = await requireAuth();
      if (authResult instanceof NextResponse) {
        return authResult;
      }

      const { user } = authResult;

      // Get vehicles owned by the authenticated user
      const { getCollection } = await import('@/lib/mongodb');
      const vehiclesCollection = await getCollection('vehicles');
      const { docToVehicle } = await import('@/lib/cars-data');

      const vehiclesDocs = await vehiclesCollection
        .find({ ownerId: authResult.user.id })
        .toArray();

      const vehicles = vehiclesDocs.map(docToVehicle);

      return NextResponse.json({
        success: true,
        vehicles,
        count: vehicles.length,
      });
    }

    // Build filters from query params
    const filters: VehicleSearchFilters = {};

    if (searchParams.get('city')) {
      filters.city = searchParams.get('city')!;
    }
    if (searchParams.get('country')) {
      filters.country = searchParams.get('country')!;
    }
    if (searchParams.get('pickupDate')) {
      filters.pickupDate = searchParams.get('pickupDate')!;
    }
    if (searchParams.get('returnDate')) {
      filters.returnDate = searchParams.get('returnDate')!;
    }
    if (searchParams.get('category')) {
      filters.category = searchParams.get('category') as any;
    }
    if (searchParams.get('transmission')) {
      filters.transmission = searchParams.get('transmission') as any;
    }
    if (searchParams.get('fuelType')) {
      filters.fuelType = searchParams.get('fuelType') as any;
    }
    if (searchParams.get('minSeats')) {
      filters.minSeats = parseInt(searchParams.get('minSeats')!);
    }
    if (searchParams.get('features')) {
      filters.features = searchParams.get('features')!.split(',');
    }
    if (searchParams.get('minPrice')) {
      filters.minPrice = parseFloat(searchParams.get('minPrice')!);
    }
    if (searchParams.get('maxPrice')) {
      filters.maxPrice = parseFloat(searchParams.get('maxPrice')!);
    }

    const vehicles = await searchVehicles(filters);

    return NextResponse.json({
      success: true,
      vehicles,
      count: vehicles.length,
    });
  } catch (error) {
    console.error('Error searching vehicles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search vehicles' },
      { status: 500 }
    );
  }
}

