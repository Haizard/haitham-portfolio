
import { NextResponse, type NextRequest } from 'next/server';
import { getVendorFinanceSummary, getPayoutsForVendor, createPayoutRequest } from '@/lib/payouts-data';
import { z } from 'zod';

// This would come from an authenticated session
const MOCK_VENDOR_ID = "freelancer123";

const createPayoutSchema = z.object({
  amount: z.coerce.number().positive("Amount must be a positive number."),
});

// GET handler for fetching vendor's financial summary and payout history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId') || MOCK_VENDOR_ID;

    if (!vendorId) {
      return NextResponse.json({ message: "Vendor ID is required." }, { status: 400 });
    }

    const [summary, history] = await Promise.all([
      getVendorFinanceSummary(vendorId),
      getPayoutsForVendor(vendorId)
    ]);

    return NextResponse.json({ summary, history });
  } catch (error: any) {
    console.error("[API /api/payouts GET] Error:", error);
    return NextResponse.json({ message: `Failed to fetch financial data: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}

// POST handler for a vendor to request a new payout
export async function POST(request: NextRequest) {
  try {
    const vendorId = MOCK_VENDOR_ID; // In real app, get from session
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
