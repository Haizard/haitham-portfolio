
import { NextResponse, type NextRequest } from 'next/server';
import { getClientProjectById, updateClientProject, deleteClientProject } from '@/lib/client-projects-data';
import { z } from 'zod';

// Schema for updating a project. All fields are optional.
const updateProjectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters.").optional(),
  client: z.string().min(1, "Client name is required.").optional(),
  status: z.enum(["In Progress", "Completed", "Planning", "On Hold"]).optional(),
  description: z.string().optional().nullable(),
  startDate: z.string().optional().nullable().refine(val => val === null || val === undefined || !isNaN(Date.parse(val)), { message: "Invalid start date" }),
  endDate: z.string().optional().nullable().refine(val => val === null || val === undefined || !isNaN(Date.parse(val)), { message: "Invalid end date" }),
}).refine(data => {
  if (data.startDate && data.endDate && new Date(data.startDate) > new Date(data.endDate)) {
    return false;
  }
  return true;
}, {
  message: "End date cannot be earlier than start date.",
  path: ["endDate"],
});


export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const project = await getClientProjectById(params.projectId);
    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error: any) {
    console.error(`[API /api/client-projects/${params.projectId} GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch project: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await request.json();
    const validation = updateProjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid project data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const updatedProject = await updateClientProject(params.projectId, validation.data);

    if (!updatedProject) {
      return NextResponse.json({ message: "Project not found or update failed" }, { status: 404 });
    }
    return NextResponse.json(updatedProject);

  } catch (error: any) {
    console.error(`[API /api/client-projects/${params.projectId} PUT] Error:`, error);
    return NextResponse.json({ message: `Failed to update project: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const success = await deleteClientProject(params.projectId);
    if (success) {
      return NextResponse.json({ message: "Project deleted successfully" });
    } else {
      return NextResponse.json({ message: "Project not found or delete failed" }, { status: 404 });
    }
  } catch (error: any) {
    console.error(`[API /api/client-projects/${params.projectId} DELETE] Error:`, error);
    return NextResponse.json({ message: `Failed to delete project: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
