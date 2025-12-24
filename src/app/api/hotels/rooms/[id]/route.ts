import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/rbac';
import { getRoomById, updateRoom, deleteRoom, getPropertyById } from '@/lib/hotels-data';

// Validation schema for updates
const updateRoomSchema = z.object({
  name: z.string().min(3).max(200).optional(),
  type: z.enum(['single', 'double', 'twin', 'suite', 'deluxe', 'family']).optional(),
  description: z.string().min(50).max(2000).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    caption: z.string().optional(),
    order: z.number().int().min(0),
  })).optional(),
  capacity: z.object({
    adults: z.number().int().min(1),
    children: z.number().int().min(0),
    infants: z.number().int().min(0),
  }).optional(),
  bedConfiguration: z.array(z.object({
    type: z.enum(['single', 'double', 'queen', 'king', 'sofa_bed']),
    count: z.number().int().min(1),
  })).optional(),
  size: z.number().min(1).optional(),
  amenities: z.array(z.string()).optional(),
  pricing: z.object({
    basePrice: z.number().min(0),
    currency: z.string().length(3),
    taxRate: z.number().min(0).max(100),
    cleaningFee: z.number().min(0).optional(),
    extraGuestFee: z.number().min(0).optional(),
  }).optional(),
  availability: z.object({
    totalRooms: z.number().int().min(1),
    minimumStay: z.number().int().min(1),
    maximumStay: z.number().int().min(1).optional(),
  }).optional(),
  isActive: z.boolean().optional(),
});

// GET /api/hotels/rooms/[id] - Get room by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const room = await getRoomById(params.id);

    if (!room) {
      return NextResponse.json({
        success: false,
        message: 'Room not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      room,
    });

  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch room',
    }, { status: 500 });
  }
}

// PATCH /api/hotels/rooms/[id] - Update room
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Get the room to check ownership
    const room = await getRoomById(params.id);
    if (!room) {
      return NextResponse.json({
        success: false,
        message: 'Room not found',
      }, { status: 404 });
    }

    // Get the property to check ownership
    const property = await getPropertyById(room.propertyId);
    if (!property) {
      return NextResponse.json({
        success: false,
        message: 'Property not found',
      }, { status: 404 });
    }

    // Check if user is the owner or admin
    const isOwner = property.ownerId === authResult.user.id;
    const isAdmin = authResult.user.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to update this room',
      }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updateRoomSchema.parse(body);

    // Update room
    const updatedRoom = await updateRoom(params.id, validatedData);

    if (!updatedRoom) {
      return NextResponse.json({
        success: false,
        message: 'Failed to update room',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      room: updatedRoom,
      message: 'Room updated successfully',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Error updating room:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update room',
    }, { status: 500 });
  }
}

// DELETE /api/hotels/rooms/[id] - Delete room
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    // Get the room to check ownership
    const room = await getRoomById(params.id);
    if (!room) {
      return NextResponse.json({
        success: false,
        message: 'Room not found',
      }, { status: 404 });
    }

    // Get the property to check ownership
    const property = await getPropertyById(room.propertyId);
    if (!property) {
      return NextResponse.json({
        success: false,
        message: 'Property not found',
      }, { status: 404 });
    }

    // Check if user is the owner or admin
    const isOwner = property.ownerId === authResult.user.id;
    const isAdmin = authResult.user.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      return NextResponse.json({
        success: false,
        message: 'You do not have permission to delete this room',
      }, { status: 403 });
    }

    // Delete room
    const deleted = await deleteRoom(params.id);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        message: 'Failed to delete room',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Room deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete room',
    }, { status: 500 });
  }
}

