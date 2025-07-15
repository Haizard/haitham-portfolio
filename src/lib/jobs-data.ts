
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import { ClientProfile, getClientProfile } from './client-profile-data';

const JOBS_COLLECTION = 'jobs';

export type JobStatus = 'open' | 'in-progress' | 'completed' | 'cancelled';
export type BudgetType = 'fixed' | 'hourly';
export type EscrowStatus = 'unfunded' | 'funded' | 'released';

export interface Job {
  _id?: ObjectId;
  id?: string;
  title: string;
  description: string;
  clientId: string; 
  status: JobStatus;
  budgetType: BudgetType;
  budgetAmount?: number;
  skillsRequired: string[];
  deadline?: string; // ISO Date string
  proposalCount?: number;
  clientReviewId?: string; // ID of the review left by the client
  freelancerReviewId?: string; // ID of the review left by the freelancer
  escrowStatus: EscrowStatus;
  createdAt: string;
  updatedAt: string;
  // Enriched field
  clientProfile?: ClientProfile;
}

// Interface for filter options passed to getAllJobs
export interface JobFilters {
  status?: JobStatus;
  clientId?: string;
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

  if (filters.clientId) {
    query.clientId = filters.clientId;
  }
  
  // Only filter by status if it's explicitly provided.
  // If not, and no client ID is given, default to 'open'.
  if (filters.status) {
    query.status = filters.status;
  } else if (!filters.clientId) {
    query.status = 'open'; // Default for public job board browsing
  }

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
  
  // Enrich all jobs with their client profile
  const jobsWithProfiles = await Promise.all(
    jobDocs.map(async (doc) => {
      const job = docToJob(doc);
      job.clientProfile = await getClientProfile(job.clientId);
      return job;
    })
  );

  return jobsWithProfiles;
}

export async function getJobById(id: string): Promise<Job | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<Job>(JOBS_COLLECTION);
  const jobDoc = await collection.findOne({ _id: new ObjectId(id) });
  if (!jobDoc) return null;
  
  const job = docToJob(jobDoc);
  // Enrich with client profile
  job.clientProfile = await getClientProfile(job.clientId);
  return job;
}

export async function getJobsByIds(ids: string[]): Promise<Job[]> {
  if (!ids || ids.length === 0) return [];
  const validObjectIds = ids.filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
  if (validObjectIds.length === 0) return [];

  const collection = await getCollection<Job>(JOBS_COLLECTION);
  const jobDocs = await collection.find({ _id: { $in: validObjectIds } }).toArray();

  const clientIds = [...new Set(jobDocs.map(j => j.clientId))];
  const clientProfiles = await Promise.all(clientIds.map(id => getClientProfile(id)));
  const clientProfileMap = new Map(clientProfiles.map(p => p ? [p.userId, p] : [null, null]));

  return jobDocs.map(doc => {
    const job = docToJob(doc);
    job.clientProfile = clientProfileMap.get(job.clientId);
    return job;
  });
}

export async function addJob(jobData: Omit<Job, 'id' | '_id' | 'createdAt' | 'updatedAt' | 'proposalCount'>): Promise<Job> {
  const collection = await getCollection<Omit<Job, 'id' | '_id'>>(JOBS_COLLECTION);
  const now = new Date().toISOString();
  const docToInsert = {
    ...jobData,
    status: 'open' as JobStatus, // New jobs are always 'open'
    escrowStatus: 'funded' as EscrowStatus, // New jobs are pre-funded now
    proposalCount: 0,
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
        { $set: { status, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after' }
    );
    return result ? docToJob(result) : null;
}

export async function updateJobEscrowStatus(jobId: string, escrowStatus: EscrowStatus): Promise<Job | null> {
  if (!ObjectId.isValid(jobId)) return null;
  const collection = await getCollection<Job>(JOBS_COLLECTION);
  const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(jobId) },
      { $set: { escrowStatus, updatedAt: new Date().toISOString() } },
      { returnDocument: 'after' }
  );
  return result ? docToJob(result) : null;
}

export async function updateJobReviewStatus(jobId: string, role: 'client' | 'freelancer', reviewId: string): Promise<Job | null> {
  if (!ObjectId.isValid(jobId) || !ObjectId.isValid(reviewId)) return null;
  const collection = await getCollection<Job>(JOBS_COLLECTION);
  
  const updateField = role === 'client' ? 'clientReviewId' : 'freelancerReviewId';
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(jobId) },
    { $set: { [updateField]: reviewId, updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' }
  );
  return result ? docToJob(result) : null;
}
