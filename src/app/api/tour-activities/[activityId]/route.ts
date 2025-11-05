
import { NextResponse, type NextRequest } from 'next/server';
import { getTourActivityById, updateTourActivity, deleteTourActivity } from '@/lib/tour-activities-data';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const activityUpdateSchema = z.object({
  name: z.string().min(2, "Name is required.").optional(),
  description: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { activityId: string } }
) {
  try {
    const { activityId } = params;
    if (!ObjectId.isValid(activityId)) {
      return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }
    const body = await request.json();
    const validation = activityUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: "Invalid data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    const updatedActivity = await updateTourActivity(activityId, validation.data);
    if (!updatedActivity) {
      return NextResponse.json({ message: "Activity not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedActivity);
  } catch (error: any) {
    const statusCode = error.message.includes('conflict') ? 409 : 500;
    return NextResponse.json({ message: `Failed to update activity: ${error.message}` }, { status: statusCode });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { activityId: string } }
) {
  try {
    const { activityId } = params;
    if (!ObjectId.isValid(activityId)) {
      return NextResponse.json({ message: "Invalid ID format" }, { status: 400 });
    }
    const success = await deleteTourActivity(activityId);
    if (success) {
      return NextResponse.json({ message: "Activity deleted successfully" });
    } else {
      return NextResponse.json({ message: "Activity not found or delete failed" }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: `Failed to delete activity: ${error.message}` }, { status: 500 });
  }
}
