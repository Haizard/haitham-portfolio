
import { NextResponse, type NextRequest } from 'next/server';
import { createUser, type UserRole } from '@/lib/auth-data';
import { getSession, type SessionUser } from '@/lib/session';
import { z } from 'zod';
import { createFreelancerProfileIfNotExists } from '@/lib/user-profile-data';
import { createClientProfileIfNotExists } from '@/lib/client-profile-data';
import { sendVerificationEmail } from '@/lib/email';

// Updated role enum to include new booking platform roles
const roleEnum = z.enum([
  'customer',
  'property_owner',
  'car_owner',
  'tour_operator',
  'transfer_provider',
  // Legacy roles for backward compatibility
  'client',
  'freelancer',
  'vendor',
  'transport_partner',
  'creator'
], {
    required_error: "You must select a role."
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().optional(),
  role: roleEnum,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = signupSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid signup data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password, phone, role } = validation.data;

    // The roles array will now contain just the single selected role.
    const roles: UserRole[] = [role];

    // Step 1: Create the core user account with new fields
    const createdUser = await createUser({ name, email, password, phone, roles });

    // Step 2: Create associated profiles for legacy roles
    // Every user gets a client profile (for backward compatibility)
    await createClientProfileIfNotExists(createdUser.id, { name, email });

    // Users with roles other than 'client' and 'customer' ALSO get a freelancer profile
    if (role !== 'client' && role !== 'customer') {
        await createFreelancerProfileIfNotExists(createdUser.id, { name, email, roles: createdUser.roles, storeName: `${name}'s Store` });
    }

    // Step 3: Send verification email
    if (createdUser.emailVerificationToken) {
      await sendVerificationEmail(email, createdUser.emailVerificationToken, name);
    }

    // Step 4: Construct a clean, serializable session user object.
    const sessionUser: SessionUser = {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      avatar: createdUser.avatar,
      roles: createdUser.roles,
      emailVerified: createdUser.emailVerified,
      phoneVerified: createdUser.phoneVerified,
      membershipTier: createdUser.membershipTier,
      createdAt: createdUser.createdAt,
    };

    // Step 5: Get session, update it, and save.
    const session = await getSession();
    session.user = sessionUser;
    await session.save();

    // Return the session user object and verification status
    return NextResponse.json({
      user: sessionUser,
      message: "Account created successfully! Please check your email to verify your account.",
      requiresEmailVerification: true,
    });

  } catch (error: any) {
    if (error.message.includes('already exists')) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    console.error("[API /signup POST] Error:", error);
    return NextResponse.json({ message: `Signup failed: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
