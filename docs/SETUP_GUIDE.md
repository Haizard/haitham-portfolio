# Phase 1 Setup Guide

This guide will help you set up and test the Phase 1 implementation of the booking platform.

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB database (local or cloud)
- Stripe account (for payment testing)
- Cloudinary account (for file uploads)
- Email service account (Resend recommended)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

**New packages installed:**
- `stripe` - Stripe payment gateway
- `@stripe/stripe-js` - Stripe client SDK
- `cloudinary` - Cloudinary file upload
- `next-cloudinary` - Next.js Cloudinary components

### 2. Configure Environment Variables

Copy `.EXAMPLE.ENV` to `.env.local`:

```bash
cp .EXAMPLE.ENV .env.local
```

Edit `.env.local` and fill in the required values:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017
DB_NAME=booking_platform

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-min-32-chars

# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:9003

# WebSocket Configuration
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:3001
WEBSOCKET_PORT=3001

# Email Service (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com

# Stripe Payment Gateway
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Cloudinary File Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=xxxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxxx
```

### 3. Get API Keys

#### Resend (Email Service)
1. Sign up at https://resend.com
2. Create an API key
3. Add your domain (or use their test domain)
4. Copy the API key to `RESEND_API_KEY`

#### Stripe (Payment Gateway)
1. Sign up at https://stripe.com
2. Go to https://dashboard.stripe.com/apikeys
3. Copy the **Secret key** to `STRIPE_SECRET_KEY`
4. Copy the **Publishable key** to `STRIPE_PUBLISHABLE_KEY`
5. For webhooks:
   - Install Stripe CLI: https://stripe.com/docs/stripe-cli
   - Run: `stripe listen --forward-to localhost:9003/api/payment/webhook`
   - Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

#### Cloudinary (File Upload)
1. Sign up at https://cloudinary.com
2. Go to https://cloudinary.com/console
3. Copy **Cloud name** to `CLOUDINARY_CLOUD_NAME`
4. Copy **API Key** to `CLOUDINARY_API_KEY`
5. Copy **API Secret** to `CLOUDINARY_API_SECRET`

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:9003

---

## 🧪 Testing the Implementation

### Test 1: User Registration with New Roles

**Endpoint:** `POST /api/auth/signup`

```bash
curl -X POST http://localhost:9003/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "customer"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null,
    "roles": ["customer"],
    "emailVerified": false,
    "phoneVerified": false,
    "membershipTier": "bronze",
    "createdAt": "..."
  },
  "message": "Account created successfully! Please check your email to verify your account.",
  "requiresEmailVerification": true
}
```

**Check Console:** You should see the verification link logged to the console.

### Test 2: Email Verification

**Endpoint:** `POST /api/auth/verify-email`

```bash
curl -X POST http://localhost:9003/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_VERIFICATION_TOKEN_FROM_CONSOLE"
  }'
```

**Expected Response:**
```json
{
  "message": "Email verified successfully!",
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": true
  }
}
```

### Test 3: User Login

**Endpoint:** `POST /api/auth/login`

```bash
curl -X POST http://localhost:9003/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": null,
    "roles": ["customer"],
    "emailVerified": true,
    "phoneVerified": false,
    "membershipTier": "bronze",
    "createdAt": "..."
  },
  "requiresEmailVerification": false
}
```

### Test 4: Get User Profile

**Endpoint:** `GET /api/user/profile`

```bash
curl -X GET http://localhost:9003/api/user/profile \
  -H "Cookie: session=YOUR_SESSION_COOKIE"
```

**Expected Response:**
```json
{
  "id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "avatar": null,
  "roles": ["customer"],
  "emailVerified": true,
  "phoneVerified": false,
  "preferences": {
    "language": "en",
    "currency": "USD",
    "notifications": {
      "email": true,
      "sms": false,
      "push": true
    }
  },
  "loyaltyPoints": 0,
  "membershipTier": "bronze",
  "createdAt": "...",
  "updatedAt": "...",
  "lastLoginAt": "...",
  "isActive": true,
  "isSuspended": false
}
```

### Test 5: Update User Profile

**Endpoint:** `PATCH /api/user/profile`

```bash
curl -X PATCH http://localhost:9003/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{
    "name": "John Updated",
    "preferences": {
      "language": "es",
      "currency": "EUR"
    }
  }'
