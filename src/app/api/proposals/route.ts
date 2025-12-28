
import { NextResponse, type NextRequest } from 'next/server';
import { getProposalsByFreelancerId } from '@/lib/proposals-data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const freelancerId = searchParams.get('freelancerId');

    // Fetch proposals by freelancerId
    if (freelancerId) {
      const proposals = await getProposalsByFreelancerId(freelancerId);
      return NextResponse.json(proposals);
    }

    // Default case if no valid parameters are provided
    return NextResponse.json({ message: "Missing required parameters (e.g., freelancerId)." }, { status: 400 });

  } catch (error: any) {
    console.error(`[API /proposals GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch proposals: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
