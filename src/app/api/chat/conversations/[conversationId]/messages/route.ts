
import { NextResponse, type NextRequest } from 'next/server';
import { getMessagesForConversation, addMessageToConversation } from '@/lib/chat-data'; // Updated imports
import { z } from 'zod';
import { ObjectId } from 'mongodb';


export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const conversationId = params.conversationId;
    if (!conversationId || !ObjectId.isValid(conversationId)) {
      return NextResponse.json({ message: "Valid Conversation ID is required" }, { status: 400 });
    }
    // getMessagesForConversation already enriches messages with sender details
    const messages = await getMessagesForConversation(conversationId); 
    return NextResponse.json(messages);
  } catch (error: any) {
    console.error(`[API /api/chat/conversations/${params.conversationId}/messages GET] Error:`, error);
    return NextResponse.json({ message: `Failed to fetch messages: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}

const postMessageSchema = z.object({
  senderId: z.string().min(1, "Sender ID is required."), 
  text: z.string().min(1, "Message text cannot be empty.").max(5000, "Message text is too long."),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const conversationId = params.conversationId;
    if (!conversationId || !ObjectId.isValid(conversationId)) {
      return NextResponse.json({ message: "Valid Conversation ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const validation = postMessageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid message data", errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }
    
    const { senderId, text } = validation.data;
    // addMessageToConversation now handles enrichment
    const newMessage = await addMessageToConversation(conversationId, senderId, text); 

    return NextResponse.json(newMessage, { status: 201 });

  } catch (error: any)
   {
    console.error(`[API /api/chat/conversations/${params.conversationId}/messages POST] Error:`, error);
    return NextResponse.json({ message: `Failed to send message: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
