import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireRoles } from '@/lib/rbac';
import { createProperty, searchProperties, type PropertySearchFilters } from '@/lib/hotels-data';

// Validation schemas
const propertyImageSchema = z.object({
  url: z.string().url(),
  caption: z.string().optional(),
  order: z.number().int().min(0),
});

const propertyLocationSchema = z.object({
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  country: z.string().min(1),
  postalCode: z.string().optional(),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
});

const propertyPoliciesSchema = z.object({
  checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  cancellationPolicy: z.enum(['flexible', 'moderate', 'strict', 'non_refundable']),
  childrenAllowed: z.boolean(),
  petsAllowed: z.boolean(),
  smokingAllowed: z.boolean(),
  partiesAllowed: z.boolean(),
});

const createPropertySchema = z.object({
  name: z.string().min(3).max(200),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/),
  type: z.enum(['hotel', 'apartment', 'resort', 'villa', 'hostel', 'guesthouse']),
  description: z.string().min(50).max(5000),
  images: z.array(propertyImageSchema).min(1).max(20),
  location: propertyLocationSchema,
  amenities: z.array(z.string()).min(1),
  starRating: z.number().int().min(1).max(5),
  policies: propertyPoliciesSchema,
  contactInfo: z.object({
    phone: z.string().min(5),
    email: z.string().email(),
    website: z.string().url().optional(),
  }),
  totalRooms: z.number().int().min(1),
});

const searchPropertiesSchema = z.object({
  city: z.string().optional(),
  country: z.string().optional(),
  checkInDate: z.string().optional(),
  checkOutDate: z.string().optional(),
  guests: z.number().int().min(1).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  propertyType: z.enum(['hotel', 'apartment', 'resort', 'villa', 'hostel', 'guesthouse']).optional(),
  amenities: z.array(z.string()).optional(),
  minRating: z.number().min(0).max(5).optional(),
});

// POST /api/hotels/properties - Create a new property
export async function POST(request: NextRequest) {
  try {
    // Require authentication and property_owner role
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const roleCheck = await requireRoles(['property_owner', 'admin']);
    if (roleCheck instanceof NextResponse) {
      return roleCheck;
    }

    const body = await request.json();
    const validatedData = createPropertySchema.parse(body);

    // Create property with owner ID from session
    const property = await createProperty({
      ...validatedData,
      ownerId: authResult.user.id,
      status: 'pending_approval', // New properties need approval
    });

    return NextResponse.json({
      success: true,
      property,
      message: 'Property created successfully. It will be reviewed by our team.',
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Error creating property:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create property',
    }, { status: 500 });
  }
}

// GET /api/hotels/properties - Search properties
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Check if filtering by owner
    const ownerIdParam = searchParams.get('ownerId');
    if (ownerIdParam === 'me') {
      // Require authentication to get own properties
      const authResult = await requireAuth();
      if (authResult instanceof NextResponse) {
        return authResult;
      }

      const { user } = authResult;

      // Get properties owned by the authenticated user
      const { getCollection } = await import('@/lib/mongodb');
      const propertiesCollection = await getCollection('properties');
      const { docToProperty } = await import('@/lib/hotels-data');

      const propertiesDocs = await propertiesCollection
        .find({ ownerId: authResult.user.id })
        .toArray();

      const properties = propertiesDocs.map(docToProperty);

      return NextResponse.json({
        success: true,
        properties,
        count: properties.length,
      });
    }

    // Parse query parameters
    const filters: PropertySearchFilters = {
      city: searchParams.get('city') || undefined,
      country: searchParams.get('country') || undefined,
      checkInDate: searchParams.get('checkInDate') || undefined,
      checkOutDate: searchParams.get('checkOutDate') || undefined,
      guests: searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      propertyType: searchParams.get('propertyType') as any || undefined,
      amenities: searchParams.get('amenities')?.split(',') || undefined,
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
    };

    // Validate filters
    const validatedFilters = searchPropertiesSchema.parse(filters);

    // Search properties
    const properties = await searchProperties(validatedFilters);

    return NextResponse.json({
      success: true,
      properties,
      count: properties.length,
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid search parameters',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Error searching properties:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to search properties',
    }, { status: 500 });
  }
}

