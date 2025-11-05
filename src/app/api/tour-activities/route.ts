
import { NextResponse, type NextRequest } from 'next/server';
import { getAllTourActivities, addTourActivity } from '@/lib/tour-activities-data';
import { z } from 'zod';

const activityCreateSchema = z.object({
  name: z.string().min(2, "Name is required."),
  description: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const activities = await getAllTourActivities();
    return NextResponse.json(activities);
  } catch (error: any) {
    return NextResponse.json({ message: `Failed to fetch tour activities: ${error.message}` }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Admin auth
    const body = await request.json();
    const validation = activityCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const newActivity = await addTourActivity(validation.data);
    return NextResponse.json(newActivity, { status: 201 });
  } catch (error: any) {
     const statusCode = error.message.includes('already exists') ? 409 : 500;
    return NextResponse.json({ message: `Failed to create tour activity: ${error.message}` }, { status: statusCode });
  }
}
