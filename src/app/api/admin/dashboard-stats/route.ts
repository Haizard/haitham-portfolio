
import { NextResponse, type NextRequest } from 'next/server';
import { getAdminDashboardStats } from '@/lib/orders-data';
import { countProducts, getTopSellingProducts } from '@/lib/products-data';

// This would come from an authenticated session to verify admin role
// For now, it's an open endpoint for demonstration.
// TODO: Add admin authentication middleware

export async function GET(request: NextRequest) {
  try {
    const [stats, productCount, topProducts] = await Promise.all([
      getAdminDashboardStats(),
      countProducts(),
      getTopSellingProducts(5)
    ]);

    const combinedStats = {
      ...stats,
      totalProducts: productCount,
      topSellingProducts: topProducts,
    };
    
    return NextResponse.json(combinedStats);
  } catch (error: any) {
    console.error("[API /api/admin/dashboard-stats GET] Error:", error);
    return NextResponse.json({ message: `Failed to fetch dashboard stats: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
