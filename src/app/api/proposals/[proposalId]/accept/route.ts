
// src/app/api/proposals/[proposalId]/accept/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { getProposalById, updateProposalStatus, rejectOtherProposalsForJob } from '@/lib/proposals-data';
import { getJobById, updateJobStatus } from '@/lib/jobs-data';
import { addClientProject } from '@/lib/client-projects-data'; // Import addClientProject
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

    // Perform the operations in a sequence. In a real-world app, this should be a database transaction.
    const acceptedProposal = await updateProposalStatus(proposalId, 'accepted');
    const updatedJob = await updateJobStatus(job.id!, 'in-progress');
    await rejectOtherProposalsForJob(job.id!, proposalId);

    // ** NEW STEP: Create a corresponding client project **
    const newProject = await addClientProject({
      name: job.title,
      client: job.clientId,
      status: 'Planning', // Start in the planning phase
      description: job.description,
      startDate: new Date().toISOString(), // Set start date to today
      // endDate can be set later
    });

    if (!acceptedProposal || !updatedJob || !newProject) {
        // This would indicate an issue, though unlikely if checks pass.
        throw new Error("Failed to finalize proposal acceptance and project creation.");
    }

    return NextResponse.json({ 
        message: "Proposal accepted and project created successfully!",
        acceptedProposal,
        updatedJob,
        newProject,
    });

  } catch (error: any) {
    console.error(`[API /proposals/${params.proposalId}/accept PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to accept proposal: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
