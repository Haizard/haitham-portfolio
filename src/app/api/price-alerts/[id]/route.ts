import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/rbac';
import {
  getPriceAlertById,
  updatePriceAlert,
  deletePriceAlert,
} from '@/lib/price-alerts-data';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const updateAlertSchema = z.object({
  targetPrice: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// GET /api/price-alerts/[id] - Get price alert details
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Get price alert
    const alert = await getPriceAlertById(params.id, user.id);

    if (!alert) {
      return NextResponse.json(
        { success: false, error: 'Price alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      alert,
    });
  } catch (error: any) {
    console.error('Get price alert error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to get price alert' },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH /api/price-alerts/[id] - Update price alert
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
    const validatedData = updateAlertSchema.parse(body);

    // Update price alert
    const alert = await updatePriceAlert(params.id, user.id, validatedData);

    if (!alert) {
      return NextResponse.json(
        { success: false, error: 'Price alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      alert,
      message: 'Price alert updated successfully',
    });
  } catch (error: any) {
    console.error('Update price alert error:', error);

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
      { success: false, error: 'Failed to update price alert' },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE /api/price-alerts/[id] - Delete price alert
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Delete price alert
    const deleted = await deletePriceAlert(params.id, user.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Price alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Price alert deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete price alert error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete price alert' },
      { status: 500 }
    );
  }
}

