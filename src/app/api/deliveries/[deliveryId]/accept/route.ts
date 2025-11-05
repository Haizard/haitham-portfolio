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

    if (!session.user) {
        return NextResponse.json({ message: "Unauthorized. You must be logged in." }, { status: 401 });
    }
    
    // Corrected the role check here
    if (!session.user.roles.includes('transport_partner')) {
        return NextResponse.json({ message: "Forbidden. You are not a transport partner." }, { status: 403 });
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

    // Security check: ensure the logged-in user is the one accepting the job.
    if (session.user.id !== agentId) {
        return NextResponse.json({ message: "Forbidden. You cannot accept a job for another user." }, { status: 403 });
    }
    
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
