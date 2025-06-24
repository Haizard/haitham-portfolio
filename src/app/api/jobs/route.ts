
import { NextResponse, type NextRequest } from 'next/server';
import { addJob, getAllJobs } from '@/lib/jobs-data';
import { z } from 'zod';
import type { BudgetType, JobFilters } from '@/lib/jobs-data';

const jobPostSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters.").max(150),
  description: z.string().min(50, "Description must be at least 50 characters.").max(5000),
  budgetType: z.enum(['fixed', 'hourly']),
  budgetAmount: z.number().min(0, "Budget must be non-negative.").optional(),
  skillsRequired: z.array(z.string().max(30)).min(1, "At least one skill is required."),
  deadline: z.string().optional().nullable(),
});

// GET all open jobs, now with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters: JobFilters = {
      search: searchParams.get('search') || undefined,
      minBudget: searchParams.get('minBudget') ? Number(searchParams.get('minBudget')) : undefined,
      maxBudget: searchParams.get('maxBudget') ? Number(searchParams.get('maxBudget')) : undefined,
      budgetType: searchParams.get('budgetType') as BudgetType | undefined,
      skills: searchParams.get('skills')?.split(',').map(s => s.trim()).filter(Boolean) || undefined,
      clientId: searchParams.get('clientId') || undefined,
    };
    
    const jobs = await getAllJobs(filters);
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("API - Failed to fetch jobs:", error);
    return NextResponse.json({ message: "Failed to fetch jobs" }, { status: 500 });
  }
}

// POST a new job
export async function POST(request: NextRequest) {
  try {
    // In a real app, clientId would come from the authenticated session
    const clientId = "mockClient123";
    
    const body = await request.json();
    const validation = jobPostSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid job data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const jobData = {
      ...validation.data,
      clientId,
      deadline: validation.data.deadline || undefined,
    };
    
    const newJob = await addJob(jobData as any);
    return NextResponse.json(newJob, { status: 201 });

  } catch (error: any) {
    console.error("API - Failed to create job:", error);
    return NextResponse.json({ message: `Failed to create job: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
