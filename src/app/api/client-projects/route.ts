
import { NextResponse, type NextRequest } from 'next/server';
import { getAllClientProjects, addClientProject, type ClientProject } from '@/lib/client-projects-data';
import { z } from 'zod';

// Basic schema for creating a project (can be expanded for an admin form later)
const createProjectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters."),
  client: z.string().min(1, "Client name is required."),
  status: z.enum(["In Progress", "Completed", "Planning", "On Hold"]),
  description: z.string().optional(),
  startDate: z.string().optional(), // Assuming ISO date string
  endDate: z.string().optional(),   // Assuming ISO date string
});


export async function GET(request: NextRequest) {
  try {
    // In a real system, you'd filter projects based on the authenticated client user.
    // For now, we return all projects for demo purposes.
    const allProjects = await getAllClientProjects();
    return NextResponse.json(allProjects);
  } catch (error) {
    console.error("API - Failed to fetch client projects:", error);
    return NextResponse.json({ message: "Failed to fetch client projects" }, { status: 500 });
  }
}

// POST handler (Example for future admin functionality to add projects)
// Not directly used by the current client portal page, but good to have.
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication to ensure only admins can create projects
    const body = await request.json();
    const validation = createProjectSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid project data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const projectData = validation.data as Omit<ClientProject, 'id' | '_id' | 'createdAt' | 'updatedAt'>;
    const newProject = await addClientProject(projectData);
    return NextResponse.json(newProject, { status: 201 });

  } catch (error: any) {
    console.error("API - Failed to create client project:", error);
    return NextResponse.json({ message: `Failed to create project: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
