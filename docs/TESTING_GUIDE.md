# Testing Guide

This guide provides instructions for testing the booking platform's hotel and car rental systems.

---

## 🚀 Quick Start

### 1. Start the Development Server

```bash
npm run dev
```

The application should be running at `http://localhost:3000`

### 2. Create Test Users

You'll need users with different roles to test the system:

**Option A: Use Signup UI**
- Go to `/signup`
- Create accounts with different roles:
  - Customer account (default)
  - Property owner account (select `property_owner` role)
  - Car owner account (select `car_owner` role)
  - Admin account (select `admin` role)

**Option B: Use MongoDB directly**
- Connect to your MongoDB database
- Create users in the `users` collection with appropriate roles

### 3. Seed Test Data (Optional)

```bash
npx tsx scripts/seed-test-data.ts
```

**Note:** Update the `TEST_PROPERTY_OWNER_ID` and `TEST_CAR_OWNER_ID` in the script with actual user IDs first.

### 4. Run API Tests

```bash
npx tsx scripts/test-apis.ts
```

---

## 🏨 Testing Hotel System

### Search Hotels

1. **Navigate to Hotels Page**
   - Go to `/hotels`
   - You should see the hotels landing page with search form

2. **Search for Hotels**
   - Enter a destination (e.g., "New York")
   - Select check-in and check-out dates
   - Enter number of guests
   - Click "Search Hotels"

3. **View Search Results**
   - You should be redirected to `/hotels/search?city=New York&...`
   - Verify properties are displayed
   - Test filters:
     - Price range slider
     - Star rating checkboxes
     - Amenities checkboxes
   - Click "Apply Filters" and verify results update

### Test Hotel APIs Manually

**Search Properties:**
```bash
curl "http://localhost:3000/api/hotels/properties?city=New York"
```

**Search with Filters:**
```bash
curl "http://localhost:3000/api/hotels/properties?city=Miami&type=resort&minPrice=200&maxPrice=500&amenities=pool,spa"
```

**Get Property by ID:**
```bash
curl "http://localhost:3000/api/hotels/properties/{property-id}"
```

**Get Rooms for Property:**
```bash
curl "http://localhost:3000/api/hotels/rooms?propertyId={property-id}"
```

**Check Room Availability:**
```bash
curl "http://localhost:3000/api/hotels/rooms/{room-id}/availability?checkIn=2024-12-01&checkOut=2024-12-05&adults=2&children=0"
```

### Create a Property (Property Owner)

1. **Login as Property Owner**
   - Use an account with `property_owner` role

2. **Create Property via API:**
```bash
curl -X POST "http://localhost:3000/api/hotels/properties" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hotel",
    "type": "hotel",
    "description": "A test hotel",
    "address": "123 Test St",
    "city": "Test City",
    "state": "TS",
    "country": "USA",
    "zipCode": "12345",
    "coordinates": {"lat": 40.7128, "lng": -74.0060},
    "contactInfo": {
      "phone": "+1234567890",
      "email": "test@hotel.com"
    },
    "images": [
      {"url": "https://example.com/image.jpg", "isPrimary": true, "order": 0}
    ],
    "amenities": ["wifi", "parking"],
    "policies": {
      "checkInTime": "15:00",
      "checkOutTime": "11:00",
      "cancellationPolicy": "flexible",
      "petPolicy": "not_allowed",
      "smokingPolicy": "non_smoking"
    },
    "starRating": 4
  }'
```

### Create a Room (Property Owner)

```bash
curl -X POST "http://localhost:3000/api/hotels/rooms" \
  -H "Content-Type: application/json" \
  -d '{
    "propertyId": "{property-id}",
    "name": "Deluxe Room",
    "type": "deluxe",
    "description": "A deluxe room",
    "maxOccupancy": {"adults": 2, "children": 1, "infants": 1},
    "bedConfiguration": [{"type": "king", "count": 1}],
    "size": 30,
    "sizeUnit": "sqm",
    "images": [
      {"url": "https://example.com/room.jpg", "isPrimary": true, "order": 0}
    ],
    "amenities": ["wifi", "tv"],
    "pricing": {
      "basePrice": 150,
      "currency": "USD",
      "taxRate": 0.10,
      "cleaningFee": 25,
      "extraGuestFee": 20
    },
    "availability": {
      "isAvailable": true,
      "totalRooms": 5,
      "availableRooms": 5
    }
  }'
```

