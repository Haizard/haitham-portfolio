// src/app/api/flights/price-alerts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createPriceAlert,
  getPriceAlertsByUserId,
} from '@/lib/flights-data';
import { requireAuth } from '@/lib/rbac';

// Validation schema for creating price alert
const createAlertSchema = z.object({
  route: z.object({
    origin: z.string().length(3),
    destination: z.string().length(3),
    departureDate: z.string().optional(),
    returnDate: z.string().optional(),
  }),
  targetPrice: z.number().positive(),
  currency: z.string().length(3).default('USD'),
  notificationPreferences: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(false),
  }).optional(),
});

// GET /api/flights/price-alerts - Get user's price alerts
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const filters: any = {};
    if (isActive !== null) {
      filters.isActive = isActive === 'true';
    }

    const alerts = await getPriceAlertsByUserId(authResult.user.id, filters);

    return NextResponse.json({
      success: true,
      alerts,
    });
  } catch (error: any) {
    console.error('Get price alerts error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to get price alerts',
      },
      { status: 500 }
    );
  }
}

// POST /api/flights/price-alerts - Create price alert
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validation = createAlertSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid alert data',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { route, targetPrice, currency, notificationPreferences } = validation.data;

    // Create price alert
    const alert = await createPriceAlert(
      authResult.user.id,
      route,
      targetPrice,
      currency,
      notificationPreferences
    );

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
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create price alert',
      },
      { status: 500 }
    );
  }
}

