import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/rbac';
import {
  getWishlistById,
  updateWishlist,
  deleteWishlist,
} from '@/lib/wishlists-data';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateWishlistSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

// ============================================================================
// GET /api/wishlists/[id] - Get wishlist details
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Get wishlist
    const wishlist = await getWishlistById(params.id, user.id);

    if (!wishlist) {
      return NextResponse.json(
        { success: false, error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      wishlist,
    });
  } catch (error: any) {
    console.error('Get wishlist error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to get wishlist' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/wishlists/[id] - Update wishlist
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateWishlistSchema.parse(body);

    // Update wishlist
    const wishlist = await updateWishlist(params.id, user.id, validatedData);

    if (!wishlist) {
      return NextResponse.json(
        { success: false, error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      wishlist,
    });
  } catch (error: any) {
    console.error('Update wishlist error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update wishlist' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/wishlists/[id] - Delete wishlist
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Delete wishlist
    const deleted = await deleteWishlist(params.id, user.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Wishlist deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete wishlist error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete wishlist' },
      { status: 500 }
    );
  }
}

