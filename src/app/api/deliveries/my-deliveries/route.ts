// src/app/api/deliveries/my-deliveries/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getDeliveriesByAgentId } from '@/lib/deliveries-data';
import { getSession } from '@/lib/session';

// GET handler to fetch all deliveries for the currently logged-in agent
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session.user || !session.user.id || !session.user.roles.includes('transport_partner')) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 403 });
    }
    
    const deliveries = await getDeliveriesByAgentId(session.user.id);
    return NextResponse.json(deliveries);
    
  } catch (error: any) {
    console.error("[API /api/deliveries/my-deliveries GET] Error:", error);
    return NextResponse.json({ message: `Failed to fetch your deliveries: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
