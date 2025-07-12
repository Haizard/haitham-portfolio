
import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';

const CLIENT_PROFILES_COLLECTION = 'clientProfiles';

export interface ClientProfile {
  _id?: ObjectId;
  id?: string;
  userId: string; // Foreign key to a potential central 'users' collection

  // Client-specific fields
  name: string; // Can be company or individual name
  avatarUrl: string;
  location?: string;
  paymentVerified: boolean;
  projectsPosted: number;
  totalSpent: number; // Sum of all job budgets paid out
  averageRating?: number;
  reviewCount?: number;
  
  createdAt: string; // Changed from Date
  updatedAt: string; // Changed from Date
}

function docToClientProfile(doc: any): ClientProfile {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return {
    id: _id?.toString(),
    ...rest,
    averageRating: rest.averageRating || 0,
    reviewCount: rest.reviewCount || 0,
    paymentVerified: rest.paymentVerified !== undefined ? rest.paymentVerified : true, // Default to true for seeded data
    projectsPosted: rest.projectsPosted || 0,
    totalSpent: rest.totalSpent || 0,
  } as ClientProfile;
}

const defaultClientProfileData = (userId: string): Omit<ClientProfile, 'id' | '_id' | 'createdAt' | 'updatedAt'> => ({
  userId,
  name: `Client ${userId.substring(0, 4)}`,
  avatarUrl: `https://placehold.co/200x200.png?text=C`,
  location: "United States",
  paymentVerified: true,
  projectsPosted: 0,
  totalSpent: 0,
  averageRating: 0,
  reviewCount: 0,
});

export async function createClientProfileIfNotExists(userId: string, initialData?: Partial<Omit<ClientProfile, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<ClientProfile> {
  const collection = await getCollection<ClientProfile>(CLIENT_PROFILES_COLLECTION);
  const existingProfile = await collection.findOne({ userId });
  if (existingProfile) {
    return docToClientProfile(existingProfile);
  }

  const now = new Date();
  const profileToInsert: Omit<ClientProfile, 'id' | '_id'> = {
    ...defaultClientProfileData(userId),
    ...initialData,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const result = await collection.insertOne(profileToInsert as any);
  return docToClientProfile({ _id: result.insertedId, ...profileToInsert });
}

export async function getClientProfile(userId: string): Promise<ClientProfile | null> {
  const collection = await getCollection<ClientProfile>(CLIENT_PROFILES_COLLECTION);
  const profileDoc = await collection.findOne({ userId });
  
  if (!profileDoc) {
    return await createClientProfileIfNotExists(userId);
  }
  return docToClientProfile(profileDoc);
}


export async function updateClientProfile(userId: string, data: Partial<Omit<ClientProfile, 'id' | '_id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<ClientProfile | null> {
  const collection = await getCollection<ClientProfile>(CLIENT_PROFILES_COLLECTION);
  
  const updateData = { ...data, updatedAt: new Date().toISOString() };
  
  const result = await collection.findOneAndUpdate(
    { userId },
    { $set: updateData },
    { returnDocument: 'after', upsert: true } // Upsert to create if it doesn't exist during an update
  );

  if (!result) {
    return null; 
  }
  return docToClientProfile(result);
}
