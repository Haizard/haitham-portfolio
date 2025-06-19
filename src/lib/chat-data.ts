
export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string; // ISO string
}

export interface Conversation {
  id:string;
  participants: User[]; // Array of User objects
  lastMessage?: Pick<Message, 'text' | 'timestamp' | 'senderId'>;
  unreadCount?: number;
  name?: string; // For group chats or custom names
  isGroup?: boolean;
  avatarUrl?: string; // For group chats or if it's a DM, the other person's avatar
}

// --- Mock Data ---

const mockUsers: Record<string, User> = {
  "user1": { id: "user1", name: "Alice Wonderland", avatarUrl: "https://placehold.co/100x100.png?text=AW" },
  "user2": { id: "user2", name: "Bob The Builder", avatarUrl: "https://placehold.co/100x100.png?text=BB" },
  "user3": { id: "user3", name: "Charlie Creator", avatarUrl: "https://placehold.co/100x100.png?text=CC" },
  "admin": { id: "admin", name: "CreatorOS Admin", avatarUrl: "https://placehold.co/100x100.png?text=AD" },
};

let mockMessages: Record<string, Message[]> = {
  "conv1": [
    { id: "msg1", conversationId: "conv1", senderId: "user1", text: "Hey Bob, how's the new project coming along?", timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString() },
    { id: "msg2", conversationId: "conv1", senderId: "user2", text: "Hey Alice! It's going well, a bit challenging but exciting.", timestamp: new Date(Date.now() - 4 * 60 * 1000).toISOString() },
    { id: "msg3", conversationId: "conv1", senderId: "user1", text: "Great to hear! Let me know if you need any help.", timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString() },
  ],
  "conv2": [
    { id: "msg4", conversationId: "conv2", senderId: "user3", text: "Admin, I have a question about my billing.", timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
    { id: "msg5", conversationId: "conv2", senderId: "admin", text: "Hi Charlie, sure, what's your question?", timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString() },
  ],
  "conv3": [
    { id: "msg6", conversationId: "conv3", senderId: "user1", text: "Hi Admin, just wanted to say the platform is great!", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  ]
};

let mockConversations: Conversation[] = [
  {
    id: "conv1",
    participants: [mockUsers["user1"], mockUsers["user2"]],
    lastMessage: { text: "Great to hear! Let me know if you need any help.", timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(), senderId: "user1" },
    unreadCount: 1,
    name: "Bob The Builder", // For DM, set to other participant's name
    avatarUrl: mockUsers["user2"].avatarUrl,
    isGroup: false,
  },
  {
    id: "conv2",
    participants: [mockUsers["user3"], mockUsers["admin"]],
    lastMessage: { text: "Hi Charlie, sure, what's your question?", timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString(), senderId: "admin" },
    unreadCount: 0,
    name: "CreatorOS Admin",
    avatarUrl: mockUsers["admin"].avatarUrl,
    isGroup: false,
  },
  {
    id: "conv3",
    participants: [mockUsers["user1"], mockUsers["admin"]],
    lastMessage: { text: "Hi Admin, just wanted to say the platform is great!", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), senderId: "user1" },
    name: "CreatorOS Admin (Support)",
    avatarUrl: mockUsers["admin"].avatarUrl,
    isGroup: false,
  }
];

// --- Mock Functions ---

export function getMockUser(userId: string): User | undefined {
    return mockUsers[userId];
}

export async function getMockConversations(currentUserId: string): Promise<Conversation[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  // Filter conversations where the currentUserId is a participant
  return mockConversations
    .filter(conv => conv.participants.some(p => p.id === currentUserId))
    .map(conv => {
      // If it's a DM, set name and avatar to the *other* participant for display purposes
      if (!conv.isGroup && conv.participants.length === 2) {
        const otherParticipant = conv.participants.find(p => p.id !== currentUserId);
        return {
          ...conv,
          name: otherParticipant?.name || conv.name,
          avatarUrl: otherParticipant?.avatarUrl || conv.avatarUrl,
        };
      }
      return conv;
    })
    .sort((a, b) => new Date(b.lastMessage?.timestamp || 0).getTime() - new Date(a.lastMessage?.timestamp || 0).getTime());
}

export async function getMockMessagesForConversation(conversationId: string): Promise<Message[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockMessages[conversationId] || [];
}

export async function addMockMessageToConversation(
  conversationId: string,
  messageData: Omit<Message, 'id' | 'conversationId' | 'timestamp'> & { text: string; senderId: string }
): Promise<Message> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const newMessage: Message = {
    id: `msg${Date.now()}-${Math.random().toString(16).slice(2)}`,
    conversationId,
    senderId: messageData.senderId,
    text: messageData.text,
    timestamp: new Date().toISOString(),
  };

  if (!mockMessages[conversationId]) {
    mockMessages[conversationId] = [];
  }
  mockMessages[conversationId].push(newMessage);

  // Update last message in conversation
  const convIndex = mockConversations.findIndex(c => c.id === conversationId);
  if (convIndex > -1) {
    mockConversations[convIndex].lastMessage = {
      text: newMessage.text,
      timestamp: newMessage.timestamp,
      senderId: newMessage.senderId,
    };
    // Move conversation to top
    const updatedConv = mockConversations.splice(convIndex, 1)[0];
    mockConversations.unshift(updatedConv);
  }
  
  return newMessage;
}

export async function createMockConversation(currentUserId: string, participantIds: string[], isGroup: boolean = false, groupName?: string): Promise<Conversation | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const allParticipantIds = Array.from(new Set([currentUserId, ...participantIds]));
    if (allParticipantIds.length < 2) return null; // Need at least two distinct participants

    const participants: User[] = allParticipantIds.map(id => mockUsers[id]).filter(Boolean) as User[];
    if (participants.length !== allParticipantIds.length) return null; // Some user IDs were invalid

    // Check if a DM conversation already exists between two users
    if (!isGroup && participants.length === 2) {
        const existingConv = mockConversations.find(c => 
            !c.isGroup &&
            c.participants.length === 2 &&
            c.participants.every(p => allParticipantIds.includes(p.id))
        );
        if (existingConv) return existingConv;
    }
    
    const newConversationId = `conv${Date.now()}`;
    const newConversation: Conversation = {
        id: newConversationId,
        participants,
        isGroup,
        name: isGroup ? (groupName || "New Group") : undefined, // Name for group, undefined for DM for now (will be set by getMockConversations)
        // avatarUrl: isGroup ? 'https://placehold.co/100x100.png?text=GRP' : undefined,
    };
    mockConversations.unshift(newConversation);
    mockMessages[newConversationId] = [];
    return newConversation;
}
