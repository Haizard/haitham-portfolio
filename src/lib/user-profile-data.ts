
import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';

// ARCHITECTURAL NOTE: User Identity vs. Role Profiles
// To support multiple user types (freelancers, clients, shop owners, etc.),
// the database is designed with a central `users` collection for identity
// and separate collections for each role's specific data.
//
// 1. `users` collection: Stores universal data (userId, email, name, password hash, active roles).
// 2. `freelancerProfiles` collection: Stores data ONLY for freelancers (this file).
// 3. `clientProfiles`, `shopOwnerProfiles`, etc.: Would be separate collections.
//
// This file, `user-profile-data.ts`, now exclusively manages the `FreelancerProfile`.
// The generic name is kept for now to avoid breaking existing imports, but its
// contents are now specific to the freelancer role.

const FREELANCER_PROFILES_COLLECTION = 'freelancerProfiles';

// Note: Availability status is specific to freelancers.
export type AvailabilityStatus = 'available' | 'busy' | 'not_available';
export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface PortfolioLink {
  _id?: ObjectId;
  id?: string;
  title: string;
  url: string;
}

// This interface now defines the data specific to a FREELANCER.
export interface FreelancerProfile {
  _id?: ObjectId;
  id?: string;
  userId: string; // Foreign key to the main `users` collection.

  // General info - would eventually live in the `users` collection but is here for now.
  name: string;
  email: string;
  avatarUrl: string;
  
  // Freelancer-specific fields
  occupation: string;
  bio: string;
  skills: string[];
  portfolioLinks: PortfolioLink[];
  hourlyRate?: number | null;
  availabilityStatus: AvailabilityStatus;
  averageRating?: number;
  reviewCount?: number;

  // Vendor-specific fields
  storeName: string;
  vendorStatus: VendorStatus;

  createdAt: Date;
  updatedAt: Date;
}

function docToFreelancerProfile(doc: any): FreelancerProfile {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return {
    id: _id?.toString(),
    ...rest,
    portfolioLinks: (rest.portfolioLinks || []).map((link: any) => ({
        id: link._id?.toString() || link.id || new ObjectId().toString(),
        title: link.title,
        url: link.url,
    })),
    skills: rest.skills || [],
    averageRating: rest.averageRating || 0,
    reviewCount: rest.reviewCount || 0,
  } as FreelancerProfile;
}

const defaultFreelancerProfileData = (userId: string): Omit<FreelancerProfile, 'id' | '_id' | 'createdAt' | 'updatedAt'> => ({
  userId,
  name: 'New Freelancer',
  email: 'freelancer@example.com',
  avatarUrl: `https://placehold.co/200x200.png?text=${userId.substring(0,1) || 'F'}`,
  occupation: 'Creative Professional',
  bio: 'Ready to take on new projects!',
  skills: [],
  portfolioLinks: [],
  hourlyRate: null,
  availabilityStatus: 'available',
  averageRating: 0,
  reviewCount: 0,
  storeName: `${userId}'s Store`,
  vendorStatus: 'pending',
});

export async function createFreelancerProfileIfNotExists(userId: string, initialData?: Partial<Omit<FreelancerProfile, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<FreelancerProfile> {
  const collection = await getCollection<FreelancerProfile>(FREELANCER_PROFILES_COLLECTION);
  const existingProfile = await collection.findOne({ userId });
  if (existingProfile) {
    return docToFreelancerProfile(existingProfile);
  }

  const now = new Date();
  const profileToInsert: Omit<FreelancerProfile, 'id' | '_id'> = {
    ...defaultFreelancerProfileData(userId),
    ...initialData,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(profileToInsert as any);
  return docToFreelancerProfile({ _id: result.insertedId, ...profileToInsert });
}

export async function getFreelancerProfile(userId: string): Promise<FreelancerProfile | null> {
  const collection = await getCollection<FreelancerProfile>(FREELANCER_PROFILES_COLLECTION);
  const profileDoc = await collection.findOne({ userId });
  
  if (!profileDoc) {
    console.log(`Freelancer profile for userId ${userId} not found, creating default.`);
    return await createFreelancerProfileIfNotExists(userId);
  }
  return docToFreelancerProfile(profileDoc);
}

export async function updateFreelancerProfile(userId: string, data: Partial<Omit<FreelancerProfile, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<FreelancerProfile | null> {
  const collection = await getCollection<FreelancerProfile>(FREELANCER_PROFILES_COLLECTION);
  
  const updateData = { ...data, updatedAt: new Date() };
  
  if (updateData.portfolioLinks) {
    updateData.portfolioLinks = updateData.portfolioLinks.map(link => ({
      _id: link.id && ObjectId.isValid(link.id) ? new ObjectId(link.id) : new ObjectId(),
      title: link.title,
      url: link.url,
    }));
  }

  const result = await collection.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { returnDocument: 'after', upsert: false }
  );

  if (!result) {
    console.warn(`Freelancer profile for userId ${userId} not found during update attempt.`);
    return null; 
  }
  return docToFreelancerProfile(result);
}

export async function getAllVendorProfiles(): Promise<FreelancerProfile[]> {
    const collection = await getCollection<FreelancerProfile>(FREELANCER_PROFILES_COLLECTION);
    const vendorDocs = await collection.find({}).sort({ createdAt: -1 }).toArray();
    return vendorDocs.map(docToFreelancerProfile);
}

export async function updateVendorStatus(vendorId: string, status: VendorStatus): Promise<FreelancerProfile | null> {
    if (!ObjectId.isValid(vendorId)) return null;
    const collection = await getCollection<FreelancerProfile>(FREELANCER_PROFILES_COLLECTION);
    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(vendorId) },
        { $set: { vendorStatus: status, updatedAt: new Date() } },
        { returnDocument: 'after' }
    );
    return result ? docToFreelancerProfile(result) : null;
}
