// src/scripts/test-session.ts
/**
 * Quick test script to check if the current session is working
 * Run this to see if you're logged in
 */

import { getSession } from '@/lib/session';

export async function testSession() {
    try {
        const session = await getSession();
        console.log('Session check:', {
            isLoggedIn: !!session.user,
            user: session.user ? {
                id: session.user.id,
                email: session.user.email,
                name: session.user.name,
                roles: session.user.roles
            } : null
        });
        return session.user;
    } catch (error) {
        console.error('Session test error:', error);
        return null;
    }
}
