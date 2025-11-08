import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/rbac';
import {
  createPriceAlert,
  getUserPriceAlerts,
} from '@/lib/price-alerts-data';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createAlertSchema = z.object({
  alertType: z.enum(['property', 'vehicle', 'tour', 'transfer', 'flight']),
  targetId: z.string().min(1),
  targetName: z.string().optional(),
  targetPrice: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  searchCriteria: z.object({
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    guests: z.number().optional(),
    pickupDate: z.string().optional(),
    returnDate: z.string().optional(),
    tourDate: z.string().optional(),
    participants: z.number().optional(),
    origin: z.string().optional(),
    destination: z.string().optional(),
    departureDate: z.string().optional(),
  }),
  currentPrice: z.number().optional(),
});

// ============================================================================
// GET /api/price-alerts - Get user's price alerts
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const alertType = searchParams.get('alertType') as any;
    const isActive = searchParams.get('isActive');

    // Get user's price alerts
    const alerts = await getUserPriceAlerts(user.id, {
      alertType,
      isActive: isActive ? isActive === 'true' : undefined,
    });

    return NextResponse.json({
      success: true,
      alerts,
    });
  } catch (error: any) {
    console.error('Get price alerts error:', error);

    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to get price alerts' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST /api/price-alerts - Create price alert
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createAlertSchema.parse(body);

    // Create price alert
    const alert = await createPriceAlert(user.id, validatedData);

    return NextResponse.json(
      {
        success: true,
        alert,
        message: 'Price alert created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create price alert error:', error);

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
      { success: false, error: 'Failed to create price alert' },
      { status: 500 }
    );
  }
}

