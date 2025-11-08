import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/rbac';
import { removeItemFromComparison } from '@/lib/comparisons-data';

// ============================================================================
// DELETE /api/comparisons/[type]/items/[itemId] - Remove item from comparison
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { type: string; itemId: string } }
) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Validate type
    const validTypes = ['property', 'vehicle', 'tour', 'transfer'];
    if (!validTypes.includes(params.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid comparison type' },
        { status: 400 }
      );
    }

    // Remove item from comparison
    const comparison = await removeItemFromComparison(
      user.id,
      params.type as any,
      params.itemId
    );

    if (!comparison) {
      return NextResponse.json(
        { success: false, error: 'Comparison not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      comparison,
      message: 'Item removed from comparison',
    });
  } catch (error: any) {
    console.error('Remove from comparison error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to remove item from comparison' },
      { status: 500 }
    );
  }
}

