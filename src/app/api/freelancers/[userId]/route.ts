// src/app/api/freelancers/[userId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getFreelancerProfile } from '@/lib/user-profile-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ message: "User ID is required." }, { status: 400 });
    }

    // In a real app, you might want to fetch a "public" version of the profile
    // to avoid exposing sensitive data. For now, we fetch the full profile.
    const profile = await getFreelancerProfile(userId);

    if (!profile) {
      return NextResponse.json({ message: "Freelancer profile not found." }, { status: 404 });
    }

    return NextResponse.json(profile);

  } catch (error: any) {
    console.error(`[API /api/freelancers/${params.userId} GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch freelancer profile: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
