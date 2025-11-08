/**
 * Points Expiration Cron Job
 * 
 * This endpoint should be called daily to:
 * 1. Expire points that have passed their expiration date
 * 2. Send warning emails for points expiring soon (7 days)
 * 
 * Schedule: Daily at 01:00 UTC
 * 
 * Vercel Cron Configuration (vercel.json):
 * {
 *   "crons": [{
 *     "path": "/api/cron/expire-points",
 *     "schedule": "0 1 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  addPointsTransaction,
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

    console.log('[CRON] Starting points expiration job...');

    const clientPromise = (await import('@/lib/mongodb')).default;
    const client = await clientPromise;
    const db = client.db();

    const now = new Date();
    const nowISO = now.toISOString();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Find expired points transactions
    const expiredTransactions = await db.collection('pointsTransactions').find({
      type: 'earn',
      expiresAt: { $lt: nowISO },
      expired: { $ne: true }, // Not already processed
    }).toArray();

    let pointsExpired = 0;
    let transactionsExpired = 0;
    let errors = 0;

    // Process expired points
    for (const transaction of expiredTransactions) {
      try {
        const userId = transaction.userId;
        const amount = transaction.amount;

        // Create expiration transaction
        await addPointsTransaction({
          userId,
          type: 'expire',
          amount: -amount,
          reason: `Points expired from ${new Date(transaction.createdAt).toLocaleDateString()}`,
        });

        // Mark original transaction as expired
        await db.collection('pointsTransactions').updateOne(
          { _id: transaction._id },
          { $set: { expired: true } }
        );

        console.log(`[CRON] Expired ${amount} points for user ${userId}`);
        pointsExpired += amount;
        transactionsExpired++;

        // TODO: Send expiration notification email
        // await sendPointsExpiredEmail(userId, amount);

      } catch (error) {
        console.error(`[CRON] Error expiring points for transaction ${transaction._id}:`, error);
        errors++;
      }
    }

    // Find points expiring soon (7 days warning)
    const expiringTransactions = await db.collection('pointsTransactions').find({
      type: 'earn',
      expiresAt: {
        $gte: nowISO,
        $lte: sevenDaysFromNow,
      },
      expired: { $ne: true },
      expirationWarningSet: { $ne: true }, // Not already warned
    }).toArray();

    let warningsSent = 0;

    // Send expiration warnings
    for (const transaction of expiringTransactions) {
      try {
        const userId = transaction.userId;
        const amount = transaction.amount;
        const expiresAt = new Date(transaction.expiresAt);
        const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

        console.log(`[CRON] Warning: ${amount} points expiring in ${daysUntilExpiry} days for user ${userId}`);

        // Mark warning as sent
        await db.collection('pointsTransactions').updateOne(
          { _id: transaction._id },
          { $set: { expirationWarningSent: true } }
        );

        warningsSent++;

        // TODO: Send expiration warning email
        // await sendPointsExpiringEmail(userId, amount, daysUntilExpiry);

      } catch (error) {
        console.error(`[CRON] Error sending warning for transaction ${transaction._id}:`, error);
        errors++;
      }
    }

    const summary = {
      success: true,
      timestamp: nowISO,
      expired: {
        transactions: transactionsExpired,
        totalPoints: pointsExpired,
      },
      warnings: {
        sent: warningsSent,
      },
      errors,
    };

    console.log('[CRON] Points expiration job completed:', summary);

    return NextResponse.json(summary, { status: 200 });

  } catch (error: any) {
    console.error('[CRON] Points expiration job failed:', error);
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

