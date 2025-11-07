# Phase 2: Hotel Booking System - Implementation Guide

## 📋 Overview

This document outlines the complete implementation of the Hotel Booking System (Phase 2) for the booking platform. The system includes property management, room management, search functionality, availability checking, and booking with payment integration.

---

## 🗄️ Database Schemas

### Collections Created

1. **properties** - Hotel/property listings
2. **rooms** - Room types and availability
3. **hotel_bookings** - Booking records

### Schema Details

#### Property Schema
```typescript
{
  _id: ObjectId,
  ownerId: string, // ref: Users
  name: string,
  slug: string,
  type: 'hotel' | 'apartment' | 'resort' | 'villa' | 'hostel' | 'guesthouse',
  description: string,
  images: [{
    url: string,
    caption?: string,
    order: number
  }],
  location: {
    address: string,
    city: string,
    state: string,
    country: string,
    postalCode?: string,
    coordinates: { lat: number, lng: number }
  },
  amenities: string[], // ['wifi', 'parking', 'pool', 'gym', 'restaurant']
  starRating: number, // 1-5
  policies: {
    checkInTime: string, // "14:00"
    checkOutTime: string, // "11:00"
    cancellationPolicy: 'flexible' | 'moderate' | 'strict' | 'non_refundable',
    childrenAllowed: boolean,
    petsAllowed: boolean,
    smokingAllowed: boolean,
    partiesAllowed: boolean
  },
  contactInfo: {
    phone: string,
    email: string,
    website?: string
  },
  status: 'active' | 'inactive' | 'pending_approval',
  averageRating: number,
  reviewCount: number,
  totalRooms: number,
  createdAt: string,
  updatedAt: string
}
```

#### Room Schema
```typescript
{
  _id: ObjectId,
  propertyId: string, // ref: Properties
  name: string,
  type: 'single' | 'double' | 'twin' | 'suite' | 'deluxe' | 'family',
  description: string,
  images: [{ url: string, caption?: string, order: number }],
  capacity: {
    adults: number,
    children: number,
    infants: number
  },
  bedConfiguration: [{
    type: 'single' | 'double' | 'queen' | 'king' | 'sofa_bed',
    count: number
  }],
  size: number, // square meters
  amenities: string[], // ['tv', 'minibar', 'safe', 'balcony', 'sea_view']
  pricing: {
    basePrice: number,
    currency: string,
    taxRate: number, // percentage
    cleaningFee?: number,
    extraGuestFee?: number
  },
  availability: {
    totalRooms: number,
    minimumStay: number, // nights
    maximumStay?: number
  },
  isActive: boolean,
  createdAt: string,
  updatedAt: string
}
```

#### Hotel Booking Schema
```typescript
{
  _id: ObjectId,
  propertyId: string,
  roomId: string,
  userId: string,
  guestInfo: {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    country: string
  },
  checkInDate: string, // ISO date
  checkOutDate: string,
  numberOfNights: number,
  guests: {
    adults: number,
    children: number,
    infants: number
  },
  pricing: {
    roomPrice: number,
    taxAmount: number,
    cleaningFee: number,
    extraGuestFee: number,
    totalPrice: number,
    currency: string
  },
  paymentInfo: {
    paymentIntentId: string,
    paymentStatus: 'pending' | 'paid' | 'refunded',
    paidAt?: string
  },
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled',
  specialRequests?: string,
  cancellationReason?: string,
  cancelledAt?: string,
  createdAt: string,
  updatedAt: string
}
```

---

## 🔌 API Endpoints

### Property Management

#### Create Property
```
POST /api/hotels/properties
Authorization: Required (property_owner, admin)
```

