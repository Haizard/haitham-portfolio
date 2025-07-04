
import { NextResponse, type NextRequest } from 'next/server';
import { getFreelancerProfile, updateFreelancerProfile, type FreelancerProfile } from '@/lib/user-profile-data';
import { z } from 'zod';
import { getSession } from '@/lib/session';

const portfolioLinkSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Portfolio item title is required.").max(100),
  url: z.string().url("Portfolio URL must be a valid URL.").min(1),
});

const profileUpdateSchema = z.object({
  name: z.string().min(1, "Name is required.").max(100),
  email: z.string().email("Invalid email address."),
  avatarUrl: z.string().url("Avatar URL must be valid.").or(z.literal("")),
  occupation: z.string().min(1, "Occupation is required.").max(100),
  bio: z.string().max(1000, "Bio cannot exceed 1000 characters.").optional().default(""),
  skills: z.array(z.string().max(50)).optional().default([]),
  portfolioLinks: z.array(portfolioLinkSchema).optional().default([]),
  hourlyRate: z.preprocess(
    (val) => (val === "" || val === null || val === undefined) ? null : parseFloat(String(val)),
    z.number().min(0, "Hourly rate must be non-negative.").nullable().optional()
  ),
  availabilityStatus: z.enum(['available', 'busy', 'not_available']),
});


export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    let profile = await getFreelancerProfile(session.user.id!);
    return NextResponse.json(profile);
  } catch (error: any) {
    console.error("[API /profile GET] Error:", error);
    return NextResponse.json({ message: `Failed to fetch freelancer profile: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  
  try {
    const body = await request.json();
    const validation = profileUpdateSchema.safeParse(body);

    if (!validation.success) {
      console.error("API Profile Update Validation Error:", validation.error.flatten());
      return NextResponse.json({ message: "Invalid profile data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const validatedData = validation.data;
    
    const updateData: Partial<Omit<FreelancerProfile, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>> = {
        ...validatedData,
        hourlyRate: validatedData.hourlyRate,
    };

    const updatedProfile = await updateFreelancerProfile(session.user.id!, updateData);

    if (!updatedProfile) {
      return NextResponse.json({ message: "Profile not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedProfile);

  } catch (error: any) {
    console.error("[API /profile POST] Error:", error);
    return NextResponse.json({ message: `Failed to update profile: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
