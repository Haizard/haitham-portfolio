import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import { getRewards, createReward } from '@/lib/loyalty-data';

/**
 * GET /api/loyalty/rewards
 * Get available rewards
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicableTo = searchParams.get('applicableTo') || undefined;

    const rewards = await getRewards({
      isActive: true,
      applicableTo,
    });

    return NextResponse.json(rewards);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/loyalty/rewards
 * Create a new reward (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

    if (!session.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const reward = await createReward(body);

    return NextResponse.json(reward, { status: 201 });
  } catch (error) {
    console.error('Error creating reward:', error);
    return NextResponse.json(
      { error: 'Failed to create reward' },
      { status: 500 }
    );
  }
}

