
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';

const USER_PROFILES_COLLECTION = 'userProfiles';

export type UserRole = 'client' | 'freelancer' | 'admin';
export type AvailabilityStatus = 'available' | 'busy' | 'not_available';

export interface PortfolioLink {
  _id?: ObjectId; // For MongoDB internal use if subdocument
  id?: string;    // For client-side keying
  title: string;
  url: string;
}

export interface UserProfile {
  _id?: ObjectId;
  id?: string; // String representation of _id, used for API client
  userId: string; // The actual user identifier (e.g., from auth system)

  name: string;
  email: string;
  avatarUrl: string;
  occupation: string;
  bio: string;

  role: UserRole;
  skills: string[];
  portfolioLinks: PortfolioLink[];
  hourlyRate?: number | null;
  availabilityStatus: AvailabilityStatus;

  createdAt: Date;
  updatedAt: Date;
}

function docToUserProfile(doc: any): UserProfile {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return {
    id: _id?.toString(),
    userId: rest.userId,
    ...rest,
    portfolioLinks: (rest.portfolioLinks || []).map((link: any) => ({
        // Ensure sub-documents also get string IDs if they have ObjectIds
        id: link._id?.toString() || link.id || new ObjectId().toString(), 
        title: link.title,
        url: link.url,
    })),
    skills: rest.skills || [],
  } as UserProfile;
}

const defaultProfileData = (userId: string): Omit<UserProfile, 'id' | '_id' | 'createdAt' | 'updatedAt'> => ({
  userId,
  name: 'New User',
  email: 'user@example.com',
  avatarUrl: `https://placehold.co/200x200.png?text=${userId.substring(0,1) || 'U'}`,
  occupation: 'Explorer',
  bio: 'Just starting out on CreatorOS!',
  role: 'freelancer',
  skills: [],
  portfolioLinks: [],
  hourlyRate: null,
  availabilityStatus: 'available',
});

export async function createProfileIfNotExists(userId: string, initialData?: Partial<Omit<UserProfile, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<UserProfile> {
  const collection = await getCollection<UserProfile>(USER_PROFILES_COLLECTION);
  const existingProfile = await collection.findOne({ userId });
  if (existingProfile) {
    return docToUserProfile(existingProfile);
  }

  const now = new Date();
  const profileToInsert: Omit<UserProfile, 'id' | '_id'> = {
    ...defaultProfileData(userId),
    ...initialData,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(profileToInsert as any);
  return docToUserProfile({ _id: result.insertedId, ...profileToInsert });
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const collection = await getCollection<UserProfile>(USER_PROFILES_COLLECTION);
  const profileDoc = await collection.findOne({ userId });
  
  if (!profileDoc) {
    // If profile doesn't exist for this userId, create a default one
    console.log(`Profile for userId ${userId} not found, creating default.`);
    return await createProfileIfNotExists(userId);
  }
  return docToUserProfile(profileDoc);
}

export async function updateUserProfile(userId: string, data: Partial<Omit<UserProfile, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<UserProfile | null> {
  const collection = await getCollection<UserProfile>(USER_PROFILES_COLLECTION);
  
  const updateData = { ...data, updatedAt: new Date() };
  
  // Ensure portfolioLinks have ObjectIds if new, or are handled correctly
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
    { returnDocument: 'after', upsert: false } // Don't upsert here, getUserProfile handles creation
  );

  if (!result) {
    // This case should ideally be handled by prior check or creation logic
    console.warn(`Profile for userId ${userId} not found during update attempt.`);
    return null; 
  }
  return docToUserProfile(result);
}

// Example of how you might get all profiles (e.g., for an admin panel)
export async function getAllUserProfiles(): Promise<UserProfile[]> {
  const collection = await getCollection<UserProfile>(USER_PROFILES_COLLECTION);
  const profileDocs = await collection.find({}).toArray();
  return profileDocs.map(docToUserProfile);
}
