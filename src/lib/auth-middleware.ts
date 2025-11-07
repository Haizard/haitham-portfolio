
import { NextResponse } from 'next/server';
import { getSession } from './session';
import type { UserRole } from './auth-data';

/**
 * Middleware to check if the user is authenticated and has the required role(s)
 * @param requiredRoles - Array of roles that are allowed to access the resource
 * @returns NextResponse with error if unauthorized, or null if authorized
 */
export async function requireAuth(requiredRoles?: UserRole[]): Promise<NextResponse | null> {
  const session = await getSession();
  
  // Check if user is authenticated
  if (!session.user) {
    return NextResponse.json(
      { message: "Unauthorized. Please log in." },
      { status: 401 }
    );
  }
  
  // Check if user has required role (if specified)
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => 
      session.user!.roles.includes(role)
    );
    
    if (!hasRequiredRole) {
      return NextResponse.json(
        { message: "Forbidden. You do not have permission to perform this action." },
        { status: 403 }
      );
    }
  }
  
  // User is authenticated and has required role
  return null;
}

/**
 * Middleware specifically for admin-only routes
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  return requireAuth(['admin']);
}

/**
 * Middleware for vendor routes (admin or vendor)
 */
export async function requireVendor(): Promise<NextResponse | null> {
  return requireAuth(['admin', 'vendor']);
}