```

### Test 6: Create Payment Intent

**Endpoint:** `POST /api/payment/create-intent`

```bash
curl -X POST http://localhost:9003/api/payment/create-intent \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{
    "amount": 100.00,
    "currency": "usd",
    "bookingId": "booking_123",
    "bookingType": "hotel"
  }'
```

**Expected Response:**
```json
{
  "clientSecret": "pi_xxxxxxxxxxxxx_secret_xxxxxxxxxxxxx",
  "paymentIntentId": "pi_xxxxxxxxxxxxx"
}
```

### Test 7: File Upload (Avatar)

**Endpoint:** `POST /api/upload`

```bash
curl -X POST http://localhost:9003/api/upload \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{
    "file": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "type": "avatar"
  }'
```

**Expected Response:**
```json
{
  "message": "File uploaded successfully!",
  "url": "https://res.cloudinary.com/...",
  "publicId": "booking-platform/avatars/...",
  "width": 400,
  "height": 400,
  "format": "png"
}
```

---

## 🔍 Verify Database Changes

Connect to your MongoDB database and check the `users` collection:

```javascript
db.users.findOne({ email: "john@example.com" })
```

You should see all the new fields:
- `phone`
- `avatar`
- `emailVerified`
- `phoneVerified`
- `emailVerificationToken`
- `emailVerificationExpires`
- `preferences`
- `loyaltyPoints`
- `membershipTier`
- `updatedAt`
- `lastLoginAt`
- `isActive`
- `isSuspended`

---

## 🎨 Testing Different User Roles

Create users with different roles to test RBAC:

```bash
# Property Owner
curl -X POST http://localhost:9003/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hotel Owner",
    "email": "hotel@example.com",
    "password": "password123",
    "role": "property_owner"
  }'

# Car Owner
curl -X POST http://localhost:9003/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Car Rental Owner",
    "email": "car@example.com",
    "password": "password123",
    "role": "car_owner"
  }'

# Tour Operator
curl -X POST http://localhost:9003/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tour Guide",
    "email": "tour@example.com",
    "password": "password123",
    "role": "tour_operator"
  }'
```

---

## 🐛 Troubleshooting

### Email Verification Not Working
- Check console logs for verification links
- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for email delivery status

### Payment Intent Creation Fails
- Verify `STRIPE_SECRET_KEY` is set correctly
- Check Stripe dashboard for errors
- Ensure you're using test mode keys (starts with `sk_test_`)

### File Upload Fails
- Verify all Cloudinary credentials are set
- Check Cloudinary dashboard for upload logs
- Ensure file is base64 encoded

### Session Not Persisting
- Verify `SESSION_SECRET` is at least 32 characters
- Check browser cookies
- Clear browser cache and try again

---

## 📚 Next Steps

1. **Test all endpoints** using the examples above
2. **Create test users** with different roles
3. **Verify email templates** by checking your inbox
4. **Test payment flow** using Stripe test cards
5. **Upload test images** to verify Cloudinary integration
6. **Review implementation** in `docs/PHASE1_IMPLEMENTATION.md`
7. **Prepare for Phase 2** - Hotel Booking System

---

## 🎯 Success Criteria

✅ Users can register with new roles  
✅ Email verification works  
✅ Login tracks last login time  
✅ Profile management works  
✅ Payment intents can be created  
✅ Files can be uploaded to Cloudinary  
✅ RBAC middleware protects routes  
✅ All new fields are stored in database  

---

**Need Help?** Check the implementation details in `docs/PHASE1_IMPLEMENTATION.md`

