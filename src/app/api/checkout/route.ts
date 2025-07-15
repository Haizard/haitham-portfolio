

import { NextResponse, type NextRequest } from 'next/server';
import { createOrderFromCart, updateOrderStatus } from '@/lib/orders-data';
import { initiateMnoCheckout } from '@/lib/azampay';
import { z } from 'zod';

const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  description: z.string().optional(),
});

const checkoutRequestSchema = z.object({
  customerDetails: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    address: z.string().min(1),
  }),
  phoneNumber: z.string().regex(/^[0-9]{9,12}$/, "Invalid phone number format."),
  cart: z.array(cartItemSchema).min(1, "Cart cannot be empty."),
  orderType: z.enum(['delivery', 'pickup']).optional().nullable(),
  fulfillmentTime: z.string().datetime().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = checkoutRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid checkout data.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { customerDetails, phoneNumber, cart, orderType, fulfillmentTime } = validation.data;
    
    // Step 1: Create the orders with a 'pending_payment' status.
    const createdOrders = await createOrderFromCart(
        customerDetails, 
        cart,
        orderType || 'delivery',
        fulfillmentTime ? new Date(fulfillmentTime) : new Date(),
        true // Pass true for isPendingPayment
    );

    if (createdOrders.length === 0) {
        return NextResponse.json({ message: "Could not create an order from the cart." }, { status: 400 });
    }

    // Step 2: Calculate total amount across all split orders.
    const totalAmount = createdOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Step 3: Use the ID of the *first* created order as the reference for the payment.
    // The callback will need to handle potentially multiple orders associated with this one payment reference.
    const paymentReferenceId = createdOrders.map(o => o.id).join(',');

    // Step 4: Initiate payment with AzamPay.
    const paymentResponse = await initiateMnoCheckout(
        totalAmount,
        phoneNumber,
        paymentReferenceId, // Send the comma-separated list of order IDs
        'Mpesa' // This could be made dynamic
    );
    
    if (paymentResponse.success) {
        return NextResponse.json({ 
            message: paymentResponse.message, 
            transactionId: paymentResponse.transactionId 
        });
    } else {
        // If payment initiation fails, we should ideally clean up the pending orders.
        // For now, we'll just return the error.
        await Promise.all(createdOrders.map(order => updateOrderStatus(order.id!, 'Cancelled')));
        return NextResponse.json({ message: paymentResponse.message || "Payment initiation failed." }, { status: 400 });
    }

  } catch (error: any) {
    console.error("[API /api/checkout POST] Error:", error);
    return NextResponse.json({ message: `Failed to process checkout: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
