
import { NextResponse, type NextRequest } from 'next/server';
import { updateLineItemStatus, type LineItemStatus } from '@/lib/orders-data';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string; itemId: string } }
) {
  // TODO: Add authorization to ensure the user is the vendor for this line item.
  try {
    const { orderId, itemId } = params;
    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid status update data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { status } = validation.data;
    
    const success = await updateLineItemStatus(orderId, itemId, status);

    if (success) {
      return NextResponse.json({ message: "Line item status updated successfully." });
    } else {
      return NextResponse.json({ message: "Order or line item not found, or update failed." }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`[API /api/orders/.../status PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to update status: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
