/**
 * Birthday Bonus Cron Job
 * 
 * This endpoint should be called daily (e.g., via Vercel Cron or external scheduler)
 * to award birthday bonuses to users whose birthday is today.
 * 
 * Schedule: Daily at 00:00 UTC
 * 
 * Vercel Cron Configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/birthday-bonus",
 *     "schedule": "0 0 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getLoyaltyAccount,
  createLoyaltyAccount,
  addPointsTransaction,
  POINTS_EARNING_RULES,
} from '@/lib/loyalty-data';

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('[CRON] CRON_SECRET not configured');
    return true; // Allow in development
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting birthday bonus job...');

    const clientPromise = (await import('@/lib/mongodb')).default;
    const client = await clientPromise;
    const db = client.db();

    // Get today's date (month and day only)
    const today = new Date();
    const todayMonth = today.getMonth() + 1; // 1-12
    const todayDay = today.getDate(); // 1-31
    const currentYear = today.getFullYear();

    // Find users whose birthday is today
    // Assuming users have a birthdate field in format "YYYY-MM-DD" or Date object
    const users = await db.collection('users').find({
      birthdate: { $exists: true },
    }).toArray();

    let bonusesAwarded = 0;
    let errors = 0;

    for (const user of users) {
      try {
        if (!user.birthdate) continue;

        // Parse birthdate
        const birthdate = new Date(user.birthdate);
        const birthMonth = birthdate.getMonth() + 1;
        const birthDay = birthdate.getDate();

        // Check if today is their birthday
        if (birthMonth !== todayMonth || birthDay !== todayDay) {
          continue;
        }

        const userId = user._id.toString();

        // Check if bonus already awarded this year
        const existingBonus = await db.collection('pointsTransactions').findOne({
          userId,
          type: 'bonus',
          reason: { $regex: /^Birthday bonus/ },
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`).toISOString(),
            $lte: new Date(`${currentYear}-12-31`).toISOString(),
          },
        });

        if (existingBonus) {
          console.log(`[CRON] Birthday bonus already awarded to user ${userId} this year`);
          continue;
        }

        // Get or create loyalty account
        let account = await getLoyaltyAccount(userId);
        if (!account) {
          account = await createLoyaltyAccount(userId);
        }

        // Award birthday bonus
        await addPointsTransaction({
          userId,
          type: 'bonus',
          amount: POINTS_EARNING_RULES.birthday,
          reason: `Birthday bonus ${currentYear}`,
        });

        console.log(`[CRON] Awarded ${POINTS_EARNING_RULES.birthday} birthday points to user ${userId}`);
        bonusesAwarded++;

        // TODO: Send birthday email notification
        // await sendBirthdayEmail(user.email, user.name, POINTS_EARNING_RULES.birthday);

      } catch (error) {
        console.error(`[CRON] Error processing birthday bonus for user ${user._id}:`, error);
        errors++;
      }
    }

    const summary = {
      success: true,
      date: today.toISOString(),
      usersChecked: users.length,
      bonusesAwarded,
      errors,
    };

    console.log('[CRON] Birthday bonus job completed:', summary);

    return NextResponse.json(summary, { status: 200 });

  } catch (error: any) {
    console.error('[CRON] Birthday bonus job failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request);
}

