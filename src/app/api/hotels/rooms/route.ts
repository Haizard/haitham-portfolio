import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireRoles } from '@/lib/rbac';
import { createRoom, getRoomsByPropertyId, getPropertyById } from '@/lib/hotels-data';

// Validation schemas
const bedConfigurationSchema = z.object({
  type: z.enum(['single', 'double', 'queen', 'king', 'sofa_bed']),
  count: z.number().int().min(1),
});

const roomCapacitySchema = z.object({
  adults: z.number().int().min(1),
  children: z.number().int().min(0),
  infants: z.number().int().min(0),
});

const roomPricingSchema = z.object({
  basePrice: z.number().min(0),
  currency: z.string().length(3),
  taxRate: z.number().min(0).max(100),
  cleaningFee: z.number().min(0).optional(),
  extraGuestFee: z.number().min(0).optional(),
});

const roomAvailabilitySchema = z.object({
  totalRooms: z.number().int().min(1),
  minimumStay: z.number().int().min(1),
  maximumStay: z.number().int().min(1).optional(),
});

const createRoomSchema = z.object({
  propertyId: z.string().min(1),
  name: z.string().min(3).max(200),
  type: z.enum(['single', 'double', 'twin', 'suite', 'deluxe', 'family']),
  description: z.string().min(50).max(2000),
  images: z.array(z.object({
    url: z.string().url(),
    caption: z.string().optional(),
    order: z.number().int().min(0),
  })).min(1).max(10),
  capacity: roomCapacitySchema,
  bedConfiguration: z.array(bedConfigurationSchema).min(1),
  size: z.number().min(1),
  amenities: z.array(z.string()).min(1),
  pricing: roomPricingSchema,
  availability: roomAvailabilitySchema,
  isActive: z.boolean().default(true),
});

// POST /api/hotels/rooms - Create a new room
export async function POST(request: NextRequest) {
  try {
    // Require authentication and property_owner role
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const roleCheck = await requireRoles(['property_owner', 'admin']);
    if (roleCheck instanceof NextResponse) {
      return roleCheck;
    }

    const body = await request.json();
    const validatedData = createRoomSchema.parse(body);

    // Verify property exists and user owns it
    const property = await getPropertyById(validatedData.propertyId);
    if (!property) {
      return NextResponse.json({
        success: false,
        message: 'Property not found',
      }, { status: 404 });
    }

    // Check ownership
    const isOwner = property.ownerId === authResult.user.id;
    const isAdmin = authResult.user.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to add rooms to this property',
      }, { status: 403 });
    }

    // Create room
    const room = await createRoom(validatedData);

    return NextResponse.json({
      success: true,
      room,
      message: 'Room created successfully',
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Error creating room:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create room',
    }, { status: 500 });
  }
}

// GET /api/hotels/rooms?propertyId=xxx - Get rooms by property ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');

    if (!propertyId) {
      return NextResponse.json({
        success: false,
        message: 'Property ID is required',
      }, { status: 400 });
    }

    // Verify property exists
    const property = await getPropertyById(propertyId);
    if (!property) {
      return NextResponse.json({
        success: false,
        message: 'Property not found',
      }, { status: 404 });
    }

    // Get rooms
    const rooms = await getRoomsByPropertyId(propertyId);

    return NextResponse.json({
      success: true,
      rooms,
      count: rooms.length,
    });

  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch rooms',
    }, { status: 500 });
  }
}

