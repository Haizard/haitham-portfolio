
import { NextResponse, type NextRequest } from 'next/server';
import { getProposalsByFreelancerId } from '@/lib/proposals-data';

// This is a placeholder until we have real user auth.
const MOCK_CURRENT_USER_AS_FREELANCER_ID = "mockFreelancer456";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const freelancerId = searchParams.get('freelancerId');

    // For now, we only support fetching by freelancerId.
    // In a real app, you'd have more robust authorization here.
    if (freelancerId) {
       // We'll use the mock ID for this demo, but in a real app you'd validate
       // that the requesting user is the freelancerId passed.
       const proposals = await getProposalsByFreelancerId(MOCK_CURRENT_USER_AS_FREELANCER_ID);
       return NextResponse.json(proposals);
    }
    
    // Default case if no valid parameters are provided
    return NextResponse.json({ message: "Missing required parameters (e.g., freelancerId)." }, { status: 400 });

  } catch (error: any) {
    console.error(`[API /proposals GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch proposals: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
