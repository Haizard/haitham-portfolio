# Phase 6: Flight Booking System - Implementation Plan

**Date:** 2025-11-07  
**Status:** 🚧 **IN PROGRESS** - Planning & Investigation Complete

---

## 📋 Investigation Summary

### Current State: ❌ **NOT IMPLEMENTED**

**Findings:**
- ✅ No existing flight-related code found in codebase
- ✅ Roadmap specifies **referral-based model** (not direct booking)
- ✅ Integration with third-party APIs (Amadeus/Skyscanner/Trip.com)
- ✅ Focus on search, cache, and referral tracking
- ✅ Commission-based revenue model

**Key Difference from Other Booking Types:**
Unlike hotels, cars, transfers, and tours which are **direct bookings** with payment processing, the flight system is a **referral system** that:
1. Searches flights via third-party API
2. Caches results for 15-30 minutes
3. Redirects users to booking partner (Trip.com)
4. Tracks referral clicks and commissions

---

## 🎯 Implementation Strategy

### **Approach: Referral-Based Flight Search**

**Why Referral Model?**
- ✅ No need to handle complex flight inventory
- ✅ No need for airline partnerships
- ✅ No payment processing for flights
- ✅ Lower liability and compliance requirements
- ✅ Faster time to market
- ✅ Commission-based revenue

**Third-Party API Options:**
1. **Amadeus API** - Comprehensive flight data, free tier available
2. **Skyscanner API** - Popular, good coverage
3. **Trip.com Affiliate API** - Direct integration with booking partner
4. **Kiwi.com API** - Good for budget flights

**Recommended:** Start with **Amadeus API** (free tier) for search, redirect to **Trip.com** for booking

---

## 📊 Database Schema Design

### **1. Flight Searches Collection (Cache)**

```typescript
interface FlightSearch {
  _id?: ObjectId;
  id?: string;
  searchParams: {
    origin: string;           // Airport code (e.g., "JFK")
    destination: string;      // Airport code (e.g., "LAX")
    departureDate: string;    // ISO date
    returnDate?: string;      // ISO date (optional for one-way)
    passengers: {
      adults: number;         // Min 1
      children: number;       // 0-17 years
      infants: number;        // 0-2 years
    };
    class: 'economy' | 'premium_economy' | 'business' | 'first';
  };
  results: FlightResult[];
  expiresAt: string;          // Cache for 15-30 minutes
  createdAt: string;
  updatedAt: string;
}

interface FlightResult {
  flightId: string;           // Unique ID from API
  airline: string;            // Airline name
  airlineCode: string;        // IATA code (e.g., "AA")
  price: number;
  currency: string;
  duration: number;           // Minutes
  stops: number;              // 0 = direct, 1+ = layovers
  departureTime: string;      // ISO datetime
  arrivalTime: string;        // ISO datetime
  departureAirport: string;   // Airport code
  arrivalAirport: string;     // Airport code
  bookingUrl: string;         // Redirect URL to Trip.com
  segments?: FlightSegment[]; // For multi-leg flights
}

interface FlightSegment {
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  flightNumber: string;
  duration: number;
}
```

### **2. Flight Referrals Collection**

