/**
 * Amadeus Flight API Client
 * 
 * This module provides integration with the Amadeus Flight API for real-time flight search.
 * 
 * Setup:
 * 1. Sign up at https://developers.amadeus.com/
 * 2. Create an app to get API Key and API Secret
 * 3. Add to .env.local:
 *    AMADEUS_API_KEY=your_api_key
 *    AMADEUS_API_SECRET=your_api_secret
 *    AMADEUS_ENVIRONMENT=test (or 'production')
 */

import type { FlightResult } from './flights-data';

interface AmadeusConfig {
  apiKey: string;
  apiSecret: string;
  environment: 'test' | 'production';
}

interface AmadeusToken {
  access_token: string;
  expires_in: number;
  token_type: string;
  expires_at: number;
}

interface AmadeusFlightOffer {
  id: string;
  source: string;
  instantTicketingRequired: boolean;
  nonHomogeneous: boolean;
  oneWay: boolean;
  lastTicketingDate: string;
  numberOfBookableSeats: number;
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        terminal?: string;
        at: string;
      };
      carrierCode: string;
      number: string;
      aircraft: {
        code: string;
      };
      operating?: {
        carrierCode: string;
      };
      duration: string;
      id: string;
      numberOfStops: number;
      blacklistedInEU: boolean;
    }>;
  }>;
  price: {
    currency: string;
    total: string;
    base: string;
    fees: Array<{
      amount: string;
      type: string;
    }>;
    grandTotal: string;
  };
  pricingOptions: {
    fareType: string[];
    includedCheckedBagsOnly: boolean;
  };
  validatingAirlineCodes: string[];
  travelerPricings: Array<{
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: {
      currency: string;
      total: string;
      base: string;
    };
    fareDetailsBySegment: Array<{
      segmentId: string;
      cabin: string;
      fareBasis: string;
      class: string;
      includedCheckedBags: {
        quantity: number;
      };
    }>;
  }>;
}

class AmadeusClient {
  private config: AmadeusConfig;
  private token: AmadeusToken | null = null;
  private baseUrl: string;

  constructor() {
    this.config = {
      apiKey: process.env.AMADEUS_API_KEY || '',
      apiSecret: process.env.AMADEUS_API_SECRET || '',
      environment: (process.env.AMADEUS_ENVIRONMENT as 'test' | 'production') || 'test',
    };

    this.baseUrl = this.config.environment === 'production'
      ? 'https://api.amadeus.com'
      : 'https://test.api.amadeus.com';

    if (!this.config.apiKey || !this.config.apiSecret) {
      console.warn('Amadeus API credentials not configured. Using mock data.');
    }
  }

  /**
   * Get access token from Amadeus API
   */
  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.token && this.token.expires_at > Date.now()) {
      return this.token.access_token;
    }

    // Request new token
    const response = await fetch(`${this.baseUrl}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.apiKey,
        client_secret: this.config.apiSecret,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get Amadeus access token');
    }

    const data = await response.json();
    this.token = {
      ...data,
      expires_at: Date.now() + (data.expires_in * 1000) - 60000, // Subtract 1 minute for safety
    };

    return this.token.access_token;
  }

  /**
   * Search for flights using Amadeus Flight Offers Search API
   */
  async searchFlights(params: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    children?: number;
    infants?: number;
    travelClass?: string;
    nonStop?: boolean;
    maxResults?: number;
  }): Promise<FlightResult[]> {
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('Amadeus API credentials not configured');
    }

    const token = await this.getAccessToken();

    // Build query parameters
    const queryParams = new URLSearchParams({
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departureDate,
      adults: params.adults.toString(),
      max: (params.maxResults || 50).toString(),
    });

    if (params.returnDate) {
      queryParams.append('returnDate', params.returnDate);
    }

    if (params.children && params.children > 0) {
      queryParams.append('children', params.children.toString());
    }

    if (params.infants && params.infants > 0) {
      queryParams.append('infants', params.infants.toString());
    }

    if (params.travelClass) {
      queryParams.append('travelClass', params.travelClass.toUpperCase());
    }

    if (params.nonStop) {
      queryParams.append('nonStop', 'true');
    }

    // Make API request
    const response = await fetch(
      `${this.baseUrl}/v2/shopping/flight-offers?${queryParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.errors?.[0]?.detail || 'Failed to search flights');
    }

    const data = await response.json();

    // Transform Amadeus response to our FlightResult format
    return this.transformFlightOffers(data.data || []);
  }

  /**
   * Transform Amadeus flight offers to our FlightResult format
   */
  private transformFlightOffers(offers: AmadeusFlightOffer[]): FlightResult[] {
    return offers.map((offer) => {
      const outbound = offer.itineraries[0];
      const firstSegment = outbound.segments[0];
      const lastSegment = outbound.segments[outbound.segments.length - 1];

      // Calculate total duration in minutes
      const durationMatch = outbound.duration.match(/PT(\d+H)?(\d+M)?/);
      const hours = durationMatch?.[1] ? parseInt(durationMatch[1]) : 0;
      const minutes = durationMatch?.[2] ? parseInt(durationMatch[2]) : 0;
      const totalMinutes = hours * 60 + minutes;

      return {
        flightId: offer.id,
        airline: firstSegment.carrierCode,
        airlineCode: firstSegment.carrierCode,
        flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`,
        departureAirport: firstSegment.departure.iataCode,
        arrivalAirport: lastSegment.arrival.iataCode,
        departureTime: firstSegment.departure.at,
        arrivalTime: lastSegment.arrival.at,
        duration: totalMinutes,
        stops: outbound.segments.length - 1,
        price: parseFloat(offer.price.grandTotal),
        currency: offer.price.currency,
        cabinClass: offer.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || 'ECONOMY',
        availableSeats: offer.numberOfBookableSeats,
        segments: outbound.segments.map((segment) => ({
          departureAirport: segment.departure.iataCode,
          arrivalAirport: segment.arrival.iataCode,
          departureTime: segment.departure.at,
          arrivalTime: segment.arrival.at,
          airline: segment.carrierCode,
          flightNumber: `${segment.carrierCode}${segment.number}`,
          duration: this.parseDuration(segment.duration),
          aircraft: segment.aircraft.code,
        })),
      };
    });
  }

  /**
   * Parse ISO 8601 duration to minutes
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    const hours = match?.[1] ? parseInt(match[1]) : 0;
    const minutes = match?.[2] ? parseInt(match[2]) : 0;
    return hours * 60 + minutes;
  }

  /**
   * Search airports by keyword
   */
  async searchAirports(keyword: string): Promise<Array<{
    iataCode: string;
    name: string;
    city: string;
    country: string;
  }>> {
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('Amadeus API credentials not configured');
    }

    const token = await this.getAccessToken();

    const response = await fetch(
      `${this.baseUrl}/v1/reference-data/locations?subType=AIRPORT&keyword=${encodeURIComponent(keyword)}&page[limit]=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search airports');
    }

    const data = await response.json();

    return (data.data || []).map((location: any) => ({
      iataCode: location.iataCode,
      name: location.name,
      city: location.address?.cityName || '',
      country: location.address?.countryName || '',
    }));
  }
}

// Export singleton instance
export const amadeusClient = new AmadeusClient();

