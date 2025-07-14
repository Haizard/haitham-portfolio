
// src/app/api/users/by-role/[role]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getProfilesByRole, type FreelancerProfile } from '@/lib/user-profile-data';
import type { UserRole } from '@/lib/auth-data';

const validRoles: UserRole[] = ['admin', 'creator', 'vendor', 'freelancer', 'client', 'delivery_agent'];

export async function GET(
  request: NextRequest,
  { params }: { params: { role: string } }
) {
  try {
    const { role } = params;
    if (!role || !validRoles.includes(role as UserRole)) {
      return NextResponse.json({ message: "Invalid or missing role parameter." }, { status: 400 });
    }
    
    // TODO: Add robust admin authentication to ensure only admins can access this route.

    const profiles: FreelancerProfile[] = await getProfilesByRole(role as UserRole);

    return NextResponse.json(profiles);

  } catch (error: any) {
    console.error(`[API /api/users/by-role/${params.role} GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch users by role: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
