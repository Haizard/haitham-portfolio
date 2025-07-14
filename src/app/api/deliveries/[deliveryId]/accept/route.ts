
// src/app/api/deliveries/[deliveryId]/accept/route.ts

import { NextResponse, type NextRequest } from 'next/server';
import { acceptDelivery } from '@/lib/deliveries-data';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getSession } from '@/lib/session';

const acceptSchema = z.object({
  agentId: z.string(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { deliveryId: string } }
) {
  try {
    const session = await getSession();
    const { deliveryId } = params;

    // TODO: Add proper authorization checks
    if (!session.user || !session.user.roles.includes('delivery_agent')) {
        // For now, let's just check if there's a user.
        // A better check would be if session.user.id matches agentId from body
        if (!session.user) {
           return NextResponse.json({ message: "Unauthorized. You must be logged in." }, { status: 401 });
        }
    }
    
    if (!ObjectId.isValid(deliveryId)) {
      return NextResponse.json({ message: "Invalid Delivery ID." }, { status: 400 });
    }

    const body = await request.json();
    const validation = acceptSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid request body.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { agentId } = validation.data;
    
    const updatedDelivery = await acceptDelivery(deliveryId, agentId);
    if (!updatedDelivery) {
      return NextResponse.json({ message: "Delivery not found, already accepted, or update failed." }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Delivery accepted successfully.", delivery: updatedDelivery });

  } catch (error: any) {
    console.error(`[API /deliveries/${params.deliveryId}/accept PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to accept delivery: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
