# Phase 3: Car Rental System - Implementation Guide

## 📋 Overview

This document outlines the complete implementation of the Car Rental System (Phase 3) for the booking platform. The system includes vehicle management, rental bookings, search functionality, availability checking, and payment integration.

---

## 🗄️ Database Schemas

### Collections Created

1. **vehicles** - Vehicle listings
2. **car_rentals** - Rental bookings

### Schema Details

#### Vehicle Schema
```typescript
{
  _id: ObjectId,
  ownerId: string, // ref: Users
  make: string,
  model: string,
  year: number,
  category: 'economy' | 'compact' | 'midsize' | 'fullsize' | 'suv' | 'luxury' | 'van',
  transmission: 'automatic' | 'manual',
  fuelType: 'petrol' | 'diesel' | 'electric' | 'hybrid',
  seats: number,
  doors: number,
  luggage: number,
  color: string,
  licensePlate: string,
  vin?: string,
  images: [{
    url: string,
    caption?: string,
    isPrimary: boolean,
    order: number
  }],
  features: string[], // ['gps', 'bluetooth', 'backup_camera', 'sunroof']
  location: {
    address: string,
    city: string,
    state: string,
    country: string,
    coordinates: { lat: number, lng: number },
    pickupInstructions?: string
  },
  pricing: {
    dailyRate: number,
    weeklyRate?: number,
    monthlyRate?: number,
    currency: string,
    deposit: number,
    mileageLimit?: number, // km per day
    extraMileageFee?: number, // per km
    insuranceFee?: number // per day
  },
  status: 'available' | 'rented' | 'maintenance' | 'inactive',
  averageRating: number,
  reviewCount: number,
  totalRentals: number,
  createdAt: string,
  updatedAt: string
}
```

#### Car Rental Schema
```typescript
{
  _id: ObjectId,
  vehicleId: string, // ref: Vehicles
  userId: string, // ref: Users
  driverInfo: {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    licenseNumber: string,
    licenseExpiry: string,
    dateOfBirth: string
  },
  pickupDate: string, // ISO date
  pickupTime: string, // "10:00"
  returnDate: string,
  returnTime: string,
  numberOfDays: number,
  pickupLocation: string,
  returnLocation: string,
  pricing: {
    dailyRate: number,
    totalDays: number,
    subtotal: number,
    insuranceFee: number,
    deposit: number,
    totalPrice: number,
    currency: string
  },
  paymentInfo: {
    paymentIntentId: string,
    paymentStatus: 'pending' | 'paid' | 'refunded',
    paidAt?: string,
    depositRefunded?: boolean,
    depositRefundedAt?: string
  },
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled',
  additionalDrivers?: DriverInfo[],
  specialRequests?: string,
  mileageStart?: number,
  mileageEnd?: number,
  cancellationReason?: string,
  cancelledAt?: string,
  createdAt: string,
  updatedAt: string
}
```

---

## 🔌 API Endpoints

### Vehicle Management

#### Create Vehicle
```
POST /api/cars/vehicles
Authorization: Required (car_owner, admin)
```

