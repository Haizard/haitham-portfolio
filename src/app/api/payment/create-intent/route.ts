import { NextResponse, type NextRequest } from 'next/server';
import { createPaymentIntent, dollarsToCents } from '@/lib/stripe';
import { requireAuth } from '@/lib/rbac';
import { z } from 'zod';

const createPaymentIntentSchema = z.object({
  amount: z.number().positive("Amount must be positive."),
  currency: z.string().default('usd'),
  bookingId: z.string().min(1, "Booking ID is required."),
  bookingType: z.enum(['hotel', 'car_rental', 'tour', 'transfer']),
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { user } = authResult;

    const body = await request.json();
    const validation = createPaymentIntentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        message: "Invalid payment data", 
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { amount, currency, bookingId, bookingType } = validation.data;

    // Convert amount to cents
    const amountInCents = dollarsToCents(amount);

    // Create payment intent
    const paymentIntent = await createPaymentIntent(
      amountInCents,
      currency,
      {
        bookingId,
        bookingType,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
      }
    );

    if (!paymentIntent) {
      return NextResponse.json({ 
        message: "Failed to create payment intent. Please check your Stripe configuration." 
      }, { status: 500 });
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });

  } catch (error: any) {
    console.error("[API /payment/create-intent POST] Error:", error);
    return NextResponse.json({ 
      message: `Payment intent creation failed: ${error.message || "Unknown error"}` 
    }, { status: 500 });
  }
}

