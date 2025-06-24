
"use client";

import { useEffect, useRef } from 'react';
import type { Conversation, Message as MessageType } from '@/lib/chat-data'; // Renamed Message
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageItem } from './message-item';
import { Loader2, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MessageViewProps {
  conversation: Conversation | null;
  messages: MessageType[];
  isLoading: boolean;
  currentUserId: string;
}

export function MessageView({ conversation, messages, isLoading, currentUserId }: MessageViewProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change or new conversation is loaded
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, conversation]);
  
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <MessageCircle className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
        <h2 className="text-xl font-semibold text-muted-foreground">Select a conversation</h2>
        <p className="text-sm text-muted-foreground">
          Choose a conversation from the list to view messages.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="p-3 border-b bg-card flex items-center space-x-3 sticky top-0 z-10">
        <Avatar className="h-9 w-9">
          <AvatarImage src={conversation.avatarUrl} alt={conversation.name} data-ai-hint="chat partner avatar" />
          <AvatarFallback>{conversation.name?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold text-sm">{conversation.name || "Chat"}</h2>
           <p className="text-xs text-muted-foreground">
            {conversation.participants.length} participant{conversation.participants.length === 1 ? '' : 's'}
          </p>
        </div>
      </header>
      <ScrollArea className="flex-1" ref={scrollAreaRef} viewportRef={viewportRef}>
        <div className="p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No messages in this conversation yet. Start chatting!
            </div>
          ) : (
            messages.map(msg => (
              <MessageItem
                key={msg.id}
                message={msg}
                isCurrentUser={msg.senderId === currentUserId}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
