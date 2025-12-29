
import { NextResponse, type NextRequest } from 'next/server';
import { getOrdersByVendorId, getAllOrders as getAllOrdersAdmin } from '@/lib/orders-data';
import { getFreelancerProfile } from '@/lib/user-profile-data';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendorId');

    const isAdmin = session.user.roles.includes('admin');

    // If a vendorId is provided, fetch orders specifically for that vendor
    if (vendorId) {
      // Security: Only allow finding own orders unless admin
      if (!isAdmin && vendorId !== session.user.id) {
        return NextResponse.json({ message: "Unauthorized: You can only view your own orders" }, { status: 403 });
      }
      const orders = await getOrdersByVendorId(vendorId);
      return NextResponse.json(orders);
    }

    // If no vendorId is provided, it's an admin request to fetch all orders
    if (!isAdmin) {
      return NextResponse.json({ message: "Unauthorized: Admin access required for all orders" }, { status: 403 });
    }

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
