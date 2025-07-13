
import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic'; // Prevent caching of this route

export async function GET(request: NextRequest) {
  const session = await getSession();
  
  if (session.user) {
    // User is authenticated
    return NextResponse.json({ user: session.user });
  } else {
    // User is not authenticated
    return NextResponse.json({ user: null });
  }
}
