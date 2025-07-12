
import { NextResponse, type NextRequest } from 'next/server';
import { getAllVendorProfiles } from '@/lib/user-profile-data';

// GET handler to fetch all vendor profiles for the admin panel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isFeatured = searchParams.get('featured') === 'true';

    // TODO: Add robust authentication and role checks to ensure only admins can access this.
    const vendors = await getAllVendorProfiles({ isFeatured });
    return NextResponse.json(vendors);
  } catch (error: any) {
    console.error("[API /api/vendors GET] Error:", error);
    return NextResponse.json({ message: `Failed to fetch vendors: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
