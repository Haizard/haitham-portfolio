# Phase 7: Advanced Features - Implementation Plan

## 🎯 Overview

Phase 7 focuses on implementing advanced features that enhance user experience and engagement:
- **Wishlist & Comparison** (Weeks 25-26)
- **Loyalty & Rewards Program** (Weeks 27-28)
- **Multi-language & Multi-currency** (Weeks 29-30)

---

## Week 25-26: Wishlist & Comparison Features

### 1. Wishlist/Favorites System

#### Database Schema

```typescript
interface Wishlist {
  _id: ObjectId;
  id: string;
  userId: string;
  name: string; // "My Favorites", "Summer Vacation", etc.
  description?: string;
  items: Array<{
    itemType: 'property' | 'vehicle' | 'tour' | 'transfer';
    itemId: string;
    addedAt: string;
    notes?: string;
  }>;
  isDefault: boolean; // Default wishlist for quick saves
  isPublic: boolean; // Can be shared with others
  shareToken?: string; // For sharing wishlists
  createdAt: string;
  updatedAt: string;
}
```

#### API Endpoints

**Wishlist Management:**
- `POST /api/wishlists` - Create wishlist
- `GET /api/wishlists` - Get user's wishlists
- `GET /api/wishlists/[id]` - Get wishlist details
- `PATCH /api/wishlists/[id]` - Update wishlist (name, description)
- `DELETE /api/wishlists/[id]` - Delete wishlist

**Wishlist Items:**
- `POST /api/wishlists/[id]/items` - Add item to wishlist
- `DELETE /api/wishlists/[id]/items/[itemId]` - Remove item
- `GET /api/wishlists/shared/[token]` - View shared wishlist (public)

#### Frontend Components

**Components:**
- `WishlistButton` - Heart icon button to add/remove from wishlist
- `WishlistDialog` - Dialog to select which wishlist to add to
- `WishlistCard` - Display wishlist with item count
- `WishlistItemCard` - Display wishlist item with details
- `CreateWishlistDialog` - Create new wishlist
- `ShareWishlistDialog` - Share wishlist with link

**Pages:**
- `/account/wishlists` - Manage all wishlists
- `/account/wishlists/[id]` - View wishlist items
- `/wishlists/shared/[token]` - Public shared wishlist view

#### Features
- ✅ Multiple wishlists per user
- ✅ Default wishlist for quick saves
- ✅ Add notes to wishlist items
- ✅ Share wishlists with friends/family
- ✅ Public/private wishlist toggle
- ✅ Wishlist item count badges
- ✅ Quick add from any listing page
- ✅ Bulk operations (move, delete)

---

### 2. Comparison Feature

#### Database Schema

```typescript
interface Comparison {
  _id: ObjectId;
  id: string;
  userId: string;
  comparisonType: 'property' | 'vehicle' | 'tour' | 'transfer';
  items: Array<{
    itemId: string;
    addedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
```

#### API Endpoints

- `POST /api/comparisons` - Create/update comparison
- `GET /api/comparisons` - Get user's active comparisons
- `DELETE /api/comparisons/[id]` - Clear comparison
- `POST /api/comparisons/[id]/items` - Add item to comparison
- `DELETE /api/comparisons/[id]/items/[itemId]` - Remove item

#### Frontend Components

**Components:**
- `CompareButton` - Add to comparison button
- `CompareBar` - Sticky bar showing comparison items (bottom of screen)
- `ComparisonTable` - Side-by-side comparison table
- `ComparisonCard` - Mobile-friendly comparison card

**Pages:**
- `/compare/properties` - Compare hotels
- `/compare/vehicles` - Compare cars
- `/compare/tours` - Compare tours
- `/compare/transfers` - Compare transfers

#### Comparison Criteria

**Hotels:**
- Price per night
- Star rating
- Guest rating
- Amenities (WiFi, parking, pool, etc.)
- Location (distance from center)
- Cancellation policy
- Room types available

**Cars:**
- Daily rate
- Category
- Transmission
- Fuel type
- Seats & luggage
- Features (GPS, Bluetooth, etc.)
- Rating

**Tours:**
- Price per person
- Duration
- Inclusions/exclusions
- Rating
- Difficulty level
- Group size

**Transfers:**
- Price
- Vehicle type
- Capacity
- Features
- Rating

#### Features
- ✅ Compare up to 3 items
- ✅ Highlight differences
- ✅ Quick actions (book, remove)
- ✅ Sticky comparison bar
- ✅ Mobile-responsive design
- ✅ Save comparison for later
- ✅ Share comparison link

---

### 3. Price Alerts System

#### Database Schema

```typescript
interface PriceAlert {
  _id: ObjectId;
  id: string;
  userId: string;
  alertType: 'property' | 'vehicle' | 'tour' | 'transfer' | 'flight';
  targetId: string;
  targetPrice: number;
  currency: string;
  searchCriteria: {
    // For hotels
    checkIn?: string;
    checkOut?: string;
    guests?: number;
    // For cars
    pickupDate?: string;
    returnDate?: string;
    // For tours
    tourDate?: string;
    participants?: number;
    // For flights
    origin?: string;
    destination?: string;
    departureDate?: string;
  };
  currentPrice?: number;
  lowestPrice?: number;
  priceHistory: Array<{
    price: number;
    timestamp: string;
  }>;
  alertTriggered: boolean;
  triggeredAt?: string;
  notificationsSent: number;
  isActive: boolean;
  expiresAt: string; // Auto-expire after 30 days
  createdAt: string;
  updatedAt: string;
}
```

