import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireRoles } from '@/lib/rbac';
import {
  createTransferVehicle,
  searchTransferVehicles,
  type TransferVehicleSearchFilters,
} from '@/lib/transfers-data';

// Validation schemas
const vehicleImageSchema = z.object({
  url: z.string().url(),
  caption: z.string().optional(),
  isPrimary: z.boolean(),
});

const vehicleLocationSchema = z.object({
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  airport: z.string().optional(),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
});

const vehiclePricingSchema = z.object({
  basePrice: z.number().min(0),
  pricePerKm: z.number().min(0),
  pricePerHour: z.number().min(0),
  currency: z.string().length(3),
  airportSurcharge: z.number().min(0).optional(),
  nightSurcharge: z.number().min(0).optional(),
  waitingTimeFee: z.number().min(0).optional(),
});

const driverInfoSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(5),
  licenseNumber: z.string().min(5),
  yearsOfExperience: z.number().int().min(0),
  languages: z.array(z.string()).min(1),
});

const createVehicleSchema = z.object({
  category: z.enum(['sedan', 'suv', 'van', 'minibus', 'bus', 'luxury']),
  make: z.string().min(2),
  model: z.string().min(1),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  color: z.string().min(2),
  licensePlate: z.string().min(3),
  capacity: z.object({
    passengers: z.number().int().min(1).max(50),
    luggage: z.number().int().min(0).max(50),
  }),
  features: z.array(z.string()).min(1),
  images: z.array(vehicleImageSchema).min(1).max(10),
  location: vehicleLocationSchema,
  pricing: vehiclePricingSchema,
  driverInfo: driverInfoSchema.optional(),
  status: z.enum(['available', 'in_service', 'maintenance', 'inactive']).default('available'),
});

// POST /api/transfers/vehicles - Create transfer vehicle
export async function POST(request: NextRequest) {
  try {
    // Require transfer_provider or admin role
    const authResult = await requireRoles(request, ['transfer_provider', 'admin']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validatedData = createVehicleSchema.parse(body);

    // Create vehicle with owner ID from session
    const vehicle = await createTransferVehicle({
      ...validatedData,
      ownerId: authResult.user.id,
    });

    return NextResponse.json({
      success: true,
      vehicle,
      message: 'Transfer vehicle created successfully',
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Error creating transfer vehicle:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create transfer vehicle',
    }, { status: 500 });
  }
}

// GET /api/transfers/vehicles - Search transfer vehicles
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check if filtering by owner
    const ownerIdParam = searchParams.get('ownerId');
    if (ownerIdParam === 'me') {
      // Require authentication to get own vehicles
      const authResult = await requireAuth(request);
      if (!authResult.authenticated || !authResult.user) {
        return NextResponse.json({
          success: false,
          message: 'Authentication required',
        }, { status: 401 });
      }

      // Get vehicles owned by the authenticated user
      const { getCollection } = await import('@/lib/db');
      const vehiclesCollection = await getCollection('transfer_vehicles');
      const { docToTransferVehicle } = await import('@/lib/transfers-data');
      
      const vehiclesDocs = await vehiclesCollection
        .find({ ownerId: authResult.user.id })
        .toArray();
      
      const vehicles = vehiclesDocs.map(docToTransferVehicle).filter((v): v is any => v !== null);

      return NextResponse.json({
        success: true,
        vehicles,
        count: vehicles.length,
      });
    }

    // Build filters from query params
    const filters: TransferVehicleSearchFilters = {};

    if (searchParams.get('city')) {
      filters.city = searchParams.get('city')!;
    }
    if (searchParams.get('country')) {
      filters.country = searchParams.get('country')!;
    }
    if (searchParams.get('category')) {
      filters.category = searchParams.get('category') as any;
    }
    if (searchParams.get('minPassengers')) {
      filters.minPassengers = parseInt(searchParams.get('minPassengers')!);
    }
    if (searchParams.get('minLuggage')) {
      filters.minLuggage = parseInt(searchParams.get('minLuggage')!);
    }
    if (searchParams.get('features')) {
      filters.features = searchParams.get('features')!.split(',');
    }
    if (searchParams.get('maxPrice')) {
      filters.maxPrice = parseFloat(searchParams.get('maxPrice')!);
    }
    if (searchParams.get('pickupDate')) {
      filters.pickupDate = searchParams.get('pickupDate')!;
    }
    if (searchParams.get('pickupTime')) {
      filters.pickupTime = searchParams.get('pickupTime')!;
    }

    const vehicles = await searchTransferVehicles(filters);

    return NextResponse.json({
      success: true,
      vehicles,
      count: vehicles.length,
    });

  } catch (error) {
    console.error('Error searching transfer vehicles:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to search transfer vehicles',
    }, { status: 500 });
  }
}

