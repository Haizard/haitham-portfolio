
import { NextResponse, type NextRequest } from 'next/server';
import { getJobById } from '@/lib/jobs-data';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const job = await getJobById(params.jobId);
    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }
    return NextResponse.json(job);
  } catch (error: any) {
    console.error(`[API /api/jobs/${params.jobId} GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch job: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
