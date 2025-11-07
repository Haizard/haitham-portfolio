// Role-Based Access Control (RBAC) utilities
import { NextResponse } from 'next/server';
import { getSession, type SessionUser } from './session';
import type { UserRole } from './auth-data';

/**
 * Check if user has any of the required roles
 */
export function hasRole(user: SessionUser | undefined, allowedRoles: UserRole[]): boolean {
  if (!user) return false;
  return user.roles.some(role => allowedRoles.includes(role));
}

/**
 * Check if user has all of the required roles
 */
export function hasAllRoles(user: SessionUser | undefined, requiredRoles: UserRole[]): boolean {
  if (!user) return false;
  return requiredRoles.every(role => user.roles.includes(role));
}

/**
 * Check if user is an admin
 */
export function isAdmin(user: SessionUser | undefined): boolean {
  return hasRole(user, ['admin']);
}

/**
 * Check if user is a customer
 */
export function isCustomer(user: SessionUser | undefined): boolean {
  return hasRole(user, ['customer', 'client']); // Include legacy 'client' role
}

/**
 * Check if user is a property owner
 */
export function isPropertyOwner(user: SessionUser | undefined): boolean {
  return hasRole(user, ['property_owner']);
}

/**
 * Check if user is a car owner
 */
export function isCarOwner(user: SessionUser | undefined): boolean {
  return hasRole(user, ['car_owner']);
}

/**
 * Check if user is a tour operator
 */
export function isTourOperator(user: SessionUser | undefined): boolean {
  return hasRole(user, ['tour_operator', 'creator']); // Include legacy 'creator' role
}

/**
 * Check if user is a transfer provider
 */
export function isTransferProvider(user: SessionUser | undefined): boolean {
  return hasRole(user, ['transfer_provider', 'transport_partner']); // Include legacy role
}

/**
 * Check if user is any type of service provider
 */
export function isServiceProvider(user: SessionUser | undefined): boolean {
  return hasRole(user, [
    'property_owner',
    'car_owner',
    'tour_operator',
    'transfer_provider',
    'vendor',
    'freelancer',
    'creator',
  ]);
}

/**
 * Middleware to require authentication
 * Returns the authenticated user or an error response
 */
export async function requireAuth(): Promise<{ user: SessionUser } | NextResponse> {
  const session = await getSession();
  
  if (!session.user) {
    return NextResponse.json(
      { message: 'Authentication required. Please log in.' },
      { status: 401 }
    );
  }

  return { user: session.user };
}

/**
 * Middleware to require specific roles
 * Returns the authenticated user or an error response
 */
export async function requireRoles(allowedRoles: UserRole[]): Promise<{ user: SessionUser } | NextResponse> {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  if (!hasRole(user, allowedRoles)) {
    return NextResponse.json(
      { message: 'Access denied. You do not have permission to access this resource.' },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Middleware to require email verification
 * Returns the authenticated user or an error response
 */
export async function requireEmailVerification(): Promise<{ user: SessionUser } | NextResponse> {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  if (!user.emailVerified) {
    return NextResponse.json(
      { 
        message: 'Email verification required. Please verify your email address to continue.',
        requiresEmailVerification: true,
      },
      { status: 403 }
    );
  }

  return { user };
}

/**
 * Middleware to require admin role
 */
export async function requireAdmin(): Promise<{ user: SessionUser } | NextResponse> {
  return requireRoles(['admin']);
}

/**
 * Middleware to require customer role
 */
export async function requireCustomer(): Promise<{ user: SessionUser } | NextResponse> {
  return requireRoles(['customer', 'client']);
}

/**
 * Middleware to require property owner role
 */
export async function requirePropertyOwner(): Promise<{ user: SessionUser } | NextResponse> {
  return requireRoles(['property_owner']);
}

/**
 * Middleware to require car owner role
 */
export async function requireCarOwner(): Promise<{ user: SessionUser } | NextResponse> {
  return requireRoles(['car_owner']);
}

/**
 * Middleware to require tour operator role
 */
export async function requireTourOperator(): Promise<{ user: SessionUser } | NextResponse> {
  return requireRoles(['tour_operator', 'creator']);
}

/**
 * Middleware to require transfer provider role
 */
export async function requireTransferProvider(): Promise<{ user: SessionUser } | NextResponse> {
  return requireRoles(['transfer_provider', 'transport_partner']);
}

/**
 * Middleware to require service provider role (any type)
 */
export async function requireServiceProvider(): Promise<{ user: SessionUser } | NextResponse> {
  return requireRoles([
    'property_owner',
    'car_owner',
    'tour_operator',
    'transfer_provider',
    'vendor',
    'freelancer',
    'creator',
  ]);
}

/**
 * Check if user owns a resource
 * This is a helper function to check resource ownership
 */
export function isResourceOwner(user: SessionUser | undefined, resourceOwnerId: string): boolean {
  if (!user) return false;
  return user.id === resourceOwnerId;
}

/**
 * Middleware to require resource ownership or admin role
 */
export async function requireOwnershipOrAdmin(resourceOwnerId: string): Promise<{ user: SessionUser } | NextResponse> {
  const authResult = await requireAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const { user } = authResult;

  if (!isResourceOwner(user, resourceOwnerId) && !isAdmin(user)) {
    return NextResponse.json(
      { message: 'Access denied. You do not have permission to access this resource.' },
      { status: 403 }
    );
  }

  return { user };
}

