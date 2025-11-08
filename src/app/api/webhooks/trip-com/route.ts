/**
 * Trip.com Webhook Handler
 * 
 * This endpoint receives booking confirmation webhooks from Trip.com
 * and updates the flight referral status accordingly.
 * 
 * Webhook Events:
 * - booking.confirmed: When a user completes a booking
 * - booking.cancelled: When a booking is cancelled
 * - booking.refunded: When a booking is refunded
 * 
 * Security:
 * - Verify webhook signature using TRIP_COM_WEBHOOK_SECRET
 * - Validate payload structure
 * - Idempotency handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { updateFlightReferral, getFlightReferralById } from '@/lib/flights-data';
import crypto from 'crypto';
import {
  getLoyaltyAccount,
  createLoyaltyAccount,
  addPointsTransaction,
  POINTS_EARNING_RULES,
  TIER_BENEFITS,
} from '@/lib/loyalty-data';

// Webhook payload schema
const webhookPayloadSchema = z.object({
  event: z.enum(['booking.confirmed', 'booking.cancelled', 'booking.refunded']),
  timestamp: z.string(),
  data: z.object({
    bookingId: z.string(),
    referralId: z.string(),
    bookingReference: z.string(),
    status: z.enum(['confirmed', 'cancelled', 'refunded']),
    totalAmount: z.number(),
    currency: z.string(),
    passengerCount: z.number(),
    flightDetails: z.object({
      origin: z.string(),
      destination: z.string(),
      departureDate: z.string(),
      returnDate: z.string().optional(),
      airline: z.string(),
    }),
    bookedAt: z.string(),
  }),
});

type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

/**
 * Verify webhook signature
 */
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Process booking confirmation
 */
async function processBookingConfirmation(data: WebhookPayload['data']) {
  try {
    // Get the referral
    const referral = await getFlightReferralById(data.referralId);

    if (!referral) {
      throw new Error(`Referral not found: ${data.referralId}`);
    }

    // Check if already processed (idempotency)
    if (referral.bookingConfirmed && referral.bookingReference === data.bookingReference) {
      console.log(`Booking already processed: ${data.bookingReference}`);
      return { alreadyProcessed: true };
    }

    // Calculate commission (3% default)
    const commissionRate = referral.commissionRate || 0.03;
    const commissionAmount = data.totalAmount * commissionRate;

    // Update referral
    await updateFlightReferral(data.referralId, {
      bookingConfirmed: true,
      confirmedAt: new Date().toISOString(),
      bookingReference: data.bookingReference,
      commissionAmount,
      bookingStatus: 'confirmed',
    });

    console.log(`Booking confirmed: ${data.bookingReference}, Commission: ${commissionAmount} ${data.currency}`);

    // Award loyalty points for flight booking
    await awardFlightPoints(referral.userId, data.totalAmount, data.referralId);

    return {
      success: true,
      referralId: data.referralId,
      commissionAmount,
      currency: data.currency,
    };
  } catch (error: any) {
    console.error('Error processing booking confirmation:', error);
    throw error;
  }
}

/**
 * Award loyalty points for flight booking
 */
async function awardFlightPoints(
  userId: string,
  totalAmount: number,
  referralId: string
) {
  try {
    // Get or create loyalty account
    let account = await getLoyaltyAccount(userId);
    if (!account) {
      account = await createLoyaltyAccount(userId);
    }

    // Calculate points for flight booking
    const pointsPerDollar = POINTS_EARNING_RULES.flight;
    const tierMultiplier = TIER_BENEFITS[account.tier].pointsMultiplier;
    const basePoints = Math.floor(totalAmount * pointsPerDollar);
    const bonusPoints = Math.floor(basePoints * (tierMultiplier - 1));
    const totalPoints = basePoints + bonusPoints;

    // Add points transaction
    await addPointsTransaction({
      userId,
      type: 'earn',
      amount: totalPoints,
      reason: `Flight booking - $${totalAmount.toFixed(2)}`,
      relatedBookingId: referralId,
    });

    console.log(`[TRIP.COM WEBHOOK] Awarded ${totalPoints} points to user ${userId} (${basePoints} base + ${bonusPoints} tier bonus)`);
  } catch (error) {
    console.error('[TRIP.COM WEBHOOK] Error awarding points:', error);
  }
}

/**
 * Process booking cancellation
 */
async function processBookingCancellation(data: WebhookPayload['data']) {
  try {
    // Get the referral
    const referral = await getFlightReferralById(data.referralId);

    if (!referral) {
      throw new Error(`Referral not found: ${data.referralId}`);
    }

    // Update referral
    await updateFlightReferral(data.referralId, {
      bookingConfirmed: false,
      bookingStatus: 'cancelled',
      commissionAmount: 0,
      commissionPaid: false,
    });

    console.log(`Booking cancelled: ${data.bookingReference}`);

    return {
      success: true,
      referralId: data.referralId,
      status: 'cancelled',
    };
  } catch (error: any) {
    console.error('Error processing booking cancellation:', error);
    throw error;
  }
}

/**
 * Process booking refund
 */
async function processBookingRefund(data: WebhookPayload['data']) {
  try {
    // Get the referral
    const referral = await getFlightReferralById(data.referralId);

    if (!referral) {
      throw new Error(`Referral not found: ${data.referralId}`);
    }

    // Update referral
    await updateFlightReferral(data.referralId, {
      bookingStatus: 'refunded',
      commissionAmount: 0,
      commissionPaid: false,
    });

    console.log(`Booking refunded: ${data.bookingReference}`);

    return {
      success: true,
      referralId: data.referralId,
      status: 'refunded',
    };
  } catch (error: any) {
    console.error('Error processing booking refund:', error);
    throw error;
  }
}

// POST /api/webhooks/trip-com
export async function POST(request: NextRequest) {
  try {
    // Get webhook secret from environment
    const webhookSecret = process.env.TRIP_COM_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('TRIP_COM_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { success: false, message: 'Webhook not configured' },
        { status: 500 }
      );
    }

    // Get signature from headers
    const signature = request.headers.get('x-trip-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, message: 'Missing signature' },
        { status: 401 }
      );
    }

    // Get raw body
    const rawBody = await request.text();

    // Verify signature
    if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse and validate payload
    const payload = JSON.parse(rawBody);
    const validation = webhookPayloadSchema.safeParse(payload);

    if (!validation.success) {
      console.error('Invalid webhook payload:', validation.error);
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid payload',
          errors: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const webhookData = validation.data;

    // Process webhook based on event type
    let result;

    switch (webhookData.event) {
      case 'booking.confirmed':
        result = await processBookingConfirmation(webhookData.data);
        break;

      case 'booking.cancelled':
        result = await processBookingCancellation(webhookData.data);
        break;

      case 'booking.refunded':
        result = await processBookingRefund(webhookData.data);
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Unknown event type' },
          { status: 400 }
        );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      event: webhookData.event,
      result,
    });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to process webhook',
      },
      { status: 500 }
    );
  }
}

// GET /api/webhooks/trip-com - Health check
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Trip.com webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}

