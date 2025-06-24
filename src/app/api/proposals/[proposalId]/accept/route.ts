
// src/app/api/proposals/[proposalId]/accept/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getProposalById, updateProposalStatus, rejectOtherProposalsForJob } from '@/lib/proposals-data';
import { getJobById, updateJobStatus } from '@/lib/jobs-data';
import { ObjectId } from 'mongodb';

// This is a placeholder until we have real user auth.
// This should match the clientId used when creating jobs.
const MOCK_CURRENT_USER_AS_CLIENT_ID = "mockClient123";

export async function PUT(
  request: NextRequest,
  { params }: { params: { proposalId: string } }
) {
  try {
    const { proposalId } = params;
    if (!ObjectId.isValid(proposalId)) {
      return NextResponse.json({ message: "Invalid Proposal ID." }, { status: 400 });
    }

    const proposal = await getProposalById(proposalId);
    if (!proposal) {
      return NextResponse.json({ message: "Proposal not found." }, { status: 404 });
    }

    const job = await getJobById(proposal.jobId);
    if (!job) {
      return NextResponse.json({ message: "Associated job not found." }, { status: 404 });
    }
    
    // --- Authorization Check (crucial in a real app) ---
    // Here we check if the person making the request is the one who posted the job.
    if (job.clientId !== MOCK_CURRENT_USER_AS_CLIENT_ID) {
        return NextResponse.json({ message: "Unauthorized. You are not the owner of this job." }, { status: 403 });
    }
    // ---

    if (job.status !== 'open') {
        return NextResponse.json({ message: `Cannot accept proposal. Job is already ${job.status}.` }, { status: 409 }); // Conflict
    }

    // Perform the operations in a sequence
    const acceptedProposal = await updateProposalStatus(proposalId, 'accepted');
    const updatedJob = await updateJobStatus(job.id!, 'in-progress');
    await rejectOtherProposalsForJob(job.id!, proposalId);

    if (!acceptedProposal || !updatedJob) {
        // This would indicate an issue, though unlikely if checks pass.
        // In a real app, you'd wrap this in a database transaction.
        throw new Error("Failed to finalize proposal acceptance.");
    }

    return NextResponse.json({ 
        message: "Proposal accepted successfully!",
        acceptedProposal,
        updatedJob 
    });

  } catch (error: any) {
    console.error(`[API /proposals/${params.proposalId}/accept PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to accept proposal: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