---

## 🚗 Testing Car Rental System

### Search Cars

1. **Navigate to Cars Page**
   - Go to `/cars`
   - You should see the cars landing page with search form

2. **Search for Cars**
   - Enter a pickup location (e.g., "Los Angeles")
   - Select pickup and return dates/times
   - Select vehicle category (optional)
   - Click "Search Cars"

3. **View Search Results**
   - You should be redirected to `/cars/search?city=Los Angeles&...`
   - Verify vehicles are displayed
   - Test filters:
     - Price range slider
     - Transmission type
     - Fuel type
     - Features checkboxes
   - Click "Apply Filters" and verify results update

### Test Car APIs Manually

**Search Vehicles:**
```bash
curl "http://localhost:3000/api/cars/vehicles?city=Los Angeles"
```

**Search with Filters:**
```bash
curl "http://localhost:3000/api/cars/vehicles?city=Miami&category=suv&transmission=automatic&minPrice=50&maxPrice=150"
```

**Get Vehicle by ID:**
```bash
curl "http://localhost:3000/api/cars/vehicles/{vehicle-id}"
```

**Check Vehicle Availability:**
```bash
curl "http://localhost:3000/api/cars/vehicles/{vehicle-id}/availability?pickupDate=2024-12-01&returnDate=2024-12-05"
```

### Create a Vehicle (Car Owner)

1. **Login as Car Owner**
   - Use an account with `car_owner` role

2. **Create Vehicle via API:**
```bash
curl -X POST "http://localhost:3000/api/cars/vehicles" \
  -H "Content-Type: application/json" \
  -d '{
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
    "licensePlate": "TEST123",
    "images": [
      {"url": "https://example.com/car.jpg", "isPrimary": true, "order": 0}
    ],
    "features": ["gps", "bluetooth"],
    "location": {
      "address": "123 Test St",
      "city": "Test City",
      "state": "TS",
      "country": "USA",
      "zipCode": "12345",
      "coordinates": {"lat": 40.7128, "lng": -74.0060}
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
  }'
```

---

## 🧪 Automated Testing

### Run All API Tests

```bash
npx tsx scripts/test-apis.ts
```

This will test:
- ✅ Hotel property search (all, by city, with filters, with dates)
- ✅ Room availability checking
- ✅ Car vehicle search (all, by city, with filters, with dates, by features)
- ✅ Vehicle availability checking
- ✅ Auth endpoints

### Expected Results

- All search endpoints should return 200 OK
- Endpoints requiring authentication should return 401 without valid session
- Invalid data should return 400 with validation errors
- Non-existent resources should return 404

---

## 📋 Test Checklist

### Hotel System
- [ ] Hotels landing page loads
- [ ] Search form works
- [ ] Search results display correctly
- [ ] Filters work (price, rating, amenities)
- [ ] Property owners can create properties
- [ ] Property owners can create rooms
- [ ] Room availability checking works
- [ ] Booking creation works (with Stripe)

### Car Rental System
- [ ] Cars landing page loads
- [ ] Search form works
- [ ] Search results display correctly
- [ ] Filters work (price, transmission, fuel, features)
- [ ] Car owners can create vehicles
- [ ] Vehicle availability checking works
- [ ] Rental creation works (with Stripe)
- [ ] Driver validation works (age, license)

### Profile System
- [ ] Profile page displays user info
- [ ] Avatar upload works (Cloudinary)
- [ ] Profile editing works
- [ ] Settings page works
- [ ] Role-specific dashboards display

---

## 🐛 Common Issues

### Issue: "Collection not found"
**Solution:** Make sure MongoDB is running and collections are created. Run the seed script to create test data.

### Issue: "Unauthorized" errors
**Solution:** Make sure you're logged in with the correct role for the operation.

### Issue: "Stripe error"
**Solution:** Verify `STRIPE_SECRET_KEY` is set in `.env` file.

### Issue: "Cloudinary error"
**Solution:** Verify Cloudinary credentials are set in `.env` file.

---

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Check the server logs in the terminal
3. Verify environment variables are set correctly
4. Ensure MongoDB is running and accessible


