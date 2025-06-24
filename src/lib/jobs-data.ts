
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

// Interface for filter options passed to getAllJobs
export interface JobFilters {
  status?: JobStatus;
  search?: string;
  minBudget?: number;
  maxBudget?: number;
  budgetType?: BudgetType;
  skills?: string[];
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

export async function getAllJobs(filters: JobFilters = {}): Promise<Job[]> {
  const collection = await getCollection<Job>(JOBS_COLLECTION);
  
  const query: Filter<Job> = {};

  // Default to open status if not otherwise specified
  query.status = filters.status || 'open';

  if (filters.search) {
    const regex = { $regex: filters.search, $options: 'i' };
    query.$or = [{ title: regex }, { description: regex }];
  }

  if (filters.minBudget !== undefined || filters.maxBudget !== undefined) {
    query.budgetAmount = {};
    if (filters.minBudget !== undefined) {
      query.budgetAmount.$gte = filters.minBudget;
    }
    if (filters.maxBudget !== undefined) {
      query.budgetAmount.$lte = filters.maxBudget;
    }
  }

  if (filters.budgetType) {
    query.budgetType = filters.budgetType;
  }

  if (filters.skills && filters.skills.length > 0) {
    // Use $all to find jobs that have all the specified skills
    query.skillsRequired = { $all: filters.skills.map(skill => new RegExp(`^${skill}$`, 'i')) };
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

export async function updateJobStatus(jobId: string, status: JobStatus): Promise<Job | null> {
    if (!ObjectId.isValid(jobId)) return null;
    const collection = await getCollection<Job>(JOBS_COLLECTION);
    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(jobId) },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: 'after' }
    );
    return result ? docToJob(result) : null;
}
