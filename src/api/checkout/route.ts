
import { NextResponse, type NextRequest } from 'next/server';
import { createOrderFromCart } from '@/lib/orders-data';
import { z } from 'zod';

const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  description: z.string().optional(), // Include description for customizations
});

const checkoutRequestSchema = z.object({
  customerDetails: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    address: z.string().min(1),
  }),
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

    const { customerDetails, cart, orderType, fulfillmentTime } = validation.data;

    // This simulates payment processing. In a real app, you would integrate
    // with Stripe, PayPal, etc., here and only proceed upon successful payment.

    const createdOrders = await createOrderFromCart(
        customerDetails, 
        cart,
        orderType || 'delivery',
        fulfillmentTime ? new Date(fulfillmentTime) : new Date()
    );
    
    // In a real app, you might email the customer their order confirmation here.

    return NextResponse.json({ 
        message: "Order placed successfully!", 
        orders: createdOrders.map(o => o.id) // Return the IDs of the created orders
    }, { status: 201 });

  } catch (error: any) {
    console.error("[API /api/checkout POST] Error:", error);
    return NextResponse.json({ message: `Failed to process checkout: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
