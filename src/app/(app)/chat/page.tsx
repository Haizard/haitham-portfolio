
"use client";

import { useEffect, useState, useCallback } from 'react';
import { ConversationList } from '@/components/chat/conversation-list';
import { MessageView } from '@/components/chat/message-view';
import { MessageInput } from '@/components/chat/message-input';
import type { Conversation, Message as MessageType, User } from '@/lib/chat-data'; // Renamed Message to MessageType
import { Loader2, MessageCircleOff, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// For this basic version, we'll hardcode the current user.
// In a real app, this would come from an authentication context.
const CURRENT_USER_ID = "user1"; 

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const { toast } = useToast();

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
  }, [fetchConversations]);

  const handleSelectConversation = useCallback(async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setIsLoadingMessages(true);
    setMessages([]);
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
    if (!selectedConversation || !text.trim()) return;

    const optimisticMessage: MessageType = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: CURRENT_USER_ID,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      // These will be enriched by API response, but good for optimistic UI
      senderName: "You", 
      senderAvatarUrl: "" // Add current user avatar from auth context in real app
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const response = await fetch(`/api/chat/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: CURRENT_USER_ID, text: text.trim() }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
      const sentMessage: MessageType = await response.json();
      
      // Replace optimistic message with actual message from server
      setMessages(prev => prev.map(msg => msg.id === optimisticMessage.id ? sentMessage : msg));

      // Update the last message in the conversation list for immediate feedback
      setConversations(prevConvs => prevConvs.map(conv => 
        conv.id === selectedConversation.id 
        ? { ...conv, lastMessage: { text: sentMessage.text, timestamp: sentMessage.timestamp, senderId: sentMessage.senderId } }
        : conv
      ).sort((a,b) => new Date(b.lastMessage?.timestamp || 0).getTime() - new Date(a.lastMessage?.timestamp || 0).getTime()));


    } catch (error: any) {
      toast({ title: "Error Sending Message", description: error.message, variant: "destructive" });
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.24))] border rounded-lg shadow-xl bg-card overflow-hidden">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold tracking-tight font-headline flex items-center">
          <MessageSquare className="mr-3 h-7 w-7 text-primary" /> Chat
        </h1>
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
