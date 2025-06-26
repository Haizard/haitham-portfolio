
// src/app/api/vendors/[vendorId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getFreelancerProfile } from '@/lib/user-profile-data';
import { getAllProducts } from '@/lib/products-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    const { vendorId } = params;
    if (!vendorId) {
      return NextResponse.json({ message: "Vendor ID is required." }, { status: 400 });
    }
    
    const [profile, products] = await Promise.all([
      getFreelancerProfile(vendorId),
      getAllProducts(undefined, undefined, vendorId)
    ]);

    if (!profile) {
      return NextResponse.json({ message: "Vendor profile not found." }, { status: 404 });
    }

    return NextResponse.json({ profile, products });

  } catch (error: any) {
    console.error(`[API /api/vendors/${params.vendorId} GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch vendor data: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
