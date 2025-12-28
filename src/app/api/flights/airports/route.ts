// src/app/api/flights/airports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { searchAirports, getAllAirports, createAirport } from '@/lib/flights-data';
import { z } from 'zod';
import { requireRoles } from '@/lib/rbac';
import { amadeusClient } from '@/lib/amadeus-client';

// GET /api/flights/airports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '10');
    const useAmadeus = searchParams.get('useAmadeus') === 'true';

    if (search) {
      // Search airports
      let airports;

      if (useAmadeus) {
        try {
          // Use Amadeus API for real-time airport search
          airports = await amadeusClient.searchAirports(search);
        } catch (error: any) {
          console.error('Amadeus airport search error, falling back to database:', error.message);
          // Fall back to database search
          airports = await searchAirports(search, limit);
        }
      } else {
        // Use database search
        airports = await searchAirports(search, limit);
      }

      return NextResponse.json({
        success: true,
        airports,
      });
    } else {
      // Get all airports
      const airports = await getAllAirports({ isActive: true });
      return NextResponse.json({
        success: true,
        airports,
      });
    }
  } catch (error: any) {
    console.error('Get airports error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to get airports',
      },
      { status: 500 }
    );
  }
}

// POST /api/flights/airports - Create airport (admin only)
const createAirportSchema = z.object({
  name: z.string().min(3),
  iataCode: z.string().length(3),
  icaoCode: z.string().length(4),
  city: z.string().min(2),
  country: z.string().min(2),
  timezone: z.string().min(3),
  coordinates: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  isActive: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    // Require admin role
    const authResult = await requireRoles(['admin']);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const validation = createAirportSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid airport data',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const airport = await createAirport(validation.data);

    return NextResponse.json(
      {
        success: true,
        airport,
        message: 'Airport created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create airport error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to create airport',
      },
      { status: 500 }
    );
  }
}

