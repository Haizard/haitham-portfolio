import { NextResponse, type NextRequest } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe';
import Stripe from 'stripe';

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
  const bookingId = metadata.bookingId;
  const bookingType = metadata.bookingType;

  // TODO: Update booking status in database
  // Example:
  // await updateBookingStatus(bookingId, 'confirmed');
  // await sendBookingConfirmationEmail(metadata.userEmail, ...);

  console.log(`[WEBHOOK] Booking ${bookingId} (${bookingType}) confirmed`);
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

