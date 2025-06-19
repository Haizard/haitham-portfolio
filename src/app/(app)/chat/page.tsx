
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@/lib/socket-types';
import { ConversationList } from '@/components/chat/conversation-list';
import { MessageView } from '@/components/chat/message-view';
import { MessageInput } from '@/components/chat/message-input';
import type { Conversation, Message as MessageType } from '@/lib/chat-data';
import { Loader2, MessageCircleOff, MessageSquare, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CURRENT_USER_ID = "user1";
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

  const fetchConversations = useCallback(async () => {
    setIsLoadingConversations(true);
    try {
      const response = await fetch(`/api/chat/conversations?userId=${CURRENT_USER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data: Conversation[] = await response.json();
      setConversations(data);
    } catch (error: any) {
      toast({ title: "Error", description: `Could not load conversations: ${error.message}`, variant: "destructive" });
      setConversations([]);
    } finally {
      setIsLoadingConversations(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchConversations();
    
    // Initialize Socket.IO connection
    console.log(`Attempting to connect to WebSocket server at ${WEBSOCKET_URL}`);
    const newSocket = io(WEBSOCKET_URL, {
      reconnectionAttempts: 5,
      transports: ['websocket'], // Prefer WebSocket
    });
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
      toast({ title: "Chat Connected", description: "Real-time communication established." });
      // If a conversation was selected before connection, try to join its room
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
        description: `Could not connect to chat server: ${err.message}. Ensure the WebSocket server is running.`,
        variant: "destructive",
        duration: 10000,
      });
    });
    
    newSocket.on('newMessage', (newMessage: MessageType) => {
      console.log('New message received via WebSocket:', newMessage);
      // Add to messages if it's for the currently selected conversation
      if (newMessage.conversationId === selectedConversation?.id) {
        setMessages(prevMessages => [...prevMessages, newMessage]);
      }
      // Update conversation list (last message preview, sort by recency)
      setConversations(prevConvs => {
        const updatedConvs = prevConvs.map(conv => {
          if (conv.id === newMessage.conversationId) {
            return { 
              ...conv, 
              lastMessage: { text: newMessage.text, timestamp: new Date(newMessage.timestamp).toISOString(), senderId: newMessage.senderId },
              lastMessageAt: new Date(newMessage.timestamp) // Ensure this is a Date object for sorting
            };
          }
          return conv;
        });
        // Sort conversations by lastMessageAt, most recent first
        return updatedConvs.sort((a, b) => 
          new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
        );
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
  }, [fetchConversations, selectedConversation?.id]); // Added selectedConversation dependency for re-joining room

  const handleSelectConversation = useCallback(async (conversation: Conversation) => {
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
  }, [toast]);

  const handleSendMessage = async (text: string) => {
    if (!selectedConversation || !text.trim() || !socketRef.current || !socketRef.current.connected) {
      toast({ title: "Cannot Send", description: "No conversation selected or chat not connected.", variant: "destructive" });
      return;
    }

    const messageData = {
      conversationId: selectedConversation.id!,
      senderId: CURRENT_USER_ID,
      text: text.trim(),
    };
    
    // Optimistic UI update can be done here if desired
    // const optimisticMessage: MessageType = { /* ... */ id: `temp-${Date.now()}`, ...messageData, timestamp: new Date() };
    // setMessages(prev => [...prev, optimisticMessage]);

    socketRef.current.emit('sendMessage', messageData);
    console.log('Message sent via WebSocket:', messageData);

    // Note: The server will broadcast the message back, which `newMessage` listener will pick up.
    // If the server doesn't broadcast back to the sender, then handle optimistic update and server ack.
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
              <MessageInput onSendMessage={handleSendMessage} />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageCircleOff className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
              <h2 className="text-xl font-semibold text-muted-foreground">Select a conversation</h2>
              <p className="text-sm text-muted-foreground">
                Choose a conversation from the list to view messages.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
