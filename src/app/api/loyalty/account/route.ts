import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
import {
  getLoyaltyAccount,
  createLoyaltyAccount,
} from '@/lib/loyalty-data';

/**
 * GET /api/loyalty/account
 * Get user's loyalty account
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

    let account = await getLoyaltyAccount(session.user.id);

    // Create account if it doesn't exist
    if (!account) {
      account = await createLoyaltyAccount(session.user.id);
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching loyalty account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch loyalty account' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/loyalty/account
 * Create loyalty account (with optional referral code)
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

    // Check if account already exists
    const existingAccount = await getLoyaltyAccount(session.user.id);
    if (existingAccount) {
      return NextResponse.json(
        { error: 'Loyalty account already exists' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { referralCode } = body;

    let referredBy: string | undefined;

    // If referral code provided, find the referrer
    if (referralCode) {
      // TODO: Implement referral code lookup
      // For now, we'll skip this validation
    }

    const account = await createLoyaltyAccount(session.user.id, referredBy);

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Error creating loyalty account:', error);
    return NextResponse.json(
      { error: 'Failed to create loyalty account' },
      { status: 500 }
    );
  }
}

