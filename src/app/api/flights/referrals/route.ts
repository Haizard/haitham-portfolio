// src/app/api/flights/referrals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import {
  getFlightReferralsByUserId,
  getFlightReferralStats,
} from '@/lib/flights-data';

// GET /api/flights/referrals
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'all' | 'pending' | 'confirmed' | 'paid' | null;
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get referrals
    const referrals = await getFlightReferralsByUserId(session.user.id, {
      status: status || 'all',
      limit,
    });

    // Get statistics
    const stats = await getFlightReferralStats(session.user.id);

    return NextResponse.json({
      success: true,
      referrals,
      stats,
    });
  } catch (error: any) {
    console.error('Get referrals error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Failed to get referrals',
      },
      { status: 500 }
    );
  }
}

