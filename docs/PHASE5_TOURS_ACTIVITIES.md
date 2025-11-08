# Phase 5: Tours & Activities System - Implementation Documentation

## Overview
This document details the complete implementation of the Tours & Activities System for the booking platform. The system allows tour operators to list tour packages, customers to browse and book tours, and administrators to manage all tour-related activities.

## System Architecture

### Database Schemas

#### TourPackage Schema
Located in `src/lib/tours-data.ts`

```typescript
interface TourPackage {
  _id?: ObjectId;
  id?: string;
  name: string;
  slug: string;
  duration: string; // e.g., "3 days 2 nights", "Half day", "Full day"
  description: string;
  location: string;
  tourType: string; // e.g., "City Tour", "Adventure", "Cultural", "Food Tour"
  tags: string[];
  activityIds: string[]; // References to TourActivity
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    activities: string[];
  }>;
  inclusions: string[];
  exclusions: string[];
  price: number; // Base price for adults
  featuredImageUrl: string;
  galleryImages: string[];
  highlights: string[];
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  mapEmbedUrl?: string;
  isActive: boolean;
  guideId: string; // Tour operator user ID
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}
```

#### TourBooking Schema
Located in `src/lib/tours-data.ts`

```typescript
interface TourBooking {
  _id?: ObjectId;
  id?: string;
  tourId: string;
  tourName: string;
  tourSlug: string;
  userId: string;
  tourDate: string; // ISO date string (YYYY-MM-DD)
  tourTime?: string; // Optional time (HH:MM)
  participants: {
    adults: number;
    children: number;
    seniors: number;
  };
  totalParticipants: number;
  pricing: {
    adultPrice: number;
    childPrice: number; // 30% discount from adult price
    seniorPrice: number; // 15% discount from adult price
    subtotal: number;
    tax: number; // 10% of subtotal
    total: number;
  };
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  specialRequests?: string;
  dietaryRestrictions?: string;
  accessibilityNeeds?: string;
  paymentInfo: {
    stripePaymentIntentId?: string;
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paidAt?: string;
  };
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}
```

#### TourActivity Schema
Located in `src/lib/tour-activities-data.ts`

```typescript
interface TourActivity {
  _id?: ObjectId;
  id?: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  createdAt: string;
  updatedAt: string;
}
```

#### TourGuide Schema
Located in `src/lib/tour-guides-data.ts`

```typescript
interface TourGuide {
  _id?: ObjectId;
  id?: string;
  userId: string;
  name: string;
  bio: string;
  languages: string[];
  specializations: string[];
  experience: string;
  rating: number;
  reviewCount: number;
  profileImageUrl?: string;
  certifications: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Pricing Model

**Tour Pricing Structure:**
- **Adult Price**: Base price from tour package
- **Child Price**: Adult price × 0.7 (30% discount)
- **Senior Price**: Adult price × 0.85 (15% discount)
- **Tax**: Subtotal × 0.1 (10% tax)
- **Total**: Subtotal + Tax

**Example Calculation:**
```
Tour Base Price: $100
Adults: 2, Children: 1, Seniors: 1

