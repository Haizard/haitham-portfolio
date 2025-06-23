
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';

const JOBS_COLLECTION = 'jobs';

export type JobStatus = 'open' | 'in-progress' | 'completed' | 'cancelled';
export type BudgetType = 'fixed' | 'hourly';

export interface Job {
  _id?: ObjectId;
  id?: string;
  title: string;
  description: string;
  clientId: string; // In a real system, this would be the authenticated user's ID
  status: JobStatus;
  budgetType: BudgetType;
  budgetAmount?: number;
  skillsRequired: string[];
  deadline?: string; // ISO Date string
  createdAt: Date;
  updatedAt: Date;
}

function docToJob(doc: any): Job {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { 
    id: _id?.toString(), 
    ...rest,
    skillsRequired: rest.skillsRequired || [],
  } as Job;
}

export async function getAllJobs(filters: { status?: JobStatus } = {}): Promise<Job[]> {
  const collection = await getCollection<Job>(JOBS_COLLECTION);
  const query: Filter<Job> = {};
  if (filters.status) {
    query.status = filters.status;
  } else {
    // Default to only showing open jobs if no status is specified
    query.status = 'open';
  }
  const jobDocs = await collection.find(query).sort({ createdAt: -1 }).toArray();
  return jobDocs.map(docToJob);
}

export async function getJobById(id: string): Promise<Job | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<Job>(JOBS_COLLECTION);
  const jobDoc = await collection.findOne({ _id: new ObjectId(id) });
  return jobDoc ? docToJob(jobDoc) : null;
}

export async function addJob(jobData: Omit<Job, 'id' | '_id' | 'createdAt' | 'updatedAt'>): Promise<Job> {
  const collection = await getCollection<Omit<Job, 'id' | '_id'>>(JOBS_COLLECTION);
  const now = new Date();
  const docToInsert = {
    ...jobData,
    status: 'open' as JobStatus, // New jobs are always 'open'
    createdAt: now,
    updatedAt: now,
  };
  const result = await collection.insertOne(docToInsert as any);
  return { _id: result.insertedId, id: result.insertedId.toString(), ...docToInsert };
}
