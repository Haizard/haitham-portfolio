// src/app/api/flights/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  cacheFlightSearch,
  getCachedFlightSearch,
  type FlightResult,
  type FlightSearch,
} from '@/lib/flights-data';
import { amadeusClient } from '@/lib/amadeus-client';

// Validation schema for search params
const searchParamsSchema = z.object({
  origin: z.string().length(3, 'Origin must be a 3-letter IATA code'),
  destination: z.string().length(3, 'Destination must be a 3-letter IATA code'),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)'),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)').optional(),
  adults: z.coerce.number().int().min(1).max(9).default(1),
  children: z.coerce.number().int().min(0).max(9).default(0),
  infants: z.coerce.number().int().min(0).max(9).default(0),
  class: z.enum(['economy', 'premium_economy', 'business', 'first']).default('economy'),
  nonStop: z.coerce.boolean().optional(),
  useAmadeus: z.coerce.boolean().default(false), // Toggle between Amadeus and mock data
});

/**
 * Mock flight search function
 * In production, this would call Amadeus API or similar
 */
async function searchFlightsFromAPI(
  searchParams: FlightSearch['searchParams']
): Promise<FlightResult[]> {
  // Mock data for development
  // TODO: Replace with actual API call to Amadeus/Skyscanner
  
  const airlines = [
    { code: 'AA', name: 'American Airlines' },
    { code: 'UA', name: 'United Airlines' },
    { code: 'DL', name: 'Delta Air Lines' },
    { code: 'BA', name: 'British Airways' },
    { code: 'EK', name: 'Emirates' },
  ];

  const mockFlights: FlightResult[] = [];

  // Generate 5-10 mock flights
  const numFlights = Math.floor(Math.random() * 6) + 5;

  for (let i = 0; i < numFlights; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const stops = Math.floor(Math.random() * 3); // 0-2 stops
    const basePrice = 200 + Math.random() * 800;
    const duration = 120 + Math.random() * 600; // 2-12 hours

    // Parse departure date
    const depDate = new Date(searchParams.departureDate);
    const depHour = 6 + Math.floor(Math.random() * 16); // 6am - 10pm
    depDate.setHours(depHour, Math.floor(Math.random() * 60));

    const arrDate = new Date(depDate.getTime() + duration * 60 * 1000);

    mockFlights.push({
      flightId: `${airline.code}${Math.floor(Math.random() * 9000) + 1000}`,
      airline: airline.name,
      airlineCode: airline.code,
      price: Math.round(basePrice * (1 + stops * 0.2)),
      currency: 'USD',
      duration: Math.round(duration),
      stops,
      departureTime: depDate.toISOString(),
      arrivalTime: arrDate.toISOString(),
      departureAirport: searchParams.origin,
      arrivalAirport: searchParams.destination,
      bookingUrl: `https://www.trip.com/flights?origin=${searchParams.origin}&destination=${searchParams.destination}&date=${searchParams.departureDate}`,
    });
  }

  // Sort by price
  mockFlights.sort((a, b) => a.price - b.price);

  return mockFlights;
}

// GET /api/flights/search
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract and validate search parameters
    const params = {
      origin: searchParams.get('origin'),
      destination: searchParams.get('destination'),
      departureDate: searchParams.get('departureDate'),
      returnDate: searchParams.get('returnDate') || undefined,
      adults: searchParams.get('adults') || '1',
      children: searchParams.get('children') || '0',
      infants: searchParams.get('infants') || '0',
      class: searchParams.get('class') || 'economy',
    };

    const validation = searchParamsSchema.safeParse(params);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid search parameters',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const validatedParams = validation.data;

    // Validate dates
    const depDate = new Date(validatedParams.departureDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (depDate < today) {
      return NextResponse.json(
        {
          success: false,
          message: 'Departure date must be in the future',
        },
        { status: 400 }
      );
    }

    if (validatedParams.returnDate) {
      const retDate = new Date(validatedParams.returnDate);
      if (retDate < depDate) {
        return NextResponse.json(
          {
            success: false,
            message: 'Return date must be after departure date',
          },
          { status: 400 }
        );
      }
    }

    // Validate passenger count
    const totalPassengers = validatedParams.adults + validatedParams.children + validatedParams.infants;
    if (totalPassengers > 9) {
      return NextResponse.json(
        {
          success: false,
          message: 'Maximum 9 passengers allowed',
        },
        { status: 400 }
      );
    }

    if (validatedParams.infants > validatedParams.adults) {
      return NextResponse.json(
        {
          success: false,
          message: 'Number of infants cannot exceed number of adults',
        },
        { status: 400 }
      );
    }

    // Build search params object
    const flightSearchParams: FlightSearch['searchParams'] = {
      origin: validatedParams.origin.toUpperCase(),
      destination: validatedParams.destination.toUpperCase(),
      departureDate: validatedParams.departureDate,
      returnDate: validatedParams.returnDate,
      passengers: {
        adults: validatedParams.adults,
        children: validatedParams.children,
        infants: validatedParams.infants,
      },
      class: validatedParams.class as any,
    };

    // Check cache first
    const cachedSearch = await getCachedFlightSearch(flightSearchParams);

    if (cachedSearch) {
      return NextResponse.json({
        success: true,
        searchId: cachedSearch.id,
        results: cachedSearch.results,
        expiresAt: cachedSearch.expiresAt,
        cached: true,
      });
    }

    // Search flights from API (Amadeus or mock)
    let results: FlightResult[];

    if (validatedParams.useAmadeus) {
      try {
        // Use Amadeus API
        results = await amadeusClient.searchFlights({
          origin: flightSearchParams.origin,
          destination: flightSearchParams.destination,
          departureDate: flightSearchParams.departureDate,
          returnDate: flightSearchParams.returnDate,
          adults: flightSearchParams.passengers.adults,
          children: flightSearchParams.passengers.children,
          infants: flightSearchParams.passengers.infants,
          travelClass: flightSearchParams.class,
          nonStop: validatedParams.nonStop,
        });
      } catch (error: any) {
        console.error('Amadeus API error, falling back to mock data:', error.message);
        // Fall back to mock data if Amadeus fails
        results = await searchFlightsFromAPI(flightSearchParams);
      }
    } else {
      // Use mock data
      results = await searchFlightsFromAPI(flightSearchParams);
    }

    // Cache the results
    const search = await cacheFlightSearch(flightSearchParams, results, 30);

    return NextResponse.json({
      success: true,
      searchId: search.id,
      results: search.results,
      expiresAt: search.expiresAt,
      cached: false,
    });
  } catch (error: any) {
    console.error('Flight search error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to search flights',
      },
      { status: 500 }
    );
  }
}

