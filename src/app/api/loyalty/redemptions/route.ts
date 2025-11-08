import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { redeemReward, getUserRedemptions } from '@/lib/loyalty-data';

/**
 * GET /api/loyalty/redemptions
 * Get user's reward redemptions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;

    const redemptions = await getUserRedemptions(session.user.id, {
      status,
    });

    return NextResponse.json(redemptions);
  } catch (error) {
    console.error('Error fetching redemptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch redemptions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/loyalty/redemptions
 * Redeem a reward
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { rewardId } = body;

    if (!rewardId) {
      return NextResponse.json(
        { error: 'Reward ID is required' },
        { status: 400 }
      );
    }

    const redemption = await redeemReward(session.user.id, rewardId);

    return NextResponse.json(redemption, { status: 201 });
  } catch (error: any) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to redeem reward' },
      { status: 400 }
    );
  }
}

