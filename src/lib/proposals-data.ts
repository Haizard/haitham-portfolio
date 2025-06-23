
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';
import { getJobById } from './jobs-data'; // To update job proposal count

const PROPOSALS_COLLECTION = 'proposals';
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

  // After adding proposal, update the job's proposal count (optional, but good for performance)
  // This requires modifying the jobs collection, which is a side-effect.
  // For now we'll just return the proposal. We can add proposal counts later.
  
  return { _id: result.insertedId, id: result.insertedId.toString(), ...docToInsert };
}

export async function getProposalsForJob(jobId: string): Promise<Proposal[]> {
  if (!ObjectId.isValid(jobId)) return [];
  const collection = await getCollection<Proposal>(PROPOSALS_COLLECTION);
  const proposalDocs = await collection.find({ jobId }).sort({ createdAt: -1 }).toArray();
  return proposalDocs.map(docToProposal);
}

export async function getProposalById(id: string): Promise<Proposal | null> {
  if (!ObjectId.isValid(id)) return null;
  const collection = await getCollection<Proposal>(PROPOSALS_COLLECTION);
  const proposalDoc = await collection.findOne({ _id: new ObjectId(id) });
  return proposalDoc ? docToProposal(proposalDoc) : null;
}
