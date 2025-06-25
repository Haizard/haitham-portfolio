
// src/app/api/jobs/[jobId]/fund/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getJobById, updateJobEscrowStatus } from '@/lib/jobs-data';
import { z } from 'zod';
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

    if (job.status !== 'in-progress') {
        return NextResponse.json({ message: `Cannot fund job. Job is currently '${job.status}', not 'in-progress'.` }, { status: 409 });
    }
    if (job.escrowStatus !== 'unfunded') {
        return NextResponse.json({ message: `Cannot fund job. Escrow is already '${job.escrowStatus}'.` }, { status: 409 });
    }

    // This simulates a payment being successfully processed.
    const updatedJob = await updateJobEscrowStatus(jobId, 'funded');
    if (!updatedJob) {
      throw new Error("Failed to update the job's escrow status in the database.");
    }
    
    return NextResponse.json({ message: `Escrow for job "${job.title}" has been funded.`, job: updatedJob });

  } catch (error: any) {
    console.error(`[API /jobs/${params.jobId}/fund PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to fund escrow: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
