
import { NextResponse, type NextRequest } from 'next/server';
import { addProposal, getProposalsForJob } from '@/lib/proposals-data';
import { getJobById } from '@/lib/jobs-data';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { requireAuth } from '@/lib/auth-middleware';
import { getSession } from '@/lib/session';

const proposalSubmitSchema = z.object({
  coverLetter: z.string().min(20, "Cover letter must be at least 20 characters.").max(5000),
  proposedRate: z.number().min(0, "Proposed rate must be a non-negative number."),
});

export async function POST(
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

    const body = await request.json();
    const validation = proposalSubmitSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid proposal data.", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { coverLetter, proposedRate } = validation.data;

    // Check authentication
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const session = await getSession();
    const freelancerId = session.user!.id;

    const newProposal = await addProposal({
      jobId,
      freelancerId,
      coverLetter,
      proposedRate,
    });

    return NextResponse.json(newProposal, { status: 201 });

  } catch (error: any) {
    console.error(`[API /jobs/${params.jobId}/proposals POST] Error:`, error);
    if (error.message?.includes("already submitted")) {
      return NextResponse.json({ message: error.message }, { status: 409 }); // Conflict
    }
    return NextResponse.json({ message: `Failed to submit proposal: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;
    if (!ObjectId.isValid(jobId)) {
      return NextResponse.json({ message: "Invalid Job ID." }, { status: 400 });
    }
    // TODO: Add authorization check - only the job poster or involved parties should see proposals.
    const proposals = await getProposalsForJob(jobId);
    return NextResponse.json(proposals);
  } catch (error: any) {
    console.error(`[API /jobs/${params.jobId}/proposals GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch proposals: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
