import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/rbac';
import {
  getOrCreateComparison,
  clearComparison,
} from '@/lib/comparisons-data';

// ============================================================================
// GET /api/comparisons/[type] - Get comparison by type
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    // Require authentication
    const user = await requireAuth();

    // Validate type
    const validTypes = ['property', 'vehicle', 'tour', 'transfer'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid comparison type' },
        { status: 400 }
      );
    }

    // Get or create comparison
    const comparison = await getOrCreateComparison(
      user.id,
      type as any
    );

    return NextResponse.json({
      success: true,
      comparison,
    });
  } catch (error: any) {
    console.error('Get comparison error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to get comparison' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/comparisons/[type] - Clear comparison
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    // Require authentication
    const user = await requireAuth();

    // Validate type
    const validTypes = ['property', 'vehicle', 'tour', 'transfer'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid comparison type' },
        { status: 400 }
      );
    }

    // Clear comparison
    const cleared = await clearComparison(user.id, type as any);

    return NextResponse.json({
      success: true,
      cleared,
      message: 'Comparison cleared',
    });
  } catch (error: any) {
    console.error('Clear comparison error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to clear comparison' },
      { status: 500 }
    );
  }
}