**Request Body:**
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2023,
  "category": "midsize",
  "transmission": "automatic",
  "fuelType": "hybrid",
  "seats": 5,
  "doors": 4,
  "luggage": 3,
  "color": "Silver",
  "licensePlate": "ABC123",
  "images": [
    { "url": "https://...", "isPrimary": true, "order": 0 }
  ],
  "features": ["gps", "bluetooth", "backup_camera"],
  "location": {
    "address": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "country": "USA",
    "coordinates": { "lat": 34.0522, "lng": -118.2437 }
  },
  "pricing": {
    "dailyRate": 50,
    "weeklyRate": 300,
    "monthlyRate": 1000,
    "currency": "USD",
    "deposit": 200,
    "mileageLimit": 200,
    "extraMileageFee": 0.25,
    "insuranceFee": 15
  }
}
```

#### Search Vehicles
```
GET /api/cars/vehicles?city=Los Angeles&pickupDate=2024-12-01&returnDate=2024-12-05&category=midsize&transmission=automatic&minPrice=30&maxPrice=100&features=gps,bluetooth
Authorization: Not required
```

**Query Parameters:**
- `city` - Filter by city
- `country` - Filter by country
- `pickupDate` - Pickup date (YYYY-MM-DD)
- `returnDate` - Return date (YYYY-MM-DD)
- `category` - Vehicle category
- `transmission` - automatic or manual
- `fuelType` - petrol, diesel, electric, hybrid
- `minSeats` - Minimum number of seats
- `features` - Comma-separated list
- `minPrice` - Minimum daily rate
- `maxPrice` - Maximum daily rate

#### Get Vehicle
```
GET /api/cars/vehicles/[id]
Authorization: Not required
```

#### Check Vehicle Availability
```
GET /api/cars/vehicles/[id]/availability?pickupDate=2024-12-01&returnDate=2024-12-05
Authorization: Not required
```

**Response:**
```json
{
  "success": true,
  "available": true,
  "numberOfDays": 4,
  "pricing": {
    "dailyRate": 50,
    "numberOfDays": 4,
    "subtotal": 200,
    "insuranceFee": 60,
    "deposit": 200,
    "totalPrice": 460,
    "currency": "USD"
  },
  "vehicle": {
    "id": "...",
    "make": "Toyota",
    "model": "Camry",
    "year": 2023,
    "category": "midsize",
    "transmission": "automatic",
    "fuelType": "hybrid",
    "seats": 5,
    "mileageLimit": 200,
    "extraMileageFee": 0.25
  }
}
```

#### Update Vehicle
```
PATCH /api/cars/vehicles/[id]
Authorization: Required (owner or admin)
```

#### Delete Vehicle
```
DELETE /api/cars/vehicles/[id]
Authorization: Required (owner or admin)
```

### Rental Management

#### Create Rental
```
POST /api/cars/rentals
Authorization: Required
```

**Request Body:**
```json
{
  "vehicleId": "...",
  "driverInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "licenseNumber": "D1234567",
    "licenseExpiry": "2026-12-31",
    "dateOfBirth": "1990-01-01"
  },
  "pickupDate": "2024-12-01",
  "pickupTime": "10:00",
  "returnDate": "2024-12-05",
  "returnTime": "10:00",
  "pickupLocation": "123 Main St, Los Angeles, CA",
  "returnLocation": "123 Main St, Los Angeles, CA",
  "specialRequests": "Need child seat"
}
```

**Response:**
```json
{
  "success": true,
  "rental": { ... },
  "paymentIntent": {
    "clientSecret": "pi_...",
    "amount": 460,
    "currency": "USD"
  },
  "message": "Rental created successfully"
}
```

#### Get User's Rentals
```
GET /api/cars/rentals
Authorization: Required
```

#### Get Rental
```
GET /api/cars/rentals/[id]
Authorization: Required (rental owner, vehicle owner, or admin)
```

#### Update Rental
```
PATCH /api/cars/rentals/[id]
Authorization: Required (specific permissions based on action)
```

**Request Body:**
```json
{
  "status": "confirmed", // or "cancelled", "active", "completed"
  "mileageStart": 50000, // vehicle owner only
  "mileageEnd": 50800, // vehicle owner only
  "cancellationReason": "Change of plans" // if cancelling
}
```

---

## 🔒 Security & Permissions

### Role-Based Access Control

- **car_owner**: Can create/manage their own vehicles
- **admin**: Can manage all vehicles and rentals
- **customer**: Can search, view, and book vehicles
- **All authenticated users**: Can create rentals

### Permission Matrix

| Action | Customer | Car Owner | Admin |
|--------|----------|-----------|-------|
| Search vehicles | ✅ | ✅ | ✅ |
| View vehicle | ✅ | ✅ | ✅ |
| Create vehicle | ❌ | ✅ | ✅ |
| Update own vehicle | ❌ | ✅ | ✅ |
| Delete own vehicle | ❌ | ✅ | ✅ |
| Create rental | ✅ | ✅ | ✅ |
| View own rentals | ✅ | ✅ | ✅ |
| Cancel own rental | ✅ | ❌ | ✅ |
| Confirm rental | ❌ | ✅ (own vehicle) | ✅ |
| Update mileage | ❌ | ✅ (own vehicle) | ✅ |

---

## ✅ Implementation Status

### Completed ✅

1. **Database Schemas** (`src/lib/cars-data.ts`)
   - Vehicle and CarRental interfaces
   - CRUD operations for all entities
   - Vehicle availability checking
   - Vehicle search with filters

2. **API Endpoints**
   - Vehicle management (create, read, update, delete)
   - Availability checking
   - Rental creation with Stripe integration
   - Rental management (view, update, cancel)

3. **UI Components**
   - Car search form with date/time pickers
   - Vehicle cards with specs display
   - Search results page with filters
   - Cars landing page

4. **Features**
   - 7 vehicle categories
   - Advanced search with filters
   - Real-time availability checking
   - Dynamic pricing (daily, weekly, monthly rates)
   - Stripe payment integration
   - Driver validation (age, license expiry)
   - Role-based access control
   - Comprehensive validation (Zod)

---

## 🎯 Key Features

✅ 7 vehicle categories (economy, compact, midsize, fullsize, SUV, luxury, van)  
✅ Advanced search with location, dates, category, transmission, fuel type, features  
✅ Real-time availability checking  
✅ Dynamic pricing with weekly/monthly discounts  
✅ Stripe payment integration  
✅ Driver validation (minimum age 21, license expiry check)  
✅ Mileage tracking and extra mileage fees  
✅ Insurance fees  
✅ Deposit management  
✅ Role-based access control  
✅ Validation and error handling  
✅ Scalable architecture  

---

**Implementation Date:** 2025-11-07  
**Status:** Complete (Backend + UI)

