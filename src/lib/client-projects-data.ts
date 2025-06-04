
export interface ClientProject {
  id: string;
  name: string;
  status: "In Progress" | "Completed" | "Planning" | "On Hold";
  client: string;
  description?: string; // Optional: a brief description
  startDate?: string; // Optional
  endDate?: string; // Optional
}

let projects: ClientProject[] = [
  { id: "proj1", name: "Website Redesign Q3 2024", status: "In Progress", client: "Acme Corp", description: "Full redesign of the corporate website and e-commerce platform." },
  { id: "proj2", name: "Social Media Campaign - Summer", status: "Completed", client: "Beta LLC", description: "Executed a targeted social media marketing campaign." },
  { id: "proj3", name: "Video Production Series - Product Launch", status: "Planning", client: "Gamma Inc", description: "Series of promotional videos for an upcoming product." },
  { id: "proj4", name: "Brand Identity Overhaul", status: "On Hold", client: "Delta Solutions", description: "Complete rebranding including logo, style guide, and marketing materials." },
];

export function getAllClientProjects(): ClientProject[] {
  return projects;
}

export function getClientProjectById(id: string): ClientProject | undefined {
  return projects.find(project => project.id === id);
}

export function addClientProject(project: Omit<ClientProject, 'id'>): ClientProject {
  const newProject: ClientProject = {
    id: (Math.random() + 1).toString(36).substring(7), // simple unique id
    ...project
  };
  projects.push(newProject);
  return newProject;
}

export function updateClientProject(id: string, updates: Partial<Omit<ClientProject, 'id'>>): ClientProject | undefined {
  const projectIndex = projects.findIndex(project => project.id === id);
  if (projectIndex === -1) {
    return undefined;
  }
  projects[projectIndex] = { ...projects[projectIndex], ...updates };
  return projects[projectIndex];
}

export function deleteClientProject(id: string): boolean {
  const initialLength = projects.length;
  projects = projects.filter(project => project.id !== id);
  return projects.length < initialLength;
}
