import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/rbac';
import {
  getUserComparisons,
  addItemToComparison,
} from '@/lib/comparisons-data';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const addItemSchema = z.object({
  comparisonType: z.enum(['property', 'vehicle', 'tour', 'transfer']),
  itemId: z.string().min(1),
});

// ============================================================================
// GET /api/comparisons - Get user's comparisons
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Get user's comparisons
    const comparisons = await getUserComparisons(user.id);

    return NextResponse.json({
      success: true,
      comparisons,
    });
  } catch (error: any) {
    console.error('Get comparisons error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to get comparisons' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/comparisons - Add item to comparison
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = addItemSchema.parse(body);

    // Add item to comparison
    const comparison = await addItemToComparison(
      user.id,
      validatedData.comparisonType,
      validatedData.itemId
    );

    if (!comparison) {
      return NextResponse.json(
        { success: false, error: 'Failed to add item to comparison' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      comparison,
      message: 'Item added to comparison',
    });
  } catch (error: any) {
    console.error('Add to comparison error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error.message === 'Comparison is full. Maximum 3 items allowed.') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add item to comparison' },
      { status: 500 }
    );
  }
}

