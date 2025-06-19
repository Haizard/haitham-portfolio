
import { NextResponse, type NextRequest } from 'next/server';
import { getMockMessagesForConversation, addMockMessageToConversation, getMockUser } from '@/lib/chat-data';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const conversationId = params.conversationId;
    if (!conversationId) {
      return NextResponse.json({ message: "Conversation ID is required" }, { status: 400 });
    }
    const messages = await getMockMessagesForConversation(conversationId);
    
    // Optionally enrich messages with sender details if needed by frontend
    const enrichedMessages = messages.map(msg => {
        const sender = getMockUser(msg.senderId);
        return {
            ...msg,
            senderName: sender?.name || 'Unknown Sender',
            senderAvatarUrl: sender?.avatarUrl
        }
    });

    return NextResponse.json(enrichedMessages);
  } catch (error: any) {
    console.error(`[API /api/chat/conversations/${params.conversationId}/messages GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch messages: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}

const postMessageSchema = z.object({
  // In a real app, senderId would come from an authenticated session
  senderId: z.string().min(1, "Sender ID is required."), 
  text: z.string().min(1, "Message text cannot be empty.").max(5000, "Message text is too long."),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const conversationId = params.conversationId;
    if (!conversationId) {
      return NextResponse.json({ message: "Conversation ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const validation = postMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid message data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { senderId, text } = validation.data;
    const newMessage = await addMockMessageToConversation(conversationId, { senderId, text });
    
    const sender = getMockUser(newMessage.senderId);
    const enrichedNewMessage = {
        ...newMessage,
        senderName: sender?.name || 'Unknown Sender',
        senderAvatarUrl: sender?.avatarUrl
    };

    return NextResponse.json(enrichedNewMessage, { status: 201 });

  } catch (error: any) {
    console.error(`[API /api/chat/conversations/${params.conversationId}/messages POST] Error:`, error);
    return NextResponse.json({ message: `Failed to send message: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