**Request Body:**
```json
{
  "name": "Grand Hotel",
  "slug": "grand-hotel-downtown",
  "type": "hotel",
  "description": "Luxury hotel in the heart of the city...",
  "images": [
    { "url": "https://...", "caption": "Lobby", "order": 0 }
  ],
  "location": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "coordinates": { "lat": 40.7128, "lng": -74.0060 }
  },
  "amenities": ["wifi", "parking", "pool", "gym"],
  "starRating": 5,
  "policies": {
    "checkInTime": "14:00",
    "checkOutTime": "11:00",
    "cancellationPolicy": "moderate",
    "childrenAllowed": true,
    "petsAllowed": false,
    "smokingAllowed": false,
    "partiesAllowed": false
  },
  "contactInfo": {
    "phone": "+1234567890",
    "email": "info@grandhotel.com",
    "website": "https://grandhotel.com"
  },
  "totalRooms": 50
}
```

#### Search Properties
```
GET /api/hotels/properties?city=New York&checkInDate=2024-12-01&checkOutDate=2024-12-05&guests=2&minPrice=100&maxPrice=500&amenities=wifi,pool&minRating=4
Authorization: Not required
```

**Query Parameters:**
- `city` - Filter by city
- `country` - Filter by country
- `checkInDate` - Check-in date (YYYY-MM-DD)
- `checkOutDate` - Check-out date (YYYY-MM-DD)
- `guests` - Number of guests
- `minPrice` - Minimum price per night
- `maxPrice` - Maximum price per night
- `propertyType` - hotel, apartment, resort, villa, hostel, guesthouse
- `amenities` - Comma-separated list
- `minRating` - Minimum star rating (1-5)

#### Get Property
```
GET /api/hotels/properties/[id]
Authorization: Not required
```

#### Update Property
```
PATCH /api/hotels/properties/[id]
Authorization: Required (owner or admin)
```

#### Delete Property
```
DELETE /api/hotels/properties/[id]
Authorization: Required (owner or admin)
```

### Room Management

#### Create Room
```
POST /api/hotels/rooms
Authorization: Required (property_owner, admin)
```

**Request Body:**
```json
{
  "propertyId": "...",
  "name": "Deluxe King Room",
  "type": "deluxe",
  "description": "Spacious room with king bed...",
  "images": [{ "url": "https://...", "order": 0 }],
  "capacity": { "adults": 2, "children": 1, "infants": 1 },
  "bedConfiguration": [{ "type": "king", "count": 1 }],
  "size": 35,
  "amenities": ["tv", "minibar", "safe", "balcony"],
  "pricing": {
    "basePrice": 200,
    "currency": "USD",
    "taxRate": 10,
    "cleaningFee": 25,
    "extraGuestFee": 30
  },
  "availability": {
    "totalRooms": 10,
    "minimumStay": 1,
    "maximumStay": 30
  },
  "isActive": true
}
```

#### Get Rooms by Property
```
GET /api/hotels/rooms?propertyId=[id]
Authorization: Not required
```

#### Get Room
```
GET /api/hotels/rooms/[id]
Authorization: Not required
```

#### Check Room Availability
```
GET /api/hotels/rooms/[id]/availability?checkInDate=2024-12-01&checkOutDate=2024-12-05
Authorization: Not required
```

**Response:**
```json
{
  "success": true,
  "available": true,
  "availableRooms": 5,
  "nights": 4,
  "pricing": {
    "basePrice": 800,
    "taxAmount": 80,
    "cleaningFee": 25,
    "totalPrice": 905,
    "currency": "USD",
    "pricePerNight": 200
  },
  "room": {
    "id": "...",
    "name": "Deluxe King Room",
    "type": "deluxe",
    "capacity": { "adults": 2, "children": 1, "infants": 1 }
  }
}
```

#### Update Room
```
PATCH /api/hotels/rooms/[id]
Authorization: Required (owner or admin)
```

#### Delete Room
```
DELETE /api/hotels/rooms/[id]
Authorization: Required (owner or admin)
```

### Booking Management

#### Create Booking
```
POST /api/hotels/bookings
Authorization: Required
```

**Request Body:**
```json
{
  "propertyId": "...",
  "roomId": "...",
  "guestInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "country": "USA"
  },
  "checkInDate": "2024-12-01",
  "checkOutDate": "2024-12-05",
  "guests": { "adults": 2, "children": 0, "infants": 0 },
  "specialRequests": "Late check-in please"
}
```

