// src/app/api/flights/referral/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import {
  createFlightReferral,
  type FlightSearch,
} from '@/lib/flights-data';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

// Validation schema
const referralSchema = z.object({
  searchId: z.string().min(1, 'Search ID is required'),
  flightId: z.string().min(1, 'Flight ID is required'),
});

// POST /api/flights/referral
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = referralSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { searchId, flightId } = validation.data;

    // Get the flight search
    const client = await clientPromise;
    const db = client.db();

    const search = await db.collection<FlightSearch>('flightSearches').findOne({
      _id: new ObjectId(searchId),
    });

    if (!search) {
      return NextResponse.json(
        {
          success: false,
          message: 'Flight search not found',
        },
        { status: 404 }
      );
    }

    // Find the specific flight in the results
    const flight = search.results.find((f) => f.flightId === flightId);

    if (!flight) {
      return NextResponse.json(
        {
          success: false,
          message: 'Flight not found in search results',
        },
        { status: 404 }
      );
    }

    // Generate referral URL with tracking parameters
    const referralUrl = `${flight.bookingUrl}&ref=${session.user.id}&search=${searchId}&flight=${flightId}`;

    // Create referral record
    const referral = await createFlightReferral({
      userId: session.user.id,
      searchId,
      flightDetails: {
        origin: search.searchParams.origin,
        destination: search.searchParams.destination,
        departureDate: search.searchParams.departureDate,
        returnDate: search.searchParams.returnDate,
        airline: flight.airline,
        price: flight.price,
        currency: flight.currency,
      },
      referralUrl,
      clickedAt: new Date().toISOString(),
      commissionRate: 3, // 3% commission rate
    });

    return NextResponse.json({
      success: true,
      referralUrl,
      referralId: referral.id,
      message: 'Referral tracked successfully',
    });
  } catch (error: any) {
    console.error('Referral tracking error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to track referral',
      },
      { status: 500 }
    );
  }
}

