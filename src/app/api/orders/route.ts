
import { NextResponse, type NextRequest } from 'next/server';
import { getOrdersByVendorId } from '@/lib/orders-data';

// This would come from an authenticated session
const MOCK_VENDOR_ID = "freelancer123";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      // In a real app, you would get this from the session/token
      // For now, we'll use the mock ID if none is provided.
      // return NextResponse.json({ message: "Vendor ID is required to fetch orders." }, { status: 400 });
    }
    
    // Using the passed vendorId or falling back to the mock one
    const targetVendorId = vendorId || MOCK_VENDOR_ID;

    const orders = await getOrdersByVendorId(targetVendorId);
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error("[API /api/orders GET] Error:", error);
    return NextResponse.json({ message: `Failed to fetch orders: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
