
// src/app/api/jobs/[jobId]/release/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getJobById, updateJobEscrowStatus } from '@/lib/jobs-data';
import { ObjectId } from 'mongodb';

const MOCK_CURRENT_USER_AS_CLIENT_ID = "mockClient123";

export async function PUT(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json({ message: "Invalid Job ID." }, { status: 400 });
    }

    const job = await getJobById(jobId);
    if (!job) {
      return NextResponse.json({ message: "Job not found." }, { status: 404 });
    }

    // --- Authorization Check ---
    if (job.clientId !== MOCK_CURRENT_USER_AS_CLIENT_ID) {
      return NextResponse.json({ message: "Unauthorized. You are not the owner of this job." }, { status: 403 });
    }
    // ---

    if (job.status !== 'completed') {
        return NextResponse.json({ message: `Cannot release funds. Job must be marked as 'completed' first.` }, { status: 409 });
    }
    if (job.escrowStatus !== 'funded') {
        return NextResponse.json({ message: `Cannot release funds. Escrow is currently '${job.escrowStatus}', not 'funded'.` }, { status: 409 });
    }

    // This simulates releasing the payment. In a real app, this would trigger a payout via Stripe, PayPal, etc.
    const updatedJob = await updateJobEscrowStatus(jobId, 'released');
    if (!updatedJob) {
      throw new Error("Failed to update the job's escrow status in the database.");
    }
    
    // Here you would also trigger an update to the client and freelancer's transaction history.
    
    return NextResponse.json({ message: `Payment for job "${job.title}" has been released.`, job: updatedJob });

  } catch (error: any) {
    console.error(`[API /jobs/${params.jobId}/release PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to release funds: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
