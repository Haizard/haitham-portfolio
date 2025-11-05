import { NextResponse, type NextRequest } from 'next/server';
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // This is a basic middleware. It can be extended later for things like authentication.
  return NextResponse.next();
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!_next|static|favicon.ico).*)',
    // Optional: Skip all API routes
    '/((?!api).*)'
  ],
};
