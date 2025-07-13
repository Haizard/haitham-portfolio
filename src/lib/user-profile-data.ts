
import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';
import type { UserRole } from './auth-data';

const FREELANCER_PROFILES_COLLECTION = 'freelancerProfiles';

export type AvailabilityStatus = 'available' | 'busy' | 'not_available';
export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface PortfolioLink {
  _id?: ObjectId;
  id?: string;
  title: string;
  url: string;
}

export interface FreelancerProfile {
  _id?: ObjectId;
  id?: string;
  userId: string; 

  name: string;
  email: string;
  avatarUrl: string;
  roles: UserRole[];
  
  occupation: string;
  bio: string;
  skills: string[];
  portfolioLinks: PortfolioLink[];
  hourlyRate?: number | null;
  availabilityStatus: AvailabilityStatus;
  averageRating?: number;
  reviewCount?: number;
  wishlist?: string[]; 

  storeName: string;
  vendorStatus: VendorStatus;
  isFeatured?: boolean; 

  createdAt: string; 
  updatedAt: string; 
}

function docToFreelancerProfile(doc: any): FreelancerProfile {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return {
    id: _id?.toString(),
    ...rest,
    roles: rest.roles || [], 
    portfolioLinks: (rest.portfolioLinks || []).map((link: any) => ({
        id: link._id?.toString() || link.id || new ObjectId().toString(),
        title: link.title,
        url: link.url,
    })),
    skills: rest.skills || [],
    averageRating: rest.averageRating || 0,
    reviewCount: rest.reviewCount || 0,
    wishlist: rest.wishlist || [],
  } as FreelancerProfile;
}

const defaultFreelancerProfileData = (userId: string): Omit<FreelancerProfile, 'id' | '_id' | 'createdAt' | 'updatedAt'> => ({
  userId,
  name: 'New User',
  email: 'user@example.com',
  roles: [],
  avatarUrl: `https://placehold.co/200x200.png?text=${userId.substring(0,1) || 'U'}`,
  occupation: 'Creative Professional',
  bio: 'Ready to take on new projects!',
  skills: [],
  portfolioLinks: [],
  hourlyRate: null,
  availabilityStatus: 'available',
  averageRating: 0,
  reviewCount: 0,
  wishlist: [],
  storeName: 'My Store',
  vendorStatus: 'pending',
  isFeatured: false,
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
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
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

export async function getFreelancerProfilesByUserIds(userIds: string[]): Promise<FreelancerProfile[]> {
    if (!userIds || userIds.length === 0) {
        return [];
    }
    const collection = await getCollection<FreelancerProfile>(FREELANCER_PROFILES_COLLECTION);
    const profileDocs = await collection.find({ userId: { $in: userIds } }).toArray();
    return profileDocs.map(docToFreelancerProfile);
}


export async function updateFreelancerProfile(userId: string, data: Partial<Omit<FreelancerProfile, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<FreelancerProfile | null> {
  const collection = await getCollection<FreelancerProfile>(FREELANCER_PROFILES_COLLECTION);
  
  const updateData: any = { ...data, updatedAt: new Date().toISOString() };
  
  if (updateData.portfolioLinks) {
    updateData.portfolioLinks = updateData.portfolioLinks.map((link: any) => ({
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

export async function getAllVendorProfiles(filters: { isFeatured?: boolean } = {}): Promise<FreelancerProfile[]> {
    const collection = await getCollection<FreelancerProfile>(FREELANCER_PROFILES_COLLECTION);
    const query: any = { roles: 'vendor' }; // Ensure we only get vendors
    if (filters.isFeatured) {
        query.isFeatured = true;
    }
    const vendorDocs = await collection.find(query).sort({ createdAt: -1 }).toArray();
    return vendorDocs.map(docToFreelancerProfile);
}

export async function updateVendorStatus(vendorId: string, status: VendorStatus): Promise<FreelancerProfile | null> {
    if (!ObjectId.isValid(vendorId)) return null;
    const collection = await getCollection<FreelancerProfile>(FREELANCER_PROFILES_COLLECTION);
    const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(vendorId) },
        { $set: { vendorStatus: status, updatedAt: new Date().toISOString() } },
        { returnDocument: 'after' }
    );
    return result ? docToFreelancerProfile(result) : null;
}

export async function toggleWishlistItem(userId: string, productId: string): Promise<{ wishlist: string[] }> {
  const collection = await getCollection<FreelancerProfile>(FREELANCER_PROFILES_COLLECTION);
  const profile = await collection.findOne({ userId });

  if (!profile) {
    throw new Error("Profile not found");
  }

  const isInWishlist = (profile.wishlist || []).includes(productId);

  const updateOperation = isInWishlist
    ? { $pull: { wishlist: productId } }
    : { $addToSet: { wishlist: productId } };

  const result = await collection.findOneAndUpdate(
    { userId },
    { ...updateOperation, $set: { updatedAt: new Date().toISOString() } },
    { returnDocument: 'after' }
  );
  
  if (!result) {
    throw new Error("Failed to update wishlist.");
  }

  return { wishlist: result.wishlist || [] };
}
