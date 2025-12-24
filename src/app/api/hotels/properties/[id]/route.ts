import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth, requireRoles } from '@/lib/rbac';
import { getPropertyById, updateProperty, deleteProperty } from '@/lib/hotels-data';

// Validation schema for updates
const updatePropertySchema = z.object({
  name: z.string().min(3).max(200).optional(),
  slug: z.string().min(3).max(200).regex(/^[a-z0-9-]+$/).optional(),
  type: z.enum(['hotel', 'apartment', 'resort', 'villa', 'hostel', 'guesthouse']).optional(),
  description: z.string().min(50).max(5000).optional(),
  images: z.array(z.object({
    url: z.string().url(),
    caption: z.string().optional(),
    order: z.number().int().min(0),
  })).optional(),
  location: z.object({
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    country: z.string().min(1),
    postalCode: z.string().optional(),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
  }).optional(),
  amenities: z.array(z.string()).optional(),
  starRating: z.number().int().min(1).max(5).optional(),
  policies: z.object({
    checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    cancellationPolicy: z.enum(['flexible', 'moderate', 'strict', 'non_refundable']),
    childrenAllowed: z.boolean(),
    petsAllowed: z.boolean(),
    smokingAllowed: z.boolean(),
    partiesAllowed: z.boolean(),
  }).optional(),
  contactInfo: z.object({
    phone: z.string().min(5),
    email: z.string().email(),
    website: z.string().url().optional(),
  }).optional(),
  totalRooms: z.number().int().min(1).optional(),
  status: z.enum(['active', 'inactive', 'pending_approval']).optional(),
});

// GET /api/hotels/properties/[id] - Get property by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await getPropertyById(params.id);

    if (!property) {
      return NextResponse.json({
        success: false,
        message: 'Property not found',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      property,
    });

  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch property',
    }, { status: 500 });
  }
}

// PATCH /api/hotels/properties/[id] - Update property
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

    // Get the property to check ownership
    const property = await getPropertyById(params.id);
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
        message: 'You do not have permission to update this property',
      }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = updatePropertySchema.parse(body);

    // Update property
    const updatedProperty = await updateProperty(params.id, validatedData);

    if (!updatedProperty) {
      return NextResponse.json({
        success: false,
        message: 'Failed to update property',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      property: updatedProperty,
      message: 'Property updated successfully',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Error updating property:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to update property',
    }, { status: 500 });
  }
}

// DELETE /api/hotels/properties/[id] - Delete property
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

    // Get the property to check ownership
    const property = await getPropertyById(params.id);
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
        message: 'You do not have permission to delete this property',
      }, { status: 403 });
    }

    // Delete property
    const deleted = await deleteProperty(params.id);

    if (!deleted) {
      return NextResponse.json({
        success: false,
        message: 'Failed to delete property',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to delete property',
    }, { status: 500 });
  }
}

