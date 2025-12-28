// src/app/api/flights/price-alerts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { deletePriceAlert, deactivatePriceAlert } from '@/lib/flights-data';
import { requireAuth } from '@/lib/rbac';

// DELETE /api/flights/price-alerts/[id] - Delete price alert
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

    const { id } = params;

    // Delete the alert
    const deleted = await deletePriceAlert(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Price alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Price alert deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete price alert error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to delete price alert',
      },
      { status: 500 }
    );
  }
}

// PATCH /api/flights/price-alerts/[id] - Deactivate price alert
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

    const { id } = params;

    // Deactivate the alert
    const alert = await deactivatePriceAlert(id);

    if (!alert) {
      return NextResponse.json(
        { success: false, message: 'Price alert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      alert,
      message: 'Price alert deactivated successfully',
    });
  } catch (error: any) {
    console.error('Deactivate price alert error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to deactivate price alert',
      },
      { status: 500 }
    );
  }
}

