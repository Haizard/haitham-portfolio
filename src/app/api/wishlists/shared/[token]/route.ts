import { NextRequest, NextResponse } from 'next/server';
import { getWishlistByShareToken } from '@/lib/wishlists-data';

// ============================================================================
// GET /api/wishlists/shared/[token] - Get shared wishlist (public)
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    // Get wishlist by share token (no auth required for public wishlists)
    const wishlist = await getWishlistByShareToken(params.token);

    if (!wishlist) {
      return NextResponse.json(
        { success: false, error: 'Wishlist not found or not public' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      wishlist,
    });
  } catch (error: any) {
    console.error('Get shared wishlist error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to get shared wishlist' },
      { status: 500 }
    );
  }
}

