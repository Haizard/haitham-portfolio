// src/app/api/payouts/initiate/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getPayoutById, updatePayoutStatus } from '@/lib/payouts-data';
import { initiatePayout } from '@/lib/azampay';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const initiatePayoutSchema = z.object({
  payoutId: z.string(),
  phoneNumber: z.string().regex(/^[0-9]{9,12}$/, "Invalid phone number format."),
  amount: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    // TODO: Add robust admin authentication check
    const body = await request.json();
    const validation = initiatePayoutSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid request data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { payoutId, phoneNumber, amount } = validation.data;

    if (!ObjectId.isValid(payoutId)) {
        return NextResponse.json({ message: "Invalid Payout ID." }, { status: 400 });
    }

    const payout = await getPayoutById(payoutId);
    if (!payout || payout.status !== 'pending') {
        return NextResponse.json({ message: "Payout not found or is not in 'pending' state." }, { status: 404 });
    }

    const paymentResponse = await initiatePayout(
        amount,
        phoneNumber,
        payoutId,
        'Mpesa' // This could be made dynamic based on vendor's preference
    );

    if (paymentResponse.success) {
      // The payout is initiated, but we'll wait for a separate callback to confirm completion.
      // For this flow, we will optimistically mark it as completed since AzamPay disbursement is often synchronous.
      // A more robust system would have a webhook for disbursement status too.
      await updatePayoutStatus(payoutId, 'completed');
      return NextResponse.json({ message: paymentResponse.message || "Payout initiated successfully." });
    } else {
      await updatePayoutStatus(payoutId, 'failed');
      return NextResponse.json({ message: paymentResponse.message || "Payout initiation failed." }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[API /payouts/initiate POST] Error:', error);
    return NextResponse.json({ message: `Payout processing error: ${error.message || "Unknown server error."}` }, { status: 500 });
  }
}
