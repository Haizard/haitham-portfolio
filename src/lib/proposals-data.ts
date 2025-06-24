
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import { getJobsByIds, type Job } from './jobs-data';

const PROPOSALS_COLLECTION = 'proposals';
const JOBS_COLLECTION = 'jobs';
const MOCK_FREELANCER_ID = "mockFreelancer456"; // For now, all proposals come from this mock user

export type ProposalStatus = 'submitted' | 'shortlisted' | 'rejected' | 'accepted';

export interface Proposal {
  _id?: ObjectId;
  id?: string;
  jobId: string;
  freelancerId: string; // The user ID of the freelancer who submitted it
  coverLetter: string;
  proposedRate: number;
  status: ProposalStatus;
  createdAt: Date;
  updatedAt: Date;
}

function docToProposal(doc: any): Proposal {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { 
    id: _id?.toString(), 
    ...rest,
  } as Proposal;
}

export async function addProposal(proposalData: Omit<Proposal, 'id' | '_id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Proposal> {
  const proposalsCollection = await getCollection<Omit<Proposal, 'id' | '_id'>>(PROPOSALS_COLLECTION);
  const now = new Date();
  
  // Check if this freelancer has already applied for this job
  const existingProposal = await proposalsCollection.findOne({ 
    jobId: proposalData.jobId, 
    freelancerId: proposalData.freelancerId 
  });
  if (existingProposal) {
    throw new Error("You have already submitted a proposal for this job.");
  }

  const docToInsert = {
    ...proposalData,
    freelancerId: proposalData.freelancerId || MOCK_FREELANCER_ID, // Use mock ID for now
    status: 'submitted' as ProposalStatus,
    createdAt: now,
    updatedAt: now,
  };
  
  const result = await proposalsCollection.insertOne(docToInsert as any);

  // After adding proposal, update the job's proposal count
  const jobsCollection = await getCollection<Job>(JOBS_COLLECTION);
  await jobsCollection.updateOne(
    { _id: new ObjectId(proposalData.jobId) },
    { $inc: { proposalCount: 1 } }
  );
  
  return { _id: result.insertedId, id: result.insertedId.toString(), ...docToInsert };
}

export async function getProposalsForJob(jobId: string): Promise<Proposal[]> {
  if (!ObjectId.isValid(jobId)) return [];
  const collection = await getCollection<Proposal>(PROPOSALS_COLLECTION);
  const proposalDocs = await collection.find({ jobId }).sort({ createdAt: -1 }).toArray();
  return proposalDocs.map(docToProposal);
}

export async function getProposalsByFreelancerId(freelancerId: string): Promise<(Proposal & { job?: Job })[]> {
  const collection = await getCollection<Proposal>(PROPOSALS_COLLECTION);
  const proposalDocs = await collection.find({ freelancerId }).sort({ createdAt: -1 }).toArray();
  
  const proposals = proposalDocs.map(docToProposal);
  
  if (proposals.length === 0) {
    return [];
  }

  // Enrich proposals with job data
  const jobIds = [...new Set(proposals.map(p => p.jobId))];
  const jobs = await getJobsByIds(jobIds);
  const jobsMap = new Map<string, Job>(jobs.map(j => [j.id!, j]));
  
  const enrichedProposals = proposals.map(p => ({
    ...p,
    job: jobsMap.get(p.jobId),
  }));

  return enrichedProposals;
}


export async function getProposalById(id: string): Promise<Proposal | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<Proposal>(PROPOSALS_COLLECTION);
  const proposalDoc = await collection.findOne({ _id: new ObjectId(id) });
  return proposalDoc ? docToProposal(proposalDoc) : null;
}

export async function updateProposalStatus(proposalId: string, status: ProposalStatus): Promise<Proposal | null> {
    if (!ObjectId.isValid(proposalId)) return null;
    const collection = await getCollection<Proposal>(PROPOSALS_COLLECTION);
    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(proposalId) },
        { $set: { status, updatedAt: new Date() } },
        { returnDocument: 'after' }
    );
    return result ? docToProposal(result) : null;
}

export async function rejectOtherProposalsForJob(jobId: string, acceptedProposalId: string): Promise<boolean> {
    if (!ObjectId.isValid(jobId) || !ObjectId.isValid(acceptedProposalId)) return false;
    const collection = await getCollection<Proposal>(PROPOSALS_COLLECTION);
    const result = await collection.updateMany(
        { 
            jobId: jobId, 
            _id: { $ne: new ObjectId(acceptedProposalId) },
            status: 'submitted' // Only reject proposals that are still pending
        },
        { $set: { status: 'rejected', updatedAt: new Date() } }
    );
    return result.acknowledged;
}
