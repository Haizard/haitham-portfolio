import { NextResponse, type NextRequest } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe';
import Stripe from 'stripe';
import {
  getLoyaltyAccount,
  createLoyaltyAccount,
  addPointsTransaction,
  POINTS_EARNING_RULES,
  TIER_BENEFITS,
} from '@/lib/loyalty-data';
import { getHotelBookingById, updateHotelBooking } from '@/lib/hotels-data';
import { getCarRentalById, updateCarRental } from '@/lib/cars-data';
import { getTourBookingById, updateTourBooking } from '@/lib/tours-data';
import { getTransferBookingById, updateTransferBooking } from '@/lib/transfers-data';

// Disable body parsing for webhook routes
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ 
        message: "Missing stripe-signature header" 
      }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[WEBHOOK] STRIPE_WEBHOOK_SECRET not configured');
      return NextResponse.json({ 
        message: "Webhook secret not configured" 
      }, { status: 500 });
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature, webhookSecret);

    if (!event) {
      return NextResponse.json({ 
        message: "Invalid signature" 
      }, { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      case 'customer.created':
        await handleCustomerCreated(event.data.object as Stripe.Customer);
        break;

      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error("[API /payment/webhook POST] Error:", error);
    return NextResponse.json({ 
      message: `Webhook error: ${error.message || "Unknown error"}` 
    }, { status: 500 });
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('[WEBHOOK] Payment succeeded:', paymentIntent.id);

  const metadata = paymentIntent.metadata;
  const userId = metadata.userId;

  if (!userId) {
    console.error('[WEBHOOK] No userId in payment metadata');
    return;
  }

  try {
    // Determine booking type from metadata
    let bookingType: 'property' | 'vehicle' | 'tour' | 'transfer' | null = null;
    let bookingId: string | null = null;
    let totalAmount = paymentIntent.amount / 100; // Convert from cents
    let booking: any = null;

    // Try to identify booking type from metadata
    if (metadata.propertyId || metadata.roomId) {
      bookingType = 'property';
      // Find hotel booking by payment intent ID
      const hotelBooking = await findHotelBookingByPaymentIntent(paymentIntent.id);
      if (hotelBooking) {
        bookingId = hotelBooking.id!;
        booking = hotelBooking;
        totalAmount = hotelBooking.pricing.totalPrice;

        // Update booking status
        await updateHotelBooking(bookingId, {
          status: 'confirmed',
          'paymentInfo.paymentStatus': 'completed',
        });
      }
    } else if (metadata.vehicleId && metadata.pickupDate) {
      bookingType = 'vehicle';
      // Find car rental by payment intent ID
      const carRental = await findCarRentalByPaymentIntent(paymentIntent.id);
      if (carRental) {
        bookingId = carRental.id!;
        booking = carRental;
        totalAmount = carRental.pricing.totalPrice;

        // Update booking status
        await updateCarRental(bookingId, {
          status: 'confirmed',
          'paymentInfo.paymentStatus': 'completed',
        });
      }
    } else if (metadata.tourId) {
      bookingType = 'tour';
      // Find tour booking by payment intent ID
      const tourBooking = await findTourBookingByPaymentIntent(paymentIntent.id);
      if (tourBooking) {
        bookingId = tourBooking.id!;
        booking = tourBooking;
        totalAmount = tourBooking.pricing.total;

        // Update booking status
        await updateTourBooking(bookingId, {
          status: 'confirmed',
          'paymentInfo.paymentStatus': 'completed',
        });
      }
    } else if (metadata.transferType) {
      bookingType = 'transfer';
      // Find transfer booking by payment intent ID
      const transferBooking = await findTransferBookingByPaymentIntent(paymentIntent.id);
      if (transferBooking) {
        bookingId = transferBooking.id!;
        booking = transferBooking;
        totalAmount = transferBooking.pricing.totalPrice;

        // Update booking status
        await updateTransferBooking(bookingId, {
          status: 'confirmed',
          'paymentInfo.paymentStatus': 'completed',
        });
      }
    }

    if (!bookingType || !bookingId) {
      console.error('[WEBHOOK] Could not determine booking type or ID');
      return;
    }

    console.log(`[WEBHOOK] Booking ${bookingId} (${bookingType}) confirmed`);

    // Award loyalty points
    await awardBookingPoints(userId, bookingType, totalAmount, bookingId);

  } catch (error) {
    console.error('[WEBHOOK] Error processing payment success:', error);
  }
}

/**
 * Award loyalty points for a booking
 */
async function awardBookingPoints(
  userId: string,
  bookingType: 'property' | 'vehicle' | 'tour' | 'transfer',
  totalAmount: number,
  bookingId: string
) {
  try {
    // Get or create loyalty account
    let account = await getLoyaltyAccount(userId);
    if (!account) {
      account = await createLoyaltyAccount(userId);
    }

    // Calculate points based on booking type
    const pointsPerDollar = POINTS_EARNING_RULES[bookingType];
    const tierMultiplier = TIER_BENEFITS[account.tier].pointsMultiplier;
    const basePoints = Math.floor(totalAmount * pointsPerDollar);
    const bonusPoints = Math.floor(basePoints * (tierMultiplier - 1));
    const totalPoints = basePoints + bonusPoints;

    // Add points transaction
    await addPointsTransaction({
      userId,
      type: 'earn',
      amount: totalPoints,
      reason: `Booking ${bookingType} - $${totalAmount.toFixed(2)}`,
      relatedBookingId: bookingId,
    });

    console.log(`[WEBHOOK] Awarded ${totalPoints} points to user ${userId} (${basePoints} base + ${bonusPoints} tier bonus)`);
  } catch (error) {
    console.error('[WEBHOOK] Error awarding points:', error);
  }
}

/**
 * Helper functions to find bookings by payment intent ID
 */
async function findHotelBookingByPaymentIntent(paymentIntentId: string) {
  // Implementation would query database for booking with this payment intent
  // For now, we'll use a simplified approach
  const clientPromise = (await import('@/lib/mongodb')).default;
  const client = await clientPromise;
  const db = client.db();

  const booking = await db.collection('hotelBookings').findOne({
    'paymentInfo.paymentIntentId': paymentIntentId,
  });

  if (!booking) return null;

  return {
    ...booking,
    id: booking._id.toString(),
  };
}

async function findCarRentalByPaymentIntent(paymentIntentId: string) {
  const clientPromise = (await import('@/lib/mongodb')).default;
  const client = await clientPromise;
  const db = client.db();

  const rental = await db.collection('carRentals').findOne({
    'paymentInfo.paymentIntentId': paymentIntentId,
  });

  if (!rental) return null;

  return {
    ...rental,
    id: rental._id.toString(),
  };
}

async function findTourBookingByPaymentIntent(paymentIntentId: string) {
  const clientPromise = (await import('@/lib/mongodb')).default;
  const client = await clientPromise;
  const db = client.db();

  const booking = await db.collection('tourBookings').findOne({
    'paymentInfo.stripePaymentIntentId': paymentIntentId,
  });

  if (!booking) return null;

  return {
    ...booking,
    id: booking._id.toString(),
  };
}

async function findTransferBookingByPaymentIntent(paymentIntentId: string) {
  const clientPromise = (await import('@/lib/mongodb')).default;
  const client = await clientPromise;
  const db = client.db();

  const booking = await db.collection('transferBookings').findOne({
    'paymentInfo.paymentIntentId': paymentIntentId,
  });

  if (!booking) return null;

  return {
    ...booking,
    id: booking._id.toString(),
  };
}

/**
 * Handle failed payment
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('[WEBHOOK] Payment failed:', paymentIntent.id);
  
  const metadata = paymentIntent.metadata;
  const bookingId = metadata.bookingId;

  // TODO: Update booking status in database
  // Example:
  // await updateBookingStatus(bookingId, 'payment_failed');
  // await sendPaymentFailedEmail(metadata.userEmail, ...);

  console.log(`[WEBHOOK] Booking ${bookingId} payment failed`);
}

/**
 * Handle refund
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  console.log('[WEBHOOK] Charge refunded:', charge.id);
  
  // TODO: Update booking status in database
  // Example:
  // const paymentIntentId = charge.payment_intent;
  // await updateBookingStatus(bookingId, 'refunded');
  // await sendRefundConfirmationEmail(...);

  console.log(`[WEBHOOK] Charge ${charge.id} refunded`);
}

/**
 * Handle customer creation
 */
async function handleCustomerCreated(customer: Stripe.Customer) {
  console.log('[WEBHOOK] Customer created:', customer.id);
  
  // TODO: Store Stripe customer ID in user profile
  // Example:
  // const userId = customer.metadata.userId;
  // await updateUserStripeCustomerId(userId, customer.id);

  console.log(`[WEBHOOK] Customer ${customer.id} created`);
}

