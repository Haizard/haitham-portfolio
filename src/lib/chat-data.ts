
import { ObjectId, type Filter } from 'mongodb';
import { getCollection } from './mongodb';

const CHAT_CONVERSATIONS_COLLECTION = 'chat_conversations';
const CHAT_MESSAGES_COLLECTION = 'chat_messages';

// --- Interfaces ---
export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Message {
  _id?: ObjectId;
  id?: string;
  conversationId: string; // Will be ObjectId string
  senderId: string;
  text: string;
  timestamp: Date;
}

export interface Conversation {
  _id?: ObjectId;
  id?: string;
  participantIds: string[];
  lastMessageId?: string | null; // ObjectId string of the last message
  lastMessagePreview?: string;
  lastMessageAt?: Date | null;
  isGroup: boolean;
  groupName?: string;
  groupAvatarUrl?: string;
  // For display purposes, enriched on retrieval
  displayInfo?: {
    name: string;
    avatarUrl?: string;
    unreadCount?: number; // Placeholder for future unread count logic
  };
}

// --- Mock User Data (for display enrichment until full auth) ---
// This is kept separate and simple, not a full user DB.
const mockUsers: Record<string, User> = {
  "user1": { id: "user1", name: "Alice Wonderland", avatarUrl: "https://placehold.co/100x100.png?text=AW" },
  "user2": { id: "user2", name: "Bob The Builder", avatarUrl: "https://placehold.co/100x100.png?text=BB" },
  "user3": { id: "user3", name: "Charlie Creator", avatarUrl: "https://placehold.co/100x100.png?text=CC" },
  "admin": { id: "admin", name: "CreatorOS Admin", avatarUrl: "https://placehold.co/100x100.png?text=AD" },
};

export function getMockUser(userId: string): User | undefined {
    return mockUsers[userId];
}

// --- Helper Functions ---
function docToConversation(doc: any): Conversation {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return {
    id: _id?.toString(),
    ...rest,
    lastMessageId: rest.lastMessageId?.toString() || null,
  } as Conversation;
}

function docToMessage(doc: any): Message {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return {
    id: _id?.toString(),
    conversationId: rest.conversationId?.toString(), // Ensure conversationId is string
    ...rest
  } as Message;
}

// --- Database Functions ---

export async function getConversationsForUser(currentUserId: string): Promise<Conversation[]> {
  const conversationsCollection = await getCollection<Conversation>(CHAT_CONVERSATIONS_COLLECTION);
  const messagesCollection = await getCollection<Message>(CHAT_MESSAGES_COLLECTION);

  const conversationDocs = await conversationsCollection.find({
    participantIds: currentUserId
  }).sort({ lastMessageAt: -1 }).toArray();

  const enrichedConversations = await Promise.all(
    conversationDocs.map(async (doc) => {
      const conv = docToConversation(doc);
      let lastMessageText: string | undefined = conv.lastMessagePreview;
      let lastMessageSenderId: string | undefined;

      if (conv.lastMessageId) {
        const lastMsgDoc = await messagesCollection.findOne({ _id: new ObjectId(conv.lastMessageId) });
        if (lastMsgDoc) {
          lastMessageText = lastMsgDoc.text;
          lastMessageSenderId = lastMsgDoc.senderId;
        }
      }

      let displayName = conv.groupName || "Chat";
      let displayAvatarUrl = conv.groupAvatarUrl;

      if (!conv.isGroup && conv.participantIds.length === 2) {
        const otherParticipantId = conv.participantIds.find(pid => pid !== currentUserId);
        if (otherParticipantId) {
          const otherUser = getMockUser(otherParticipantId);
          displayName = otherUser?.name || "Unknown User";
          displayAvatarUrl = otherUser?.avatarUrl;
        }
      } else if (conv.isGroup) {
        displayName = conv.groupName || "Group Chat";
        displayAvatarUrl = conv.groupAvatarUrl || `https://placehold.co/100x100.png?text=${displayName.substring(0,1) || 'G'}`;
      }
      
      return {
        ...conv,
        lastMessage: conv.lastMessageAt && lastMessageText ? {
          text: lastMessageText,
          timestamp: conv.lastMessageAt.toISOString(),
          senderId: lastMessageSenderId || ""
        } : undefined,
        name: displayName, // Used by ConversationListItem now
        avatarUrl: displayAvatarUrl, // Used by ConversationListItem
        // unreadCount will be 0 for now, real implementation is complex
        unreadCount: Math.random() > 0.7 ? Math.floor(Math.random() * 3) : 0, 
      };
    })
  );
  return enrichedConversations;
}

