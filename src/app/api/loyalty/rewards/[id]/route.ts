import { NextRequest, NextResponse } from 'next/server';
import { getRewardById } from '@/lib/loyalty-data';

/**
 * GET /api/loyalty/rewards/[id]
 * Get reward details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reward = await getRewardById(id);

    if (!reward) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(reward);
  } catch (error) {
    console.error('Error fetching reward:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reward' },
      { status: 500 }
    );
  }
}

