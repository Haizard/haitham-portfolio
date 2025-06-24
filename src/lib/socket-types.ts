
import type { Message as MessageType } from '@/lib/chat-data';

export interface ClientToServerEvents {
  joinConversation: (conversationId: string) => void;
  sendMessage: (data: { conversationId: string; senderId: string; text: string }) => void;
  leaveConversation: (conversationId: string) => void;
}

export interface ServerToClientEvents {
  connect_error: (err: { message: string; data?: any }) => void;
  newMessage: (message: MessageType) => void; 
  conversationJoined: (conversationId: string) => void;
  error: (data: { message: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string; // To store associated user ID with the socket
  currentConversationId?: string;
}
