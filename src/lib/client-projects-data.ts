
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';

const CLIENT_PROJECTS_COLLECTION = 'clientProjects';

export interface ClientProject {
  _id?: ObjectId;
  id?: string;
  name: string;
  status: "In Progress" | "Completed" | "Planning" | "On Hold";
  client: string; // In a real system, this might be a client ID
  description?: string;
  startDate?: string; // ISO Date string
  endDate?: string; // ISO Date string
  createdAt: string;
  updatedAt: string;
}

function docToClientProject(doc: any): ClientProject {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { 
    id: _id?.toString(), 
    ...rest,
    startDate: rest.startDate ? new Date(rest.startDate).toISOString().split('T')[0] : undefined,
    endDate: rest.endDate ? new Date(rest.endDate).toISOString().split('T')[0] : undefined,
  } as ClientProject;
}

// Seed some initial data if the collection is empty (for demo purposes)
async function seedInitialProjects() {
  const collection = await getCollection<ClientProject>(CLIENT_PROJECTS_COLLECTION);
  const count = await collection.countDocuments();
  if (count === 0) {
    console.log("Seeding initial client projects...");
    const initialProjects: Omit<ClientProject, 'id' | '_id' | 'createdAt' | 'updatedAt'>[] = [
      { name: "Corporate Website V2", status: "In Progress", client: "Acme Corp", description: "Full redesign of the corporate website and e-commerce platform.", startDate: "2024-07-01" },
      { name: "Summer Marketing Campaign", status: "Completed", client: "Beta LLC", description: "Targeted social media marketing campaign.", startDate: "2024-05-01", endDate: "2024-06-30" },
      { name: "Mobile App - Phase 1", status: "Planning", client: "Gamma Inc", description: "Initial design and core feature planning for new mobile app." },
      { name: "Branding Refresh", status: "On Hold", client: "Delta Solutions", description: "Revisiting brand identity and visual assets.", startDate: "2024-06-15" },
    ];
    const now = new Date().toISOString();
    await collection.insertMany(initialProjects.map(p => ({ ...p, createdAt: now, updatedAt: now })) as any[]);
    console.log("Initial client projects seeded.");
  }
}

seedInitialProjects().catch(console.error);


export async function getAllClientProjects(): Promise<ClientProject[]> {
  const collection = await getCollection<ClientProject>(CLIENT_PROJECTS_COLLECTION);
  const projectDocs = await collection.find({}).sort({ createdAt: -1 }).toArray();
  return projectDocs.map(docToClientProject);
}

export async function getClientProjectById(id: string): Promise<ClientProject | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<ClientProject>(CLIENT_PROJECTS_COLLECTION);
  const projectDoc = await collection.findOne({ _id: new ObjectId(id) });
  return projectDoc ? docToClientProject(projectDoc) : null;
}

export async function addClientProject(projectData: Omit<ClientProject, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<ClientProject> {
  const collection = await getCollection<Omit<ClientProject, 'id' | '_id'>>(CLIENT_PROJECTS_COLLECTION);
  const now = new Date().toISOString();
  const docToInsert = {
    ...projectData,
    startDate: projectData.startDate ? new Date(projectData.startDate).toISOString() : undefined,
    endDate: projectData.endDate ? new Date(projectData.endDate).toISOString() : undefined,
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(docToInsert as any);
  const newProject = { _id: result.insertedId, id: result.insertedId.toString(), ...docToInsert };
  return docToClientProject(newProject); // Ensure dates are formatted correctly on return
}

export async function updateClientProject(id: string, updates: Partial<Omit<ClientProject, 'id' | '_id' | 'createdAt' | 'updatedAt'>>): Promise<ClientProject | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<ClientProject>(CLIENT_PROJECTS_COLLECTION);
  
  const updatePayload = { ...updates, updatedAt: new Date().toISOString() };
  if (updates.startDate) {
    updatePayload.startDate = new Date(updates.startDate).toISOString();
  }
  if (updates.endDate) {
    updatePayload.endDate = new Date(updates.endDate).toISOString();
  }

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatePayload },
    { returnDocument: 'after' }
  );
  return result ? docToClientProject(result) : null;
}

export async function deleteClientProject(id: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getCollection<ClientProject>(CLIENT_PROJECTS_COLLECTION);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
