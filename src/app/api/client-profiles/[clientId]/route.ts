
// src/app/api/client-profiles/[clientId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getClientProfile } from '@/lib/client-profile-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { clientId } = params;
    if (!clientId) {
      return NextResponse.json({ message: "Client ID is required." }, { status: 400 });
    }
    
    // In a real app, you might want to fetch a "public" version of the profile
    const profile = await getClientProfile(clientId);

    if (!profile) {
      return NextResponse.json({ message: "Client profile not found." }, { status: 404 });
    }

    return NextResponse.json(profile);

  } catch (error: any) {
    console.error(`[API /api/client-profiles/${params.clientId} GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch client profile: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
