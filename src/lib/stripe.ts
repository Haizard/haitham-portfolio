// Stripe payment utilities
import Stripe from 'stripe';

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('[STRIPE] STRIPE_SECRET_KEY not found in environment variables. Payment features will not work.');
}

export const stripe = stripeSecretKey 
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
      typescript: true,
    })
  : null;

/**
 * Payment intent metadata for different booking types
 */
export interface PaymentMetadata {
  bookingId: string;
  bookingType: 'hotel' | 'car_rental' | 'tour' | 'transfer';
  userId: string;
  userEmail: string;
  userName: string;
}

/**
 * Create a payment intent for a booking
 */
export async function createPaymentIntent(
  amount: number, // Amount in cents (e.g., 5000 = $50.00)
  currency: string = 'usd',
  metadata: PaymentMetadata
): Promise<Stripe.PaymentIntent | null> {
  if (!stripe) {
    console.error('[STRIPE] Stripe not initialized. Cannot create payment intent.');
    return null;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        ...metadata,
        // Add timestamp for tracking
        createdAt: new Date().toISOString(),
      },
      // Enable automatic payment methods
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return paymentIntent;
  } catch (error) {
    console.error('[STRIPE] Error creating payment intent:', error);
    return null;
  }
}

/**
 * Retrieve a payment intent by ID
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
  if (!stripe) {
    console.error('[STRIPE] Stripe not initialized. Cannot retrieve payment intent.');
    return null;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('[STRIPE] Error retrieving payment intent:', error);
    return null;
  }
}

/**
 * Cancel a payment intent
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent | null> {
  if (!stripe) {
    console.error('[STRIPE] Stripe not initialized. Cannot cancel payment intent.');
    return null;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('[STRIPE] Error canceling payment intent:', error);
    return null;
  }
}

/**
 * Create a refund for a payment
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number, // Optional: partial refund amount in cents
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<Stripe.Refund | null> {
  if (!stripe) {
    console.error('[STRIPE] Stripe not initialized. Cannot create refund.');
    return null;
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason,
    });

    return refund;
  } catch (error) {
    console.error('[STRIPE] Error creating refund:', error);
    return null;
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event | null {
  if (!stripe) {
    console.error('[STRIPE] Stripe not initialized. Cannot verify webhook.');
    return null;
  }

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (error) {
    console.error('[STRIPE] Error verifying webhook signature:', error);
    return null;
  }
}

/**
 * Create a customer in Stripe
 */
export async function createStripeCustomer(
  email: string,
  name: string,
  userId: string
): Promise<Stripe.Customer | null> {
  if (!stripe) {
    console.error('[STRIPE] Stripe not initialized. Cannot create customer.');
    return null;
  }

  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId,
      },
    });

    return customer;
  } catch (error) {
    console.error('[STRIPE] Error creating customer:', error);
    return null;
  }
}

/**
 * Get a customer from Stripe
 */
export async function getStripeCustomer(customerId: string): Promise<Stripe.Customer | null> {
  if (!stripe) {
    console.error('[STRIPE] Stripe not initialized. Cannot retrieve customer.');
    return null;
  }

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      return null;
    }
    return customer as Stripe.Customer;
  } catch (error) {
    console.error('[STRIPE] Error retrieving customer:', error);
    return null;
  }
}

/**
 * Update a customer in Stripe
 */
export async function updateStripeCustomer(
  customerId: string,
  updates: Stripe.CustomerUpdateParams
): Promise<Stripe.Customer | null> {
  if (!stripe) {
    console.error('[STRIPE] Stripe not initialized. Cannot update customer.');
    return null;
  }

  try {
    const customer = await stripe.customers.update(customerId, updates);
    return customer;
  } catch (error) {
    console.error('[STRIPE] Error updating customer:', error);
    return null;
  }
}

/**
 * List payment methods for a customer
 */
export async function listCustomerPaymentMethods(
  customerId: string,
  type: 'card' | 'us_bank_account' = 'card'
): Promise<Stripe.PaymentMethod[] | null> {
  if (!stripe) {
    console.error('[STRIPE] Stripe not initialized. Cannot list payment methods.');
    return null;
  }

  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type,
    });

    return paymentMethods.data;
  } catch (error) {
    console.error('[STRIPE] Error listing payment methods:', error);
    return null;
  }
}

/**
 * Calculate platform fee (commission) for a booking
 * This is a helper function to calculate the platform's commission
 */
export function calculatePlatformFee(
  bookingAmount: number,
  commissionRate: number = 0.15 // Default 15% commission
): number {
  return Math.round(bookingAmount * commissionRate);
}

/**
 * Format amount for display (convert cents to dollars)
 */
export function formatAmount(amountInCents: number, currency: string = 'USD'): string {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Convert dollars to cents for Stripe
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

