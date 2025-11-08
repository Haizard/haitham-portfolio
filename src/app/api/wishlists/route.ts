import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/rbac';
import {
  createWishlist,
  getUserWishlists,
} from '@/lib/wishlists-data';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createWishlistSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

// ============================================================================
// GET /api/wishlists - Get user's wishlists
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Get user's wishlists
    const wishlists = await getUserWishlists(user.id);

    return NextResponse.json({
      success: true,
      wishlists,
    });
  } catch (error: any) {
    console.error('Get wishlists error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to get wishlists' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/wishlists - Create wishlist
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createWishlistSchema.parse(body);

    // Create wishlist
    const wishlist = await createWishlist(user.id, validatedData.name, {
      description: validatedData.description,
      isDefault: validatedData.isDefault,
      isPublic: validatedData.isPublic,
    });

    return NextResponse.json(
      {
        success: true,
        wishlist,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create wishlist error:', error);

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
      { success: false, error: 'Failed to create wishlist' },
      { status: 500 }
    );
  }
}