#### API Endpoints

- `POST /api/price-alerts` - Create price alert
- `GET /api/price-alerts` - Get user's price alerts
- `GET /api/price-alerts/[id]` - Get alert details
- `PATCH /api/price-alerts/[id]` - Update alert (deactivate, change target price)
- `DELETE /api/price-alerts/[id]` - Delete alert

#### Frontend Components

**Components:**
- `PriceAlertButton` - Create price alert from listing
- `PriceAlertCard` - Display alert with price history
- `PriceAlertDialog` - Create/edit price alert
- `PriceHistoryChart` - Line chart showing price trends

**Pages:**
- `/account/price-alerts` - Manage all price alerts

#### Features
- ✅ Set target price for specific dates
- ✅ Track price history (last 30 days)
- ✅ Email/SMS notifications when price drops
- ✅ Visual price trend charts
- ✅ Auto-expire after 30 days
- ✅ Pause/resume alerts
- ✅ Multiple alerts per item

---

### 4. Notification Preferences

#### Database Schema (Update User Schema)

```typescript
interface User {
  // ... existing fields
  notificationPreferences: {
    email: {
      bookingConfirmation: boolean;
      bookingReminder: boolean;
      priceAlerts: boolean;
      promotions: boolean;
      newsletter: boolean;
    };
    sms: {
      bookingConfirmation: boolean;
      bookingReminder: boolean;
      priceAlerts: boolean;
    };
    push: {
      bookingConfirmation: boolean;
      bookingReminder: boolean;
      priceAlerts: boolean;
      promotions: boolean;
    };
  };
}
```

#### API Endpoints

- `GET /api/user/notifications` - Get notification preferences
- `PATCH /api/user/notifications` - Update preferences

#### Frontend Components

**Components:**
- `NotificationSettings` - Notification preferences form

**Pages:**
- `/account/settings/notifications` - Notification settings page

#### Features
- ✅ Email notification toggles
- ✅ SMS notification toggles
- ✅ Push notification toggles
- ✅ Category-based preferences
- ✅ Unsubscribe links in emails
- ✅ Notification frequency control

---

## Implementation Checklist

### Week 25-26: Wishlist & Comparison

**Backend:**
- [ ] Create wishlist schema and operations
- [ ] Create comparison schema and operations
- [ ] Create price alert schema and operations
- [ ] Update user schema for notification preferences
- [ ] Implement 15+ API endpoints
- [ ] Add validation and error handling

**Frontend:**
- [ ] Create wishlist components (5 components)
- [ ] Create comparison components (4 components)
- [ ] Create price alert components (4 components)
- [ ] Create notification settings component
- [ ] Build wishlist pages (3 pages)
- [ ] Build comparison pages (4 pages)
- [ ] Build price alerts page

**Features:**
- [ ] Multiple wishlists with sharing
- [ ] Side-by-side comparison (up to 3 items)
- [ ] Price alerts with history tracking
- [ ] Notification preferences management
- [ ] Mobile-responsive design
- [ ] Real-time updates

**Testing:**
- [ ] Test wishlist CRUD operations
- [ ] Test comparison functionality
- [ ] Test price alert creation and triggering
- [ ] Test notification preferences
- [ ] Test sharing functionality

---

## Success Metrics

**Wishlist:**
- Users can create multiple wishlists
- Items can be added/removed easily
- Wishlists can be shared publicly
- Default wishlist for quick saves

**Comparison:**
- Compare up to 3 items side-by-side
- Highlight key differences
- Quick booking from comparison
- Mobile-friendly design

**Price Alerts:**
- Set target prices for items
- Track price history
- Receive notifications when price drops
- Auto-expire after 30 days

**Notifications:**
- Granular control over notification types
- Support for email, SMS, and push
- Category-based preferences
- Easy unsubscribe

---

## Implementation Status

### ✅ Completed (Backend - Week 25-26)

**Data Operations:**
- ✅ `src/lib/wishlists-data.ts` - Wishlist operations (300 lines)
- ✅ `src/lib/comparisons-data.ts` - Comparison operations (200 lines)
- ✅ `src/lib/price-alerts-data.ts` - Price alert operations (300 lines)

**API Endpoints (Started):**
- ✅ `src/app/api/wishlists/route.ts` - GET, POST wishlists

**Remaining Work:**
- [ ] Complete wishlist API endpoints (5 more endpoints)
- [ ] Create comparison API endpoints (5 endpoints)
- [ ] Create price alert API endpoints (5 endpoints)
- [ ] Create notification preferences API (2 endpoints)
- [ ] Build all frontend components (13 components)
- [ ] Build all pages (8 pages)
- [ ] Integration and testing

---

## Next Steps

After completing Week 25-26, proceed to:
- **Week 27-28:** Loyalty & Rewards Program
- **Week 29-30:** Multi-language & Multi-currency


