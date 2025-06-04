
import { NextResponse, type NextRequest } from 'next/server';
import { getAllClientProjects } from '@/lib/client-projects-data';

export async function GET(request: NextRequest) {
  try {
    const allProjects = getAllClientProjects();
    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return NextResponse.json(allProjects);
  } catch (error) {
    console.error("Failed to fetch client projects:", error);
    return NextResponse.json({ message: "Failed to fetch client projects" }, { status: 500 });
  }
}
