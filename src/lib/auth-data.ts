
import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';
import bcrypt from 'bcryptjs';

const USERS_COLLECTION = 'users';

export type UserRole = 'admin' | 'creator' | 'vendor' | 'freelancer' | 'client';

export interface User {
  _id?: ObjectId;
  id?: string;
  name: string;
  email: string;
  password?: string; // Will be the hashed password
  roles: UserRole[];
  createdAt: string; 
}

function docToUser(doc: any): User {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest } as User;
}

export async function createUser(userData: Omit<User, 'id' | '_id' | 'createdAt'>): Promise<Omit<User, 'password' | '_id'>> {
  const collection = await getCollection<Omit<User, 'id' | '_id'>>(USERS_COLLECTION);

  const existingUser = await collection.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error("User with this email already exists.");
  }
  if (!userData.password) {
    throw new Error("Password is required to create a user.");
  }

  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const now = new Date();
  
  // Ensure 'creator' is added if 'freelancer' or 'vendor' are present, without removing other roles.
  const baseRoles = new Set(userData.roles);
  if (baseRoles.has('freelancer') || baseRoles.has('vendor')) {
    baseRoles.add('creator');
  }
  const finalRoles = Array.from(baseRoles);


  const docToInsert = {
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    roles: finalRoles,
    createdAt: now.toISOString(),
  };

  const result = await collection.insertOne(docToInsert as any);
  
  const { password, ...userWithoutPassword } = docToInsert;

  return { 
    id: result.insertedId.toString(), 
    ...userWithoutPassword 
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const collection = await getCollection<User>(USERS_COLLECTION);
    const userDoc = await collection.findOne({ email });
    return userDoc ? docToUser(userDoc) : null;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// This function should be used carefully, only for server-side logic
// where the full user object including password hash is needed.
export async function getFullUserByEmail(email: string): Promise<User | null> {
    const collection = await getCollection<User>(USERS_COLLECTION);
    const userDoc = await collection.findOne({ email });
    return userDoc ? docToUser(userDoc) : null;
}
