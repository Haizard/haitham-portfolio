// src/app/api/flights/airlines/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAllAirlines, createAirline } from '@/lib/flights-data';
import { z } from 'zod';
import { requireRoles } from '@/lib/rbac';

// GET /api/flights/airlines
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const filters = isActive !== null ? { isActive: isActive === 'true' } : undefined;

    const airlines = await getAllAirlines(filters);

    return NextResponse.json({
      success: true,
      airlines,
    });
  } catch (error: any) {
    console.error('Get airlines error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to get airlines',
      },
      { status: 500 }
    );
  }
}

// POST /api/flights/airlines - Create airline (admin only)
const createAirlineSchema = z.object({
  name: z.string().min(2),
  iataCode: z.string().length(2),
  icaoCode: z.string().length(3),
  logo: z.string().url().optional(),
  country: z.string().min(2),
  isActive: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    // Require admin role
    const authResult = await requireRoles(['admin']);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.message },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createAirlineSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid airline data',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const airline = await createAirline(validation.data);

    return NextResponse.json(
      {
        success: true,
        airline,
        message: 'Airline created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create airline error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create airline',
      },
      { status: 500 }
    );
  }
}

