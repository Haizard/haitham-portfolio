
import { NextResponse, type NextRequest } from 'next/server';
import { getConversationsForUser, createConversation } from '@/lib/chat-data'; // Updated imports
import { z } from 'zod';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  // In a real app, userId would come from an authenticated session
  const userId = searchParams.get('userId') || "user1"; // Default to "user1" for now

  try {
    const conversations = await getConversationsForUser(userId); // Updated function call
    return NextResponse.json(conversations);
  } catch (error: any) {
    console.error("[API /api/chat/conversations GET] Error:", error);
    return NextResponse.json({ message: `Failed to fetch conversations: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}

const createConversationSchema = z.object({
  currentUserId: z.string().min(1),
  participantIds: z.array(z.string().min(1)).min(1, "At least one other participant is required."),
  isGroup: z.boolean().optional().default(false),
  groupName: z.string().optional(),
  groupAvatarUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = createConversationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid data for creating conversation", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { currentUserId, participantIds, isGroup, groupName, groupAvatarUrl } = validation.data;

    console.log(`[API /api/chat/conversations POST] Attempting to create conversation. currentUserId: ${currentUserId}, participantIds:`, participantIds);

    // Ensure currentUserId is part of the participants if not explicitly included by client
    const allParticipantIds = Array.from(new Set([currentUserId, ...participantIds]));

    // If it's a DM, otherParticipantIds should effectively be just one ID from the client perspective
    const actualOtherIds = participantIds.filter(id => id !== currentUserId);

    console.log(`[API /api/chat/conversations POST] actualOtherIds:`, actualOtherIds);


    const newConversation = await createConversation(currentUserId, actualOtherIds, isGroup, groupName, groupAvatarUrl); // Updated function call

    if (!newConversation) {
      // This condition might change based on how createConversation handles existing DMs
      return NextResponse.json({ message: "Failed to create conversation. Invalid participants or DM might already exist." }, { status: 400 });
    }
    return NextResponse.json(newConversation, { status: 201 });

  } catch (error: any) {
    console.error("[API /api/chat/conversations POST] Error:", error);
    return NextResponse.json({ message: `Failed to create conversation: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
