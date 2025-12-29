import { NextResponse, type NextRequest } from 'next/server';
import { updateOrderStatus, getOrderById, type OrderStatus } from '@/lib/orders-data';
import { z } from 'zod';
import { getSession } from '@/lib/session';

const statusUpdateSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { orderId } = await params;

    // Fetch order to check ownership
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const isOwner = order.vendorId === session.user.id;
    const isAdmin = session.user.roles.includes('admin');

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: "Unauthorized: Only the vendor or admin can update status" }, { status: 403 });
    }

    const body = await request.json();
    const validation = statusUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid status update data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { status } = validation.data;
    const updatedOrder = await updateOrderStatus(orderId, status as OrderStatus);

    if (!updatedOrder) {
      return NextResponse.json({ message: "Order not found or update failed." }, { status: 404 });
    }

    return NextResponse.json({ message: "Order status updated successfully.", order: updatedOrder });
  } catch (error: any) {
    console.error(`[API /orders/status PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to update order status: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
