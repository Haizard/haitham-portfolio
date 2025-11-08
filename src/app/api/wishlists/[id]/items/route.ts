import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/rbac';
import { addItemToWishlist } from '@/lib/wishlists-data';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const addItemSchema = z.object({
  itemType: z.enum(['property', 'vehicle', 'tour', 'transfer']),
  itemId: z.string().min(1),
  notes: z.string().max(500).optional(),
});

// ============================================================================
// POST /api/wishlists/[id]/items - Add item to wishlist
// ============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = addItemSchema.parse(body);

    // Add item to wishlist
    const wishlist = await addItemToWishlist(params.id, user.id, validatedData);

    if (!wishlist) {
      return NextResponse.json(
        { success: false, error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      wishlist,
      message: 'Item added to wishlist',
    });
  } catch (error: any) {
    console.error('Add item to wishlist error:', error);

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
      { success: false, error: 'Failed to add item to wishlist' },
      { status: 500 }
    );
  }
}

