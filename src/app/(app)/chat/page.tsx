
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@/lib/socket-types';
import { ConversationList } from '@/components/chat/conversation-list';
import { MessageView } from '@/components/chat/message-view';
import { MessageInput } from '@/components/chat/message-input';
import type { Conversation, Message as MessageType } from '@/lib/chat-data';
import { Loader2, MessageCircleOff, MessageSquare, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CURRENT_USER_ID = "user1"; // Replace with actual authenticated user ID
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:3001';

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelectConversation = useCallback(async (conversation: Conversation) => {
    if (selectedConversation?.id === conversation.id) return; // Don't re-select the same conversation
    
    setSelectedConversation(conversation);
    setIsLoadingMessages(true);
    setMessages([]);
    
    if (socketRef.current?.connected && conversation.id) {
      console.log(`Emitting joinConversation for ${conversation.id}`);
      socketRef.current.emit('joinConversation', conversation.id);
    } else if (conversation.id) {
      console.warn(`Socket not connected, cannot join room for ${conversation.id} yet.`);
    }

    try {
      const response = await fetch(`/api/chat/conversations/${conversation.id}/messages`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data: MessageType[] = await response.json();
      setMessages(data);
    } catch (error: any) {
      toast({ title: "Error", description: `Could not load messages for ${conversation.name}: ${error.message}`, variant: "destructive" });
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [toast, selectedConversation?.id]);


  useEffect(() => {
    // This effect runs once on mount to fetch data and setup sockets.
    const conversationIdFromUrl = searchParams.get('conversationId');
    
    async function initialize() {
        // 1. Fetch all conversations for the user
        setIsLoadingConversations(true);
        let allConversations: Conversation[] = [];
        try {
            const response = await fetch(`/api/chat/conversations?userId=${CURRENT_USER_ID}`);
            if (!response.ok) throw new Error('Failed to fetch conversations');
            allConversations = await response.json();
            setConversations(allConversations);
        } catch (error: any) {
            toast({ title: "Error", description: `Could not load conversations: ${error.message}`, variant: "destructive" });
        } finally {
            setIsLoadingConversations(false);
        }

        // 2. Determine which conversation to select
        if (conversationIdFromUrl) {
            const target = allConversations.find(c => c.id === conversationIdFromUrl);
            if (target) {
                handleSelectConversation(target);
            }
            router.replace('/chat', { scroll: false }); // Clean up URL
        } else if (allConversations.length > 0 && !selectedConversation) {
            // Default to selecting first conversation if no specific one is requested and none is selected
            handleSelectConversation(allConversations[0]);
        }
    }

    initialize();

    // Setup socket connection
    console.log(`Attempting to connect to WebSocket server at ${WEBSOCKET_URL}`);
    const newSocket = io(WEBSOCKET_URL, {
      reconnectionAttempts: 5,
      transports: ['websocket'], 
    });
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      toast({ title: "Chat Connected", description: "Real-time communication established." });
      // If a conversation is already selected when connection establishes, re-join the room
      if (selectedConversation?.id) {
        newSocket.emit('joinConversation', selectedConversation.id);
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      toast({ title: "Chat Disconnected", description: `Reason: ${reason}`, variant: "destructive" });
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message, err.data || '');
      setIsConnected(false);
      toast({
        title: "Chat Connection Error",
        description: `Could not connect to chat server. Ensure the WebSocket server (src/server/socket-server.ts) is running and accessible. Error: ${err.message}.`,
        variant: "destructive",
        duration: 10000,
      });
    });
    
    newSocket.on('newMessage', (newMessage: MessageType) => {
      console.log('New message received via WebSocket:', newMessage);
      // We need to use functional updates for states that depend on previous state inside socket handlers
      setSelectedConversation(currentSelected => {
          if (newMessage.conversationId === currentSelected?.id) {
              setMessages(prevMessages => [...prevMessages, newMessage]);
          }
          return currentSelected;
      });

      setConversations(prevConvs => {
        const targetConv = prevConvs.find(c => c.id === newMessage.conversationId);
        if (targetConv) {
          const updatedConv = {
            ...targetConv,
            lastMessage: {
              text: newMessage.text,
              timestamp: new Date(newMessage.timestamp).toISOString(),
              senderId: newMessage.senderId,
            },
            lastMessageAt: new Date(newMessage.timestamp),
          };
          return [updatedConv, ...prevConvs.filter(c => c.id !== newMessage.conversationId)].sort((a,b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
        }
        return prevConvs;
      });
    });

    newSocket.on('error', (errorData) => {
        toast({ title: "Chat Error", description: errorData.message, variant: "destructive" });
    });
    
    newSocket.on('conversationJoined', (conversationId) => {
        console.log(`Successfully joined room for conversation: ${conversationId}`);
    });

    return () => {
      console.log('Cleaning up socket connection...');
      if (newSocket) {
        newSocket.disconnect();
      }
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleSendMessage = async (text: string) => {
    if (!selectedConversation || !text.trim()) {
      toast({ title: "Cannot Send", description: "No conversation selected or message is empty.", variant: "destructive" });
      return;
    }
    if (!socketRef.current || !socketRef.current.connected) {
      toast({ title: "Cannot Send", description: "Chat not connected. Please ensure WebSocket server is running and client is connected.", variant: "destructive" });
      return;
    }

    const messageData = {
      conversationId: selectedConversation.id!,
      senderId: CURRENT_USER_ID,
      text: text.trim(),
    };
    
    socketRef.current.emit('sendMessage', messageData);
    console.log('Message sent via WebSocket:', messageData);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.24))] border rounded-lg shadow-xl bg-card overflow-hidden">
      <header className="p-4 border-b flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center">
          <MessageSquare className="mr-3 h-7 w-7 text-primary" /> Chat
        </h1>
        <div className="flex items-center gap-2 text-xs">
          {isConnected ? (
            <span className="flex items-center text-green-600"><WifiOff className="h-4 w-4 mr-1 transform rotate-180 scale-x-[-1]" />Connected</span>
          ) : (
            <span className="flex items-center text-red-600"><WifiOff className="h-4 w-4 mr-1" />Disconnected</span>
          )}
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-full md:w-1/3 lg:w-1/4 border-r overflow-y-auto">
          {isLoadingConversations ? (
            <div className="flex justify-center items-center h-full p-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : conversations.length > 0 ? (
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversation?.id}
              onSelectConversation={handleSelectConversation}
              currentUserId={CURRENT_USER_ID}
            />
          ) : (
             <div className="p-4 text-center text-muted-foreground">
                <MessageCircleOff className="h-10 w-10 mx-auto mb-2 opacity-50"/>
                No conversations yet.
            </div>
          )}
        </aside>
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              <MessageView
                conversation={selectedConversation}
                messages={messages}
                isLoading={isLoadingMessages}
                currentUserId={CURRENT_USER_ID}
              />
              <MessageInput onSendMessage={handleSendMessage} disabled={!isConnected} />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              {isLoadingConversations ? (
                  <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
              ) : (
                <>
                <MessageCircleOff className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
                <h2 className="text-xl font-semibold text-muted-foreground">Select a conversation</h2>
                <p className="text-sm text-muted-foreground">
                  Choose a conversation from the list to view messages.
                </p>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
