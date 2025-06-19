
import { NextResponse, type NextRequest } from 'next/server';
import { getMockConversations, createMockConversation } from '@/lib/chat-data';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // In a real app, userId would come from an authenticated session
  const userId = searchParams.get('userId') || "user1"; // Default to "user1" for mock

  try {
    const conversations = await getMockConversations(userId);
    return NextResponse.json(conversations);
  } catch (error: any) {
    console.error("[API /api/chat/conversations GET] Error:", error);
    return NextResponse.json({ message: `Failed to fetch conversations: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}

const createConversationSchema = z.object({
  currentUserId: z.string().min(1), // In real app, this comes from session
  participantIds: z.array(z.string().min(1)).min(1, "At least one other participant is required."),
  isGroup: z.boolean().optional().default(false),
  groupName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createConversationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid data for creating conversation", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { currentUserId, participantIds, isGroup, groupName } = validation.data;

    const newConversation = await createMockConversation(currentUserId, participantIds, isGroup, groupName);

    if (!newConversation) {
      return NextResponse.json({ message: "Failed to create conversation. Invalid participants or existing DM." }, { status: 400 });
    }
    return NextResponse.json(newConversation, { status: 201 });

  } catch (error: any) {
    console.error("[API /api/chat/conversations POST] Error:", error);
    return NextResponse.json({ message: `Failed to create conversation: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
