
import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';
import bcrypt from 'bcrypt';

const USERS_COLLECTION = 'users';

// New user roles for booking platform
export type UserRole =
  | 'customer'
  | 'property_owner'
  | 'car_owner'
  | 'tour_operator'
  | 'transfer_provider'
  | 'admin'
  // Legacy roles for backward compatibility
  | 'creator'
  | 'vendor'
  | 'freelancer'
  | 'client'
  | 'transport_partner';

export type MembershipTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface UserPreferences {
  language: string; // default: 'en'
  currency: string; // default: 'USD'
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// This interface represents the data in the database
export interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  roles: UserRole[];
  emailVerified: boolean;
  phoneVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  preferences: UserPreferences;
  loyaltyPoints: number;
  membershipTier: MembershipTier;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
}

// This interface is the clean, serializable object we use in our application code
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Password hash is optional as not all user objects will have it
  phone?: string;
  avatar?: string;
  roles: UserRole[];
  emailVerified: boolean;
  phoneVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: string; // ISO string for serialization
  preferences: UserPreferences;
  loyaltyPoints: number;
  membershipTier: MembershipTier;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
  isSuspended: boolean;
  suspensionReason?: string;
}

function docToUser(doc: UserDocument | null): User | null {
  if (!doc) {
    return null;
  }
  const { _id, emailVerificationExpires, ...rest } = doc;
  return {
    id: _id.toString(),
    ...rest,
    password: rest.password || undefined, // Ensure password is truly undefined if not present
    emailVerificationExpires: emailVerificationExpires?.toISOString(),
  };
}

export async function createUser(
  userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'emailVerified' | 'phoneVerified' | 'loyaltyPoints' | 'membershipTier' | 'isActive' | 'isSuspended' | 'preferences'>
): Promise<User> {
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

  // Generate email verification token
  const verificationToken = generateVerificationToken();
  const verificationExpires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours

  // Default preferences
  const defaultPreferences: UserPreferences = {
    language: 'en',
    currency: 'USD',
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
  };

  const docToInsert = {
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    phone: userData.phone,
    avatar: userData.avatar,
    roles: userData.roles,
    emailVerified: false,
    phoneVerified: false,
    emailVerificationToken: verificationToken,
    emailVerificationExpires: verificationExpires,
    preferences: defaultPreferences,
    loyaltyPoints: 0,
    membershipTier: 'bronze' as MembershipTier,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    lastLoginAt: undefined,
    isActive: true,
    isSuspended: false,
    suspensionReason: undefined,
  };

  const result = await collection.insertOne(docToInsert as any);

  // Return a complete User object
  return {
    id: result.insertedId.toString(),
    ...docToInsert,
    emailVerificationExpires: verificationExpires.toISOString(),
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

// Generate a random verification token
function generateVerificationToken(): string {
  return bcrypt.hashSync(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), 10);
}

// Verify email with token
export async function verifyEmailWithToken(token: string): Promise<User | null> {
  const collection = await getCollection<UserDocument>(USERS_COLLECTION);

  const userDoc = await collection.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!userDoc) {
    return null;
  }

  // Update user to mark email as verified
  await collection.updateOne(
    { _id: userDoc._id },
    {
      $set: {
        emailVerified: true,
        updatedAt: new Date().toISOString(),
      },
      $unset: {
        emailVerificationToken: "",
        emailVerificationExpires: "",
      },
    }
  );

  // Fetch and return updated user
  const updatedDoc = await collection.findOne({ _id: userDoc._id });
  return docToUser(updatedDoc);
}

// Update user's last login time
export async function updateLastLogin(userId: string): Promise<void> {
  const collection = await getCollection<UserDocument>(USERS_COLLECTION);
  await collection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        lastLoginAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }
  );
}

// Get user by ID
export async function getUserById(userId: string): Promise<User | null> {
  const collection = await getCollection<UserDocument>(USERS_COLLECTION);
  const userDoc = await collection.findOne({ _id: new ObjectId(userId) });
  return docToUser(userDoc);
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'name' | 'phone' | 'avatar' | 'preferences'>>
): Promise<User | null> {
  const collection = await getCollection<UserDocument>(USERS_COLLECTION);

  await collection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    }
  );

  const updatedDoc = await collection.findOne({ _id: new ObjectId(userId) });
  return docToUser(updatedDoc);
}

// Resend verification email (generate new token)
export async function resendVerificationEmail(email: string): Promise<{ token: string; user: User } | null> {
  const collection = await getCollection<UserDocument>(USERS_COLLECTION);

  const userDoc = await collection.findOne({ email });
  if (!userDoc || userDoc.emailVerified) {
    return null;
  }

  const verificationToken = generateVerificationToken();
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await collection.updateOne(
    { _id: userDoc._id },
    {
      $set: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: verificationExpires,
        updatedAt: new Date().toISOString(),
      },
    }
  );

  const updatedDoc = await collection.findOne({ _id: userDoc._id });
  const user = docToUser(updatedDoc);

  return user ? { token: verificationToken, user } : null;
}

// Suspend/unsuspend user (admin function)
export async function updateUserStatus(
  userId: string,
  isSuspended: boolean,
  suspensionReason?: string
): Promise<User | null> {
  const collection = await getCollection<UserDocument>(USERS_COLLECTION);

  await collection.updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        isSuspended,
        suspensionReason: isSuspended ? suspensionReason : undefined,
        updatedAt: new Date().toISOString(),
      },
    }
  );

  const updatedDoc = await collection.findOne({ _id: new ObjectId(userId) });
  return docToUser(updatedDoc);
}
