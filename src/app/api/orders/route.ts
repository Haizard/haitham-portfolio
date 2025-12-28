
import { NextResponse, type NextRequest } from 'next/server';
import { getOrdersByVendorId, getAllOrders as getAllOrdersAdmin } from '@/lib/orders-data';
import { getFreelancerProfile } from '@/lib/user-profile-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    // If a vendorId is provided, fetch orders specifically for that vendor
    if (vendorId) {
      const orders = await getOrdersByVendorId(vendorId);
      return NextResponse.json(orders);
    }

    // If no vendorId is provided, assume it's an admin request to fetch all orders
    // TODO: Add admin role check here
    const allOrders = await getAllOrdersAdmin();
    // FIX: Filter out any null or undefined vendor IDs before fetching profiles
    const vendorIds = [...new Set(allOrders.map(o => o.vendorId))].filter((id): id is string => !!id);
    const vendorProfiles = await Promise.all(vendorIds.map(id => getFreelancerProfile(id)));
    const vendorMap = new Map(vendorProfiles.map(p => p ? [p.userId, p.name] : [null, null]));

    const enrichedOrders = allOrders.map(order => ({
      ...order,
      vendorName: vendorMap.get(order.vendorId) || 'Unknown Vendor'
    }));

    return NextResponse.json(enrichedOrders);

  } catch (error: any) {
    console.error("[API /api/orders GET] Error:", error);
    return NextResponse.json({ message: `Failed to fetch orders: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
