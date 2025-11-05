// src/app/api/deliveries/route.ts

import { NextResponse, type NextRequest } from 'next/server';
import { getAvailableDeliveries } from '@/lib/deliveries-data';
import { getSession } from '@/lib/session';

// GET handler to fetch all available delivery tasks
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    // In a real app, you'd want to ensure only authenticated users with the 'transport_partner' role can see these.
    if (!session.user || !session.user.roles.includes('transport_partner')) {
       return NextResponse.json({ message: "Unauthorized." }, { status: 403 });
    }
    
    const deliveries = await getAvailableDeliveries();
    return NextResponse.json(deliveries);
    
  } catch (error: any) {
    console.error("[API /api/deliveries GET] Error:", error);
    return NextResponse.json({ message: `Failed to fetch deliveries: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
