
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket as useSocketHook } from '@/hooks/use-socket';
import { useSocket as useSocketProvider } from '@/providers/socket-provider';
import { useUser } from '@/hooks/use-user';
import type { Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@/lib/socket-types';
import { ConversationList } from '@/components/chat/conversation-list';
import { MessageView } from '@/components/chat/message-view';
import { MessageInput } from '@/components/chat/message-input';
import type { Conversation, Message as MessageType } from '@/lib/chat-data';
import { Loader2, MessageCircleOff, MessageSquare, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ChatPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const CURRENT_USER_ID = user?.id || "anonymous";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const { toast } = useToast();

  const socket = useSocketHook();
  const { isConnected: isSocketConnected } = useSocketProvider();
  const [isConnected, setIsConnected] = useState(false);

  // Use a ref to track the selected conversation ID to avoid stale closures in socket listeners
  const selectedConversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    setIsConnected(isSocketConnected);
  }, [isSocketConnected]);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversation?.id || null;
  }, [selectedConversation]);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelectConversation = useCallback(async (conversation: Conversation) => {
    if (selectedConversationIdRef.current === conversation.id) return; // Don't re-select the same conversation

    setSelectedConversation(conversation);
    setIsLoadingMessages(true);
    setMessages([]);

    if (socket?.connected && conversation.id) {
      console.log(`Emitting joinConversation for ${conversation.id}`);
      socket.emit('joinConversation', conversation.id);
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
  }, [toast, selectedConversation?.id, socket]);


  useEffect(() => {
    // This effect runs once on mount to fetch data and setup sockets.
    const conversationIdFromUrl = searchParams.get('conversationId');
    const recipientIdFromUrl = searchParams.get('recipientId');

    // Check initial connection state
    if (socket?.connected) {
      setIsConnected(true);
    }

    async function initialize() {
      if (!user?.id) return;

      // 1. Fetch all conversations for the user
      setIsLoadingConversations(true);
      let allConversations: Conversation[] = [];
      try {
        const response = await fetch(`/api/chat/conversations?userId=${user.id}`);
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
      } else if (recipientIdFromUrl) {
        try {
          const createRes = await fetch('/api/chat/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              currentUserId: user.id,
              participantIds: [recipientIdFromUrl]
            })
          });

          if (createRes.ok) {
            const newConv: Conversation = await createRes.json();
            // Add to list if not present
            if (!allConversations.find(c => c.id === newConv.id)) {
              setConversations(prev => [newConv, ...prev]);
            }
            handleSelectConversation(newConv);
          } else {
            toast({ title: "Error", description: "Could not start conversation with user.", variant: "destructive" });
          }
        } catch (err) {
          console.error("Error creating conversation", err);
        }
        router.replace('/chat', { scroll: false });
      } else if (allConversations.length > 0 && !selectedConversation) {
        // Default to selecting first conversation if no specific one is requested and none is selected
        handleSelectConversation(allConversations[0]);
      }
    }

    if (user?.id) {
      initialize();
    }
  }, [searchParams, router, toast, handleSelectConversation, selectedConversation, socket, user?.id]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log('Socket connected:', socket.id);
      setIsConnected(true);
      toast({ title: "Chat Connected", description: "Real-time communication established." });
      // If a conversation is already selected when connection establishes, re-join the room
      if (selectedConversation?.id) {
        socket.emit('joinConversation', selectedConversation.id);
      }
    };

    const handleDisconnect = (reason: string) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      toast({ title: "Chat Disconnected", description: `Reason: ${reason}`, variant: "destructive" });
    };

    const handleConnectError = (err: any) => {
      console.error('Socket connection error:', err.message, err.data || '');
      setIsConnected(false);
      toast({
        title: "Chat Connection Error",
        description: `Could not connect to chat server. Error: ${err.message}.`,
        variant: "destructive",
        duration: 10000,
      });
    };

    const handleNewMessage = (newMessage: MessageType) => {
      console.log('New message received via WebSocket:', newMessage);

      // Update messages for the current conversation in real-time
      if (newMessage.conversationId === selectedConversationIdRef.current) {
        setMessages(prevMessages => [...prevMessages, newMessage]);
      }

      // Update the conversation list (last message preview, timestamp, order)
      setConversations(prevConvs => {
        const targetConv = prevConvs.find(c => c.id === newMessage.conversationId);

        if (!targetConv) {
          console.warn(`Received message for an unknown conversation: ${newMessage.conversationId}`);
          return prevConvs;
        }

        const updatedConv: Conversation = {
          ...targetConv,
          lastMessage: {
            text: newMessage.text,
            timestamp: newMessage.timestamp.toString(),
            senderId: newMessage.senderId,
          },
          lastMessageAt: new Date(newMessage.timestamp),
          unreadCount: newMessage.conversationId !== selectedConversation?.id
            ? (targetConv.unreadCount || 0) + 1
            : 0,
        };

        // Move updated conversation to the top and re-sort
        return [updatedConv, ...prevConvs.filter(c => c.id !== newMessage.conversationId)]
          .sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
      });
    };

    const handleError = (errorData: { message: string }) => {
      toast({ title: "Chat Error", description: errorData.message, variant: "destructive" });
    };

    const handleConversationJoined = (conversationId: string) => {
      console.log(`Successfully joined room for conversation: ${conversationId}`);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('newMessage', handleNewMessage);
    socket.on('error', handleError);
    socket.on('conversationJoined', handleConversationJoined);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('newMessage', handleNewMessage);
      socket.off('error', handleError);
      socket.off('conversationJoined', handleConversationJoined);
    };
  }, [socket, toast, setMessages, setConversations]);


  const handleSendMessage = async (text: string) => {
    if (!selectedConversation || !text.trim() || !user) {
      toast({ title: "Cannot Send", description: "No conversation selected or you are not logged in.", variant: "destructive" });
      return;
    }
    if (!socket || !socket.connected) {
      toast({ title: "Cannot Send", description: "Chat not connected.", variant: "destructive" });
      return;
    }

    const messageData = {
      conversationId: selectedConversation.id!,
      senderId: user.id,
      text: text.trim(),
    };

    socket.emit('sendMessage', messageData);
  };

  if (isUserLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-theme(spacing.24))] text-center p-8 bg-card rounded-lg border shadow-xl">
        <WifiOff className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
        <h2 className="text-xl font-semibold text-muted-foreground">Login Required</h2>
        <p className="text-sm text-muted-foreground mb-6">
          You must be logged in to access the chat and message vendors.
        </p>
        <Button onClick={() => router.push('/login')}>Login Now</Button>
      </div>
    );
  }

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
              currentUserId={user?.id || ""}
            />
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <MessageCircleOff className="h-10 w-10 mx-auto mb-2 opacity-50" />
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
                currentUserId={user?.id || ""}
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
