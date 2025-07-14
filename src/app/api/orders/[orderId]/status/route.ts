// src/app/api/orders/[orderId]/status/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { updateOrderStatus, type OrderStatus } from '@/lib/orders-data';
import { z } from 'zod';
import { getSession } from '@/lib/session';

const statusUpdateSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getSession();
    // TODO: Add role check to ensure only the restaurant owner or admin can update status.
    if (!session.user) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { orderId } = params;
    const body = await request.json();
    const validation = statusUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid status update data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { status } = validation.data;
    const updatedOrder = await updateOrderStatus(orderId, status);

    if (!updatedOrder) {
      return NextResponse.json({ message: "Order not found or update failed." }, { status: 404 });
    }

    // In a real app, you might trigger a notification to the customer here.

    return NextResponse.json({ message: "Order status updated successfully.", order: updatedOrder });
  } catch (error: any) {
    console.error(`[API /orders/${params.orderId}/status PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to update order status: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
