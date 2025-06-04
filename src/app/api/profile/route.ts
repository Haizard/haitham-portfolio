import { NextResponse } from 'next/server';

// Mock database
let userProfile = {
  name: 'Alex Creator',
  email: 'alex.creator@example.com',
  bio: 'Passionate content creator focusing on tech reviews and tutorials. Always exploring new gadgets and software to share with my audience. Co-founder of CreatorOS.',
  avatarUrl: 'https://placehold.co/200x200.png',
  occupation: 'Tech Reviewer & SaaS Founder',
};

export async function GET() {
  // In a real application, you would fetch this data from your database
  // For example, using Prisma, Supabase, Firebase, etc.
  // const userId = await getUserIdFromSession(); // (example auth helper)
  // const profile = await db.user.findUnique({ where: { id: userId } });

  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json(userProfile);
}

export async function POST(request: Request) {
  // In a real application, you would update this data in your database
  // const userId = await getUserIdFromSession(); // (example auth helper)
  const body = await request.json();
  
  // Basic validation (you'd want more robust validation)
  if (!body.name || !body.email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }

  userProfile = {
    ...userProfile,
    name: body.name,
    email: body.email,
    bio: body.bio || userProfile.bio,
    occupation: body.occupation || userProfile.occupation,
    // avatarUrl might be handled by a separate file upload endpoint
  };
  
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json(userProfile);
}
