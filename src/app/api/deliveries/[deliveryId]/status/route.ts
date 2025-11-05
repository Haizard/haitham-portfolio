// src/app/api/deliveries/[deliveryId]/status/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { updateDeliveryStatus, type DeliveryStatus } from '@/lib/deliveries-data';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getSession } from '@/lib/session';

const statusUpdateSchema = z.object({
  status: z.enum(['in_transit', 'delivered', 'cancelled']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { deliveryId: string } }
) {
  try {
    const session = await getSession();
    if (!session.user || !session.user.id || !session.user.roles.includes('transport_partner')) {
        return NextResponse.json({ message: "Unauthorized." }, { status: 403 });
    }

    const { deliveryId } = params;
    if (!ObjectId.isValid(deliveryId)) {
      return NextResponse.json({ message: "Invalid Delivery ID." }, { status: 400 });
    }

    const body = await request.json();
    const validation = statusUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid status update data.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { status } = validation.data;
    
    // TODO: Add authorization to ensure the agent updating the delivery is the one assigned to it.
    
    const updatedDelivery = await updateDeliveryStatus(deliveryId, status);
    if (!updatedDelivery) {
      return NextResponse.json({ message: "Delivery not found or update failed." }, { status: 404 });
    }
    
    return NextResponse.json({ message: `Delivery status updated to ${status}.`, delivery: updatedDelivery });

  } catch (error: any) {
    console.error(`[API /deliveries/${params.deliveryId}/status PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to update delivery status: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
