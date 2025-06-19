
"use client";

import type { Conversation } from '@/lib/chat-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ConversationListItem } from './conversation-list-item';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  currentUserId: string;
}

export function ConversationList({ conversations, selectedConversationId, onSelectConversation, currentUserId }: ConversationListProps) {
  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-1">
        {conversations.map(conv => (
          <ConversationListItem
            key={conv.id}
            conversation={conv}
            isSelected={conv.id === selectedConversationId}
            onSelect={onSelectConversation}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