export async function getMessagesForConversation(conversationId: string): Promise<Message[]> {
  if (!ObjectId.isValid(conversationId)) {
    console.warn(`getMessagesForConversation: Invalid conversationId format: ${conversationId}`);
    return [];
  }
  const messagesCollection = await getCollection<Message>(CHAT_MESSAGES_COLLECTION);
  const messageDocs = await messagesCollection.find({
    conversationId: conversationId // Storing conversationId as string matching the Conversation's ID
  }).sort({ timestamp: 1 }).toArray();

  return messageDocs.map(doc => {
    const message = docToMessage(doc);
    const sender = getMockUser(message.senderId);
    return {
      ...message,
      senderName: sender?.name || 'Unknown Sender',
      senderAvatarUrl: sender?.avatarUrl
    };
  });
}

export async function addMessageToConversation(
  conversationId: string,
  senderId: string,
  text: string
): Promise<Message> {
  if (!ObjectId.isValid(conversationId)) {
    throw new Error("Invalid conversation ID format for adding message.");
  }
  const messagesCollection = await getCollection<Omit<Message, 'id' | '_id'>>(CHAT_MESSAGES_COLLECTION);
  const conversationsCollection = await getCollection<Conversation>(CHAT_CONVERSATIONS_COLLECTION);

  const newMessageDoc: Omit<Message, 'id' | '_id'> = {
    conversationId: conversationId, // Storing as string matching Conversation's ID
    senderId,
    text,
    timestamp: new Date(),
  };

  const result = await messagesCollection.insertOne(newMessageDoc as any);
  const insertedMessageId = result.insertedId;

  await conversationsCollection.updateOne(
    { _id: new ObjectId(conversationId) },
    {
      $set: {
        lastMessageId: insertedMessageId.toString(),
        lastMessagePreview: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
        lastMessageAt: newMessageDoc.timestamp,
        updatedAt: new Date()
      }
    }
  );
  
  const finalMessage = { _id: insertedMessageId, id: insertedMessageId.toString(), ...newMessageDoc };
  const sender = getMockUser(finalMessage.senderId);
  return {
      ...finalMessage,
      senderName: sender?.name || 'Unknown Sender',
      senderAvatarUrl: sender?.avatarUrl
  };
}

export async function createConversation(
  currentUserId: string,
  otherParticipantIds: string[],
  isGroup: boolean = false,
  groupName?: string,
  groupAvatarUrl?: string
): Promise<Conversation> {
  const conversationsCollection = await getCollection<Omit<Conversation, 'id' | '_id'>>(CHAT_CONVERSATIONS_COLLECTION);
  
  const allParticipantIds = Array.from(new Set([currentUserId, ...otherParticipantIds]));
  if (allParticipantIds.length < 2) {
    throw new Error("A conversation requires at least two distinct participants.");
  }

  // Check for existing DM
  if (!isGroup && allParticipantIds.length === 2) {
    const existingDM = await conversationsCollection.findOne({
      isGroup: false,
      participantIds: { $all: allParticipantIds, $size: 2 }
    });
    if (existingDM) {
      return docToConversation(existingDM); // Return existing DM
    }
  }

  const now = new Date();
  const newConversationDoc: Omit<Conversation, 'id' | '_id'> = {
    participantIds: allParticipantIds,
    isGroup,
    groupName: isGroup ? (groupName || "New Group") : undefined,
    groupAvatarUrl: isGroup ? (groupAvatarUrl || `https://placehold.co/100x100.png?text=${(groupName || "G").substring(0,1)}`) : undefined,
    lastMessageAt: now, // Initialize for sorting
    createdAt: now,
    updatedAt: now,
  };

  const result = await conversationsCollection.insertOne(newConversationDoc as any);
  return { id: result.insertedId.toString(), _id: result.insertedId, ...newConversationDoc };
}