```typescript
interface FlightReferral {
  _id?: ObjectId;
  id?: string;
  userId: string;             // User who clicked
  searchId: string;           // Reference to FlightSearch
  flightDetails: {
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string;
    airline: string;
    price: number;
    currency: string;
  };
  referralUrl: string;        // Full URL with tracking params
  clickedAt: string;
  bookingConfirmed: boolean;  // Tracked via webhook
  confirmedAt?: string;
  commissionAmount?: number;  // Calculated commission
  commissionRate?: number;    // Percentage (e.g., 3%)
  commissionPaid: boolean;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### **3. Airlines Collection (Reference Data)**

```typescript
interface Airline {
  _id?: ObjectId;
  id?: string;
  name: string;               // "American Airlines"
  iataCode: string;           // "AA"
  icaoCode: string;           // "AAL"
  logo?: string;              // Logo URL
  country: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### **4. Airports Collection (Reference Data)**

```typescript
interface Airport {
  _id?: ObjectId;
  id?: string;
  name: string;               // "John F. Kennedy International Airport"
  iataCode: string;           // "JFK"
  icaoCode: string;           // "KJFK"
  city: string;               // "New York"
  country: string;            // "United States"
  timezone: string;           // "America/New_York"
  coordinates: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔌 API Endpoints Design

### **Flight Search Endpoints**

```typescript
// GET /api/flights/search
// Search flights via third-party API
Query Params:
  - origin: string (required)
  - destination: string (required)
  - departureDate: string (required, ISO date)
  - returnDate: string (optional, ISO date)
  - adults: number (default: 1)
  - children: number (default: 0)
  - infants: number (default: 0)
  - class: string (default: 'economy')

Response:
{
  success: true,
  searchId: string,
  results: FlightResult[],
  expiresAt: string,
  cached: boolean
}
```

```typescript
// POST /api/flights/referral
// Track flight referral click
Body:
{
  searchId: string,
  flightId: string
}

Response:
{
  success: true,
  referralUrl: string,
  referralId: string
}
```

```typescript
// GET /api/flights/referrals
// Get user's flight referrals
Query Params:
  - status: 'all' | 'pending' | 'confirmed' | 'paid'
  - limit: number (default: 20)

Response:
{
  success: true,
  referrals: FlightReferral[],
  stats: {
    totalClicks: number,
    confirmedBookings: number,
    totalCommission: number,
    paidCommission: number
  }
}
```

### **Reference Data Endpoints**

```typescript
// GET /api/flights/airlines
// Get all airlines
Response: Airline[]

// GET /api/flights/airports
// Search airports
Query Params:
  - search: string (search by name, city, or code)
  - limit: number (default: 10)

Response: Airport[]
```

---

## 🎨 Frontend Components Design

### **1. Flight Search Form**

**Component:** `src/components/flights/flight-search-form.tsx`

**Features:**
- Origin/destination airport autocomplete
- Date picker (departure + optional return)
- Passenger count selector (adults, children, infants)
- Class selector (economy, premium economy, business, first)
- One-way / Round-trip toggle
- Form validation with Zod

### **2. Flight Search Results**

**Component:** `src/components/flights/flight-results-list.tsx`

**Features:**
- Flight cards with airline logo, times, duration, stops
- Price display with currency
- Sort by: price, duration, departure time
- Filter by: stops, airlines, departure time, price range
- "View Details" button → opens flight details modal
- "Book Now" button → tracks referral and redirects

### **3. Flight Card**

**Component:** `src/components/flights/flight-card.tsx`

**Features:**
- Airline logo and name
- Departure/arrival times and airports
- Flight duration
- Number of stops
- Price with currency
- "Book Now" CTA button

### **4. Flight Details Modal**

**Component:** `src/components/flights/flight-details-modal.tsx`

**Features:**
- Full itinerary with segments
- Baggage allowance
- Fare rules
- "Book Now" button

---

## 📄 Pages Design

### **1. Flight Search Page**

**Path:** `src/app/flights/page.tsx`

**Features:**
- Hero section with search form
- Popular routes
- Recent searches (if logged in)
- Flight deals/promotions

### **2. Flight Results Page**

**Path:** `src/app/flights/search/page.tsx`

**Features:**
- Search summary (route, dates, passengers)
- Modify search button
- Flight results list
- Filters sidebar
- Sort options
- Loading states
- Empty state (no flights found)

### **3. My Flight Referrals Page**

**Path:** `src/app/(app)/account/my-flights/page.tsx`

**Features:**
- List of all flight referrals
- Status badges (pending, confirmed, paid)
- Commission earnings
- Statistics dashboard
- Filter by status

---

## 🔐 Security & Validation

### **API Key Management**
- Store Amadeus API credentials in environment variables
- Never expose API keys to client
- Rate limiting on search endpoint

### **Data Validation**
- Validate airport codes (IATA format)
- Validate dates (future dates only)
- Validate passenger counts (min 1 adult)
- Validate class enum

### **Caching Strategy**
- Cache search results for 15-30 minutes
- Use searchParams hash as cache key
- Automatic cache expiration

---

## 📈 Implementation Phases

### **Phase 1: Backend Foundation** (Priority 1)
1. Create `src/lib/flights-data.ts` with schemas and operations
2. Set up Amadeus API integration
3. Implement search caching logic
4. Create referral tracking operations

### **Phase 2: API Endpoints** (Priority 2)
1. `GET /api/flights/search` - Flight search with caching
2. `POST /api/flights/referral` - Track referral clicks
3. `GET /api/flights/referrals` - User referrals
4. `GET /api/flights/airports` - Airport search

### **Phase 3: Frontend Components** (Priority 3)
1. FlightSearchForm component
2. FlightCard component
3. FlightResultsList component
4. FlightDetailsModal component

### **Phase 4: Pages** (Priority 4)
1. Flight search page (`/flights`)
2. Flight results page (`/flights/search`)
3. My flight referrals page (`/account/my-flights`)

### **Phase 5: Integration** (Priority 5)
1. Add flights to main navigation
2. Add flight referrals to customer dashboard
3. Add flight stats to admin dashboard
4. Update documentation

---

## 🧪 Testing Strategy

### **Manual Testing**
- Search one-way flights
- Search round-trip flights
- Test cache (same search within 30 min)
- Click "Book Now" and verify redirect
- Verify referral tracking
- Test airport autocomplete

### **Test Data**
- Seed popular airports (JFK, LAX, LHR, DXB, etc.)
- Seed major airlines (AA, UA, DL, BA, etc.)
- Create sample referral data

---

## 📝 Next Steps

1. ✅ Investigation complete
2. ⏳ Set up Amadeus API account
3. ⏳ Create backend schemas and operations
4. ⏳ Build API endpoints
5. ⏳ Create frontend components
6. ⏳ Build pages
7. ⏳ Integration and testing

---

**Ready to proceed with implementation!** 🚀

