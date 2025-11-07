
// src/app/api/vendors/[vendorId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getFreelancerProfile } from '@/lib/user-profile-data';
import { getAllProducts } from '@/lib/products-data';
import { getVendorFinanceSummary } from '@/lib/payouts-data';
import { getOrdersByVendorId } from '@/lib/orders-data';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    // In Next.js 15, params must be awaited before accessing its properties
    const { vendorId } = await params;
    if (!vendorId) {
      return NextResponse.json({ message: "Vendor ID is required." }, { status: 400 });
    }
    
    // Fetch all data concurrently for efficiency
    const [profile, products, financeSummary, orders] = await Promise.all([
      getFreelancerProfile(vendorId),
      getAllProducts(undefined, undefined, vendorId),
      getVendorFinanceSummary(vendorId),
      getOrdersByVendorId(vendorId)
    ]);

    if (!profile) {
      return NextResponse.json({ message: "Vendor profile not found." }, { status: 404 });
    }

    // Return a composite object with all the necessary data
    return NextResponse.json({ profile, products, financeSummary, orders });

  } catch (error: any) {
    console.error(`[API /api/vendors/[vendorId] GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch vendor data: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
