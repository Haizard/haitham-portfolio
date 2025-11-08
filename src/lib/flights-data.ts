// src/lib/flights-data.ts
// Flight booking system - Referral-based model with third-party API integration

import { ObjectId } from 'mongodb';
import clientPromise from './mongodb';

// ============================================================================
// INTERFACES
// ============================================================================

export interface FlightSegment {
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  flightNumber: string;
  duration: number; // minutes
  aircraft?: string;
}

export interface FlightResult {
  flightId: string;
  airline: string;
  airlineCode: string;
  flightNumber?: string;
  price: number;
  currency: string;
  duration: number; // minutes
  stops: number;
  departureTime: string;
  arrivalTime: string;
  departureAirport: string;
  arrivalAirport: string;
  cabinClass?: string;
  availableSeats?: number;
  bookingUrl?: string;
  segments?: FlightSegment[];
}

export interface FlightSearch {
  _id?: ObjectId;
  id?: string;
  searchParams: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    passengers: {
      adults: number;
      children: number;
      infants: number;
    };
    class: 'economy' | 'premium_economy' | 'business' | 'first';
  };
  results: FlightResult[];
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlightReferral {
  _id?: ObjectId;
  id?: string;
  userId: string;
  searchId: string;
  flightDetails: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    airline: string;
    price: number;
    currency: string;
  };
  referralUrl: string;
  clickedAt: string;
  bookingConfirmed: boolean;
  confirmedAt?: string;
  bookingReference?: string;
  bookingStatus?: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  commissionAmount?: number;
  commissionRate?: number;
  commissionPaid: boolean;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Airline {
  _id?: ObjectId;
  id?: string;
  name: string;
  iataCode: string;
  icaoCode: string;
  logo?: string;
  country: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Airport {
  _id?: ObjectId;
  id?: string;
  name: string;
  iataCode: string;
  icaoCode: string;
  city: string;
  country: string;
  timezone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceAlert {
  _id?: ObjectId;
  id?: string;
  userId: string;
  route: {
    origin: string;
    destination: string;
    departureDate?: string; // Optional for flexible dates
    returnDate?: string;
  };
  targetPrice: number;
  currency: string;
  currentPrice?: number;
  lowestPrice?: number;
  highestPrice?: number;
  priceHistory: Array<{
    price: number;
    timestamp: string;
  }>;
  alertTriggered: boolean;
  triggeredAt?: string;
  isActive: boolean;
  notificationPreferences: {
    email: boolean;
    push: boolean;
  };
  createdAt: string;
  updatedAt: string;
  expiresAt: string; // Auto-delete after expiration
}

// ============================================================================
// FLIGHT SEARCH OPERATIONS
// ============================================================================

/**
 * Create or update a flight search cache
 */
export async function cacheFlightSearch(
  searchParams: FlightSearch['searchParams'],
  results: FlightResult[],
  cacheMinutes: number = 30
): Promise<FlightSearch> {
  const client = await clientPromise;
  const db = client.db();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + cacheMinutes * 60 * 1000);

  // Create search hash for cache key
  const searchHash = JSON.stringify(searchParams);

  // Check if search already exists and is not expired
  const existing = await db.collection<FlightSearch>('flightSearches').findOne({
    'searchParams': searchParams,
    expiresAt: { $gt: now.toISOString() },
  });

  if (existing) {
    // Update existing cache
    const updated = await db.collection<FlightSearch>('flightSearches').findOneAndUpdate(
      { _id: existing._id },
      {
        $set: {
          results,
          expiresAt: expiresAt.toISOString(),
          updatedAt: now.toISOString(),
        },
      },
      { returnDocument: 'after' }
    );

    const doc = updated!;
    return {
      ...doc,
      id: doc._id!.toString(),
    };
  }

  // Create new cache entry
  const search: Omit<FlightSearch, 'id'> = {
    searchParams,
    results,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const result = await db.collection<FlightSearch>('flightSearches').insertOne(search as any);
  return {
    ...search,
    _id: result.insertedId,
    id: result.insertedId.toString(),
  };
}

/**
 * Get cached flight search
 */
export async function getCachedFlightSearch(
  searchParams: FlightSearch['searchParams']
): Promise<FlightSearch | null> {
  const client = await clientPromise;
  const db = client.db();

  const now = new Date();

  const search = await db.collection<FlightSearch>('flightSearches').findOne({
    'searchParams.origin': searchParams.origin,
    'searchParams.destination': searchParams.destination,
    'searchParams.departureDate': searchParams.departureDate,
    'searchParams.returnDate': searchParams.returnDate || null,
    'searchParams.passengers.adults': searchParams.passengers.adults,
    'searchParams.passengers.children': searchParams.passengers.children,
    'searchParams.passengers.infants': searchParams.passengers.infants,
    'searchParams.class': searchParams.class,
    expiresAt: { $gt: now.toISOString() },
  });

  if (!search) return null;

  return {
    ...search,
    id: search._id!.toString(),
  };
}

/**
 * Clean up expired flight searches
 */
export async function cleanupExpiredSearches(): Promise<number> {
  const client = await clientPromise;
  const db = client.db();

  const now = new Date();

  const result = await db.collection<FlightSearch>('flightSearches').deleteMany({
    expiresAt: { $lt: now.toISOString() },
  });

  return result.deletedCount;
}

// ============================================================================
// FLIGHT REFERRAL OPERATIONS
// ============================================================================

/**
 * Create a flight referral
 */
export async function createFlightReferral(
  data: Omit<FlightReferral, 'id' | '_id' | 'createdAt' | 'updatedAt' | 'bookingConfirmed' | 'commissionPaid'>
): Promise<FlightReferral> {
  const client = await clientPromise;
  const db = client.db();

  const now = new Date().toISOString();

  const referral: Omit<FlightReferral, 'id'> = {
    ...data,
    bookingConfirmed: false,
    commissionPaid: false,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection<FlightReferral>('flightReferrals').insertOne(referral as any);

  return {
    ...referral,
    _id: result.insertedId,
    id: result.insertedId.toString(),
  };
}

/**
 * Get flight referral by ID
 */
export async function getFlightReferralById(
  referralId: string
): Promise<FlightReferral | null> {
  const client = await clientPromise;
  const db = client.db();

  const referral = await db
    .collection<FlightReferral>('flightReferrals')
    .findOne({ _id: new ObjectId(referralId) });

  if (!referral) return null;

  return {
    ...referral,
    id: referral._id!.toString(),
  };
}

/**
 * Get flight referrals by user ID
 */
export async function getFlightReferralsByUserId(
  userId: string,
  filters?: {
    status?: 'all' | 'pending' | 'confirmed' | 'paid';
    limit?: number;
  }
): Promise<FlightReferral[]> {
  const client = await clientPromise;
  const db = client.db();

  const query: any = { userId };

  if (filters?.status === 'pending') {
    query.bookingConfirmed = false;
  } else if (filters?.status === 'confirmed') {
    query.bookingConfirmed = true;
    query.commissionPaid = false;
  } else if (filters?.status === 'paid') {
    query.commissionPaid = true;
  }

  const referrals = await db
    .collection<FlightReferral>('flightReferrals')
    .find(query)
    .sort({ createdAt: -1 })
    .limit(filters?.limit || 100)
    .toArray();

  return referrals.map((ref) => ({
    ...ref,
    id: ref._id!.toString(),
  }));
}

/**
 * Update flight referral (confirm booking, mark as paid)
 */
export async function updateFlightReferral(
  referralId: string,
  updates: Partial<Pick<FlightReferral, 'bookingConfirmed' | 'confirmedAt' | 'bookingReference' | 'bookingStatus' | 'commissionAmount' | 'commissionRate' | 'commissionPaid' | 'paidAt'>>
): Promise<FlightReferral | null> {
  const client = await clientPromise;
  const db = client.db();

  const result = await db.collection<FlightReferral>('flightReferrals').findOneAndUpdate(
    { _id: new ObjectId(referralId) },
    {
      $set: {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    },
    { returnDocument: 'after' }
  );

  if (!result) return null;

  return {
    ...result,
    id: result._id!.toString(),
  };
}

/**
 * Get referral statistics for a user
 */
export async function getFlightReferralStats(userId: string): Promise<{
  totalClicks: number;
  confirmedBookings: number;
  totalCommission: number;
  paidCommission: number;
}> {
  const client = await clientPromise;
  const db = client.db();

  const referrals = await db
    .collection<FlightReferral>('flightReferrals')
    .find({ userId })
    .toArray();

  const stats = {
    totalClicks: referrals.length,
    confirmedBookings: referrals.filter((r) => r.bookingConfirmed).length,
    totalCommission: referrals
      .filter((r) => r.bookingConfirmed && r.commissionAmount)
      .reduce((sum, r) => sum + (r.commissionAmount || 0), 0),
    paidCommission: referrals
      .filter((r) => r.commissionPaid && r.commissionAmount)
      .reduce((sum, r) => sum + (r.commissionAmount || 0), 0),
  };

  return stats;
}

// ============================================================================
// AIRLINE OPERATIONS
// ============================================================================

/**
 * Create an airline
 */
export async function createAirline(
  data: Omit<Airline, 'id' | '_id' | 'createdAt' | 'updatedAt'>
): Promise<Airline> {
  const client = await clientPromise;
  const db = client.db();

  const now = new Date().toISOString();

  const airline: Omit<Airline, 'id'> = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection<Airline>('airlines').insertOne(airline as any);

  return {
    ...airline,
    _id: result.insertedId,
    id: result.insertedId.toString(),
  };
}

/**
 * Get all airlines
 */
export async function getAllAirlines(filters?: { isActive?: boolean }): Promise<Airline[]> {
  const client = await clientPromise;
  const db = client.db();

  const query: any = {};
  if (filters?.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  const airlines = await db
    .collection<Airline>('airlines')
    .find(query)
    .sort({ name: 1 })
    .toArray();

  return airlines.map((airline) => ({
    ...airline,
    id: airline._id!.toString(),
  }));
}

/**
 * Get airline by IATA code
 */
export async function getAirlineByCode(iataCode: string): Promise<Airline | null> {
  const client = await clientPromise;
  const db = client.db();

  const airline = await db.collection<Airline>('airlines').findOne({ iataCode });

  if (!airline) return null;

  return {
    ...airline,
    id: airline._id!.toString(),
  };
}

// ============================================================================
// AIRPORT OPERATIONS
// ============================================================================

/**
 * Create an airport
 */
export async function createAirport(
  data: Omit<Airport, 'id' | '_id' | 'createdAt' | 'updatedAt'>
): Promise<Airport> {
  const client = await clientPromise;
  const db = client.db();

  const now = new Date().toISOString();

  const airport: Omit<Airport, 'id'> = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection<Airport>('airports').insertOne(airport as any);

  return {
    ...airport,
    _id: result.insertedId,
    id: result.insertedId.toString(),
  };
}

/**
 * Search airports by name, city, or IATA code
 */
export async function searchAirports(
  searchTerm: string,
  limit: number = 10
): Promise<Airport[]> {
  const client = await clientPromise;
  const db = client.db();

  const searchRegex = new RegExp(searchTerm, 'i');

  const airports = await db
    .collection<Airport>('airports')
    .find({
      isActive: true,
      $or: [
        { name: searchRegex },
        { city: searchRegex },
        { iataCode: searchRegex },
        { country: searchRegex },
      ],
    })
    .limit(limit)
    .toArray();

  return airports.map((airport) => ({
    ...airport,
    id: airport._id!.toString(),
  }));
}

/**
 * Get airport by IATA code
 */
export async function getAirportByCode(iataCode: string): Promise<Airport | null> {
  const client = await clientPromise;
  const db = client.db();

  const airport = await db.collection<Airport>('airports').findOne({ iataCode });

  if (!airport) return null;

  return {
    ...airport,
    id: airport._id!.toString(),
  };
}

/**
 * Get all airports
 */
export async function getAllAirports(filters?: { isActive?: boolean }): Promise<Airport[]> {
  const client = await clientPromise;
  const db = client.db();

  const query: any = {};
  if (filters?.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  const airports = await db
    .collection<Airport>('airports')
    .find(query)
    .sort({ name: 1 })
    .toArray();

  return airports.map((airport) => ({
    ...airport,
    id: airport._id!.toString(),
  }));
}

// ============================================================================
// PRICE ALERTS OPERATIONS
// ============================================================================

/**
 * Create a price alert
 */
export async function createPriceAlert(
  userId: string,
  route: PriceAlert['route'],
  targetPrice: number,
  currency: string,
  notificationPreferences: PriceAlert['notificationPreferences'] = { email: true, push: false }
): Promise<PriceAlert> {
  const client = await clientPromise;
  const db = client.db();

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days

  const alert: Omit<PriceAlert, '_id' | 'id'> = {
    userId,
    route,
    targetPrice,
    currency,
    priceHistory: [],
    alertTriggered: false,
    isActive: true,
    notificationPreferences,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const result = await db.collection<PriceAlert>('priceAlerts').insertOne(alert as any);

  return {
    ...alert,
    _id: result.insertedId,
    id: result.insertedId.toString(),
  };
}

/**
 * Get price alerts by user ID
 */
export async function getPriceAlertsByUserId(
  userId: string,
  filters?: {
    isActive?: boolean;
    limit?: number;
  }
): Promise<PriceAlert[]> {
  const client = await clientPromise;
  const db = client.db();

  const query: any = { userId };

  if (filters?.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  const alerts = await db
    .collection<PriceAlert>('priceAlerts')
    .find(query)
    .sort({ createdAt: -1 })
    .limit(filters?.limit || 100)
    .toArray();

  return alerts.map((alert) => ({
    ...alert,
    id: alert._id!.toString(),
  }));
}

/**
 * Update price alert with new price data
 */
export async function updatePriceAlert(
  alertId: string,
  currentPrice: number
): Promise<PriceAlert | null> {
  const client = await clientPromise;
  const db = client.db();

  const alert = await db.collection<PriceAlert>('priceAlerts').findOne({ _id: new ObjectId(alertId) });

  if (!alert) return null;

  const now = new Date().toISOString();
  const priceHistory = [
    ...alert.priceHistory,
    { price: currentPrice, timestamp: now },
  ];

  // Keep only last 30 price points
  if (priceHistory.length > 30) {
    priceHistory.shift();
  }

  const lowestPrice = Math.min(
    alert.lowestPrice || currentPrice,
    currentPrice,
    ...priceHistory.map((p) => p.price)
  );

  const highestPrice = Math.max(
    alert.highestPrice || currentPrice,
    currentPrice,
    ...priceHistory.map((p) => p.price)
  );

  const alertTriggered = currentPrice <= alert.targetPrice;

  const result = await db.collection<PriceAlert>('priceAlerts').findOneAndUpdate(
    { _id: new ObjectId(alertId) },
    {
      $set: {
        currentPrice,
        lowestPrice,
        highestPrice,
        priceHistory,
        alertTriggered,
        triggeredAt: alertTriggered && !alert.alertTriggered ? now : alert.triggeredAt,
        updatedAt: now,
      },
    },
    { returnDocument: 'after' }
  );

  if (!result) return null;

  return {
    ...result,
    id: result._id!.toString(),
  };
}

/**
 * Delete price alert
 */
export async function deletePriceAlert(alertId: string): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db();

  const result = await db.collection<PriceAlert>('priceAlerts').deleteOne({
    _id: new ObjectId(alertId),
  });

  return result.deletedCount > 0;
}

/**
 * Deactivate price alert
 */
export async function deactivatePriceAlert(alertId: string): Promise<PriceAlert | null> {
  const client = await clientPromise;
  const db = client.db();

  const result = await db.collection<PriceAlert>('priceAlerts').findOneAndUpdate(
    { _id: new ObjectId(alertId) },
    {
      $set: {
        isActive: false,
        updatedAt: new Date().toISOString(),
      },
    },
    { returnDocument: 'after' }
  );

  if (!result) return null;

  return {
    ...result,
    id: result._id!.toString(),
  };
}

