
import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';
import bcrypt from 'bcrypt';

const USERS_COLLECTION = 'users';

export type UserRole = 'admin' | 'creator' | 'vendor' | 'freelancer' | 'client' | 'delivery_agent';

// This interface represents the data in the database
export interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string;
  password?: string;
  roles: UserRole[];
  createdAt: string; 
}

// This interface is the clean, serializable object we use in our application code
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Password hash is optional as not all user objects will have it
  roles: UserRole[];
  createdAt: string;
}

function docToUser(doc: UserDocument | null): User | null {
  if (!doc) {
    return null;
  }
  const { _id, ...rest } = doc;
  return {
    id: _id.toString(),
    ...rest,
    password: rest.password || undefined, // Ensure password is truly undefined if not present
  };
}

export async function createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  const collection = await getCollection<Omit<UserDocument, '_id'>>(USERS_COLLECTION);

  const existingUser = await collection.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error("User with this email already exists.");
  }
  if (!userData.password) {
    throw new Error("Password is required to create a user.");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const now = new Date();
  
  // The 'roles' field from userData will now be an array with a single role.
  const finalRoles = userData.roles;

  const docToInsert: Omit<User, 'id'> = {
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    roles: finalRoles,
    createdAt: now.toISOString(),
  };

  const result = await collection.insertOne(docToInsert as any);

  // Return a complete User object, including the new ID and final roles.
  return { 
    id: result.insertedId.toString(),
    ...docToInsert,
  };
}


export async function findUserByEmail(email: string): Promise<User | null> {
    const collection = await getCollection<UserDocument>(USERS_COLLECTION);
    const userDoc = await collection.findOne({ email });
    return docToUser(userDoc);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// This function should be used carefully, only for server-side logic
// where the full user object including password hash is needed.
export async function getFullUserByEmail(email: string): Promise<User | null> {
    const collection = await getCollection<UserDocument>(USERS_COLLECTION);
    const userDoc = await collection.findOne({ email });
    return docToUser(userDoc);
}
