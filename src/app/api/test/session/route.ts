// src/app/api/test/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET(request: NextRequest) {
    try {
        const session = await getSession();

        return NextResponse.json({
            isAuthenticated: !!session.user,
            user: session.user || null,
            cookieHeader: request.headers.get('cookie') ? 'present' : 'missing'
        });
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            isAuthenticated: false
        }, { status: 500 });
    }
}