Adult Price: $100 × 2 = $200
Child Price: $70 × 1 = $70
Senior Price: $85 × 1 = $85
Subtotal: $355
Tax (10%): $35.50
Total: $390.50
```

## API Endpoints

### Tour Management

#### 1. Create Tour Package
- **Endpoint**: `POST /api/tours`
- **Authorization**: `tour_operator` or `admin`
- **Request Body**:
```json
{
  "name": "Serengeti Safari Adventure",
  "duration": "3 days 2 nights",
  "description": "Experience the wildlife...",
  "location": "Serengeti National Park",
  "tourType": "Safari",
  "price": 500,
  "activityIds": ["activity1", "activity2"],
  "itinerary": [...],
  "inclusions": ["Accommodation", "Meals", "Guide"],
  "exclusions": ["Flights", "Personal expenses"],
  "highlights": ["Big Five", "Sunset views"],
  "faqs": [...]
}
```

#### 2. Get All Tours
- **Endpoint**: `GET /api/tours`
- **Query Parameters**:
  - `location`: Filter by location
  - `tourType`: Filter by tour type
  - `minPrice`, `maxPrice`: Price range
  - `activityId`: Filter by activity
  - `search`: Search in name/description

#### 3. Get Tour by ID/Slug
- **Endpoint**: `GET /api/tours/[tourIdOrSlug]`
- **Returns**: Full tour details with guide information

#### 4. Update Tour
- **Endpoint**: `PATCH /api/tours/[tourIdOrSlug]`
- **Authorization**: Tour owner or admin

#### 5. Delete Tour
- **Endpoint**: `DELETE /api/tours/[tourIdOrSlug]`
- **Authorization**: Tour owner or admin

### Tour Booking

#### 1. Create Booking
- **Endpoint**: `POST /api/tours/bookings`
- **Authorization**: Authenticated user
- **Request Body**:
```json
{
  "tourId": "tour123",
  "tourDate": "2025-12-15",
  "tourTime": "09:00",
  "participants": {
    "adults": 2,
    "children": 1,
    "seniors": 0
  },
  "contactInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890"
  },
  "specialRequests": "Vegetarian meals",
  "dietaryRestrictions": "No peanuts",
  "accessibilityNeeds": "Wheelchair accessible"
}
```
- **Response**: Booking details with Stripe payment intent

#### 2. Get User's Bookings
- **Endpoint**: `GET /api/tours/bookings`
- **Authorization**: Authenticated user
- **Admin Filter**: `?userId=user123` (admin only)

#### 3. Get Booking by ID
- **Endpoint**: `GET /api/tours/bookings/[id]`
- **Authorization**: Booking owner or admin

#### 4. Update Booking
- **Endpoint**: `PATCH /api/tours/bookings/[id]`
- **Authorization**: Booking owner or admin
- **Supports**: Status updates, cancellations with automatic refunds

#### 5. Get Tour's Bookings
- **Endpoint**: `GET /api/tours/[tourIdOrSlug]/bookings`
- **Authorization**: Tour owner or admin
- **Returns**: All bookings for a specific tour

## Frontend Components

### Public Pages

#### 1. Tours Listing Page
- **Path**: `/tours`
- **File**: `src/app/tours/page.tsx`
- **Features**:
  - Search and filter tours
  - Tour cards with images, pricing, ratings
  - Activity filters
  - Location and price range filters

#### 2. Tour Detail Page
- **Path**: `/tours/[slug]`
- **File**: `src/app/tours/[slug]/page.tsx`
- **Features**:
  - Image gallery
  - Tour overview and highlights
  - Detailed itinerary
  - Inclusions/exclusions
  - FAQs
  - Tour guide information
  - Booking form (TourBookingCard)

### Booking Components

#### TourBookingCard
- **File**: `src/components/tours/tour-booking-card.tsx`
- **Features**:
  - Date picker for tour date
  - Time selection
  - Participant count (adults, children, seniors)
  - Pricing breakdown with discounts
  - Contact information form
  - Special requests, dietary restrictions, accessibility needs
  - Stripe payment integration
  - Real-time price calculation

### Dashboard Pages

#### 1. Tour Operator Dashboard
- **Path**: `/account/my-tours`
- **File**: `src/app/(app)/account/my-tours/page.tsx`
- **Features**:
  - Statistics cards (total tours, bookings, revenue)
  - Tours tab: Grid of operator's tours with edit/delete
  - Bookings tab: List of all tour bookings with customer details
  - Revenue analytics

#### 2. Customer Bookings Dashboard
- **Path**: `/account/bookings`
- **File**: `src/app/(app)/account/bookings/page.tsx`
- **Features**:
  - "All" tab includes tour bookings
  - Dedicated "Tours" tab
  - Tour booking cards with participant details
  - Cancellation support

#### 3. Admin Dashboard
- **Path**: `/account/admin`
- **File**: `src/app/(app)/account/admin/page.tsx`
- **Features**:
  - Tour statistics card (total tours, upcoming tours)
  - Tours tab showing all tour bookings
  - Revenue tracking including tour bookings

### Admin Management

#### Tour Management
- **Path**: `/admin/tours`
- **File**: `src/app/(app)/admin/tours/page.tsx`
- **Components**:
  - `TourListManagement`: CRUD for tours
  - `TourFormDialog`: Create/edit tour form
  - `TourActivityManagement`: Manage activity categories
  - `TourGuideManagement`: Manage tour guides

## Payment Integration

### Stripe Integration
- **Payment Intent Creation**: On booking creation
- **Metadata Tracking**: tourId, tourName, userId, tourDate, totalParticipants
- **Automatic Refunds**: On booking cancellation
- **Payment Status Tracking**: pending → paid → refunded

## Status Workflows

### Booking Status Flow
1. **pending**: Initial booking created, payment pending
2. **confirmed**: Payment successful, tour confirmed
3. **cancelled**: Booking cancelled (automatic refund if paid)
4. **completed**: Tour completed

## Integration Points

### Customer Bookings Dashboard
- Tour bookings displayed in "All" tab
- Dedicated "Tours" tab for tour-only view
- Cancellation support with refund processing

### Admin Dashboard
- Tour statistics in overview cards
- Tours tab for all tour bookings
- Revenue tracking includes tour bookings

### Tour Operator Dashboard
- Complete tour management
- Booking management and customer communication
- Revenue analytics

## Testing

### Test Data Creation
Use `src/scripts/seed-test-data.ts` to create:
- Sample tour packages
- Tour activities
- Tour guides
- Test bookings

### API Testing
Use `src/scripts/test-apis.ts` to test:
- Tour CRUD operations
- Booking creation and management
- Payment processing
- Authorization checks

## Security Considerations

1. **Authorization**:
   - Tour operators can only manage their own tours
   - Customers can only view/cancel their own bookings
   - Admins have full access

2. **Payment Security**:
   - Stripe handles all payment processing
   - No credit card data stored in database
   - Payment intents tracked for refunds

3. **Data Validation**:
   - Zod schemas validate all API inputs
   - Date validation ensures future bookings only
   - Participant count validation

## Future Enhancements

1. **Reviews & Ratings**: Customer reviews for completed tours
2. **Group Discounts**: Automatic discounts for large groups
3. **Multi-day Tours**: Enhanced itinerary management
4. **Tour Availability**: Calendar-based availability management
5. **Tour Operator Verification**: Certification and background checks
6. **Real-time Chat**: Communication between customers and operators
7. **Tour Recommendations**: AI-powered tour suggestions
8. **Multi-language Support**: Tours in multiple languages

## Conclusion

Phase 5 successfully implements a comprehensive Tours & Activities System with:
- ✅ Complete backend schemas and operations
- ✅ Full API endpoints with authorization
- ✅ Public tour browsing and booking
- ✅ Tour operator dashboard
- ✅ Customer booking management
- ✅ Admin oversight and analytics
- ✅ Stripe payment integration
- ✅ Pricing tiers (adult, child, senior)
- ✅ Special requests and accessibility support

The system is production-ready and fully integrated with the existing booking platform.

