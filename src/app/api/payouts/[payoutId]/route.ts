import { NextResponse, type NextRequest } from 'next/server';
import { updatePayoutStatus, type PayoutStatus } from '@/lib/payouts-data';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const updateStatusSchema = z.object({
  status: z.enum(['completed', 'failed']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { payoutId: string } }
) {
  try {
    // TODO: Add robust admin authentication
    const { payoutId } = params;
    if (!ObjectId.isValid(payoutId)) {
      return NextResponse.json({ message: "Invalid Payout ID." }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid status update data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { status } = validation.data;
    
    const updatedPayout = await updatePayoutStatus(payoutId, status);
    if (!updatedPayout) {
      return NextResponse.json({ message: "Payout not found or update failed." }, { status: 404 });
    }

    return NextResponse.json({ message: `Payout status updated to ${status}.`, payout: updatedPayout });
  } catch (error: any) {
    console.error(`[API /payouts/${params.payoutId} PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to update payout status: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