**Response:**
```json
{
  "success": true,
  "booking": { ... },
  "paymentIntent": {
    "clientSecret": "pi_...",
    "amount": 905,
    "currency": "USD"
  },
  "message": "Booking created successfully"
}
```

#### Get User's Bookings
```
GET /api/hotels/bookings
Authorization: Required
```

#### Get Booking
```
GET /api/hotels/bookings/[id]
Authorization: Required (booking owner, property owner, or admin)
```

#### Update Booking
```
PATCH /api/hotels/bookings/[id]
Authorization: Required (specific permissions based on action)
```

**Request Body:**
```json
{
  "status": "confirmed", // or "cancelled", "checked_in", "checked_out"
  "cancellationReason": "Change of plans" // if cancelling
}
```

#### Get Property Bookings
```
GET /api/hotels/properties/[id]/bookings
Authorization: Required (property owner or admin)
```

---

## 🔒 Security & Permissions

### Role-Based Access Control

- **property_owner**: Can create/manage their own properties and rooms
- **admin**: Can manage all properties, rooms, and bookings
- **customer**: Can search, view, and book properties
- **All authenticated users**: Can create bookings

### Permission Matrix

| Action | Customer | Property Owner | Admin |
|--------|----------|----------------|-------|
| Search properties | ✅ | ✅ | ✅ |
| View property | ✅ | ✅ | ✅ |
| Create property | ❌ | ✅ | ✅ |
| Update own property | ❌ | ✅ | ✅ |
| Delete own property | ❌ | ✅ | ✅ |
| Create room | ❌ | ✅ (own property) | ✅ |
| Update room | ❌ | ✅ (own property) | ✅ |
| Delete room | ❌ | ✅ (own property) | ✅ |
| Create booking | ✅ | ✅ | ✅ |
| View own bookings | ✅ | ✅ | ✅ |
| Cancel own booking | ✅ | ❌ | ✅ |
| Confirm booking | ❌ | ✅ (own property) | ✅ |
| Check-in/out | ❌ | ✅ (own property) | ✅ |

---

## ✅ Implementation Status

### Completed ✅

1. **Database Schemas** (`src/lib/hotels-data.ts`)
   - Property, Room, HotelBooking interfaces
   - CRUD operations for all entities
   - Room availability checking
   - Property search with filters

2. **API Endpoints**
   - Property management (create, read, update, delete)
   - Room management (create, read, update, delete)
   - Availability checking
   - Booking creation with Stripe integration
   - Booking management (view, update, cancel)
   - Property owner booking views

3. **Features**
   - Multi-property type support
   - Advanced search with filters
   - Real-time availability checking
   - Dynamic pricing calculation
   - Stripe payment integration
   - Role-based access control
   - Comprehensive validation (Zod)

### Pending 🚧

1. **UI Components** (Next step)
   - Property search interface
   - Property listing cards
   - Property detail page
   - Room selection interface
   - Booking flow
   - Booking management dashboard

---

## 🧪 Testing

### API Testing Examples

See `docs/SETUP_GUIDE.md` for detailed API testing examples with curl commands.

---

## 📝 Next Steps

1. Build UI components for hotel search and booking
2. Implement property owner dashboard
3. Add review system for properties
4. Implement email notifications for bookings
5. Add calendar view for availability
6. Implement advanced filters (map view, nearby attractions)

---

## 🎯 Key Features

✅ Multi-property type support (hotels, apartments, resorts, villas, hostels, guesthouses)  
✅ Advanced search with location, dates, price, amenities, and rating filters  
✅ Real-time room availability checking  
✅ Dynamic pricing with taxes, fees, and extra guest charges  
✅ Stripe payment integration  
✅ Comprehensive booking management  
✅ Role-based access control  
✅ Validation and error handling  
✅ Scalable architecture  

---

**Implementation Date:** 2025-11-07  
**Status:** Backend Complete, UI Pending

