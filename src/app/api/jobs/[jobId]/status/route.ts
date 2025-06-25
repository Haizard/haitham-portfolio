// src/app/api/jobs/[jobId]/status/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getJobById, updateJobStatus, type JobStatus } from '@/lib/jobs-data';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const MOCK_CURRENT_USER_AS_CLIENT_ID = "mockClient123";

const statusUpdateSchema = z.object({
  status: z.enum(['completed', 'cancelled']), // Only allow marking as completed or cancelled for now
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json({ message: "Invalid Job ID." }, { status: 400 });
    }

    const body = await request.json();
    const validation = statusUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid status provided.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const { status } = validation.data;

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
        return NextResponse.json({ message: `Cannot update status. Job is currently '${job.status}', not 'in-progress'.` }, { status: 409 });
    }

    const updatedJob = await updateJobStatus(jobId, status);
    if (!updatedJob) {
      throw new Error("Failed to update the job status in the database.");
    }
    
    return NextResponse.json({ message: `Job status updated to ${status}.`, job: updatedJob });

  } catch (error: any) {
    console.error(`[API /jobs/${params.jobId}/status PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to update job status: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
