
import { NextResponse, type NextRequest } from 'next/server';
import { getVendorFinanceSummary, getPayoutsForVendor, createPayoutRequest, getAllPayouts } from '@/lib/payouts-data';
import { getFreelancerProfile } from '@/lib/user-profile-data';
import { z } from 'zod';
import { getSession } from '@/lib/session';

const createPayoutSchema = z.object({
  amount: z.coerce.number().positive("Amount must be a positive number."),
});

// GET handler for fetching vendor's financial summary and payout history OR all payouts for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    // If a specific vendor ID is provided, return their financial summary and history.
    if (vendorId) {
      // This is the flow for the vendor's own finance page.
      const [summary, history] = await Promise.all([
        getVendorFinanceSummary(vendorId),
        getPayoutsForVendor(vendorId)
      ]);
      return NextResponse.json({ summary, history });
    }

    // If no vendor ID is provided, assume it's an admin request to fetch all payouts.
    // TODO: Add admin role check here in a real app.
    const allPayouts = await getAllPayouts();
    
    // Enrich payouts with vendor names for the admin view
    const vendorUserIds = [...new Set(allPayouts.map(p => p.vendorId))];
    const vendorProfiles = await Promise.all(vendorUserIds.map(id => getFreelancerProfile(id)));
    const vendorMap = new Map(vendorProfiles.map(p => p ? [p.userId, p.name] : [null, null]));

    const enrichedPayouts = allPayouts.map(p => ({
      ...p,
      vendorName: vendorMap.get(p.vendorId) || 'Unknown Vendor',
    }));

    return NextResponse.json(enrichedPayouts);

  } catch (error: any) {
    console.error("[API /api/payouts GET] Error:", error);
    return NextResponse.json({ message: `Failed to fetch financial data: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}

// POST handler for a vendor to request a new payout
export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session.user || !session.user.id) {
        return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
  try {
    const vendorId = session.user.id;
    const body = await request.json();
    const validation = createPayoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid payout request data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { amount } = validation.data;
    const newPayout = await createPayoutRequest(vendorId, amount);

    return NextResponse.json(newPayout, { status: 201 });
  } catch (error: any) {
    console.error("[API /api/payouts POST] Error:", error);
    return NextResponse.json({ message: error.message || "Failed to create payout request." }, { status: 400 }); // Use 400 for business logic errors
  }
}
