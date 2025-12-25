
import { NextResponse, type NextRequest } from 'next/server';
import { getProfilesByRole } from '@/lib/user-profile-data';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;

        // Fetch profiles with 'freelancer' role
        const freelancers = await getProfilesByRole('freelancer');

        // Sort by rating or newest for the feed
        const sorted = freelancers
            .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
            .slice(0, limit);

        return NextResponse.json(sorted);
    } catch (error: any) {
        console.error("[API /api/freelancers GET] Error:", error);
        return NextResponse.json({ message: `Failed to fetch freelancers: ${error.message || "Unknown error"}` }, { status: 500 });
    }
}
