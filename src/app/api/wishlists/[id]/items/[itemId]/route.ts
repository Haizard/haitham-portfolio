import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/rbac';
import { removeItemFromWishlist } from '@/lib/wishlists-data';

// ============================================================================
// DELETE /api/wishlists/[id]/items/[itemId] - Remove item from wishlist
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; itemId: string } }
) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Remove item from wishlist
    const wishlist = await removeItemFromWishlist(params.id, user.id, params.itemId);

    if (!wishlist) {
      return NextResponse.json(
        { success: false, error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      wishlist,
      message: 'Item removed from wishlist',
    });
  } catch (error: any) {
    console.error('Remove item from wishlist error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to remove item from wishlist' },
      { status: 500 }
    );
  }
}

