
import { NextResponse, type NextRequest } from 'next/server';
import { destroySession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    await destroySession();
    return NextResponse.json({ message: "Logged out successfully." });
  } catch (error: any) {
    console.error("[API /logout POST] Error:", error);
    return NextResponse.json({ message: "Failed to log out." }, { status: 500 });
  }
}
