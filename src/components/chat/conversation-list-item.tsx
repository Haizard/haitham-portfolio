
"use client";

import type { Conversation, User } from '@/lib/chat-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversation: Conversation) => void;
  currentUserId: string;
}

export function ConversationListItem({ conversation, isSelected, onSelect, currentUserId }: ConversationListItemProps) {
  const getDisplayNameAndAvatar = () => {
    if (conversation.isGroup) {
      return { name: conversation.name || "Group Chat", avatarUrl: conversation.avatarUrl || `https://placehold.co/100x100.png?text=${conversation.name?.substring(0,1) || 'G'}` };
    }
    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
    return { 
      name: otherParticipant?.name || "Unknown User", 
      avatarUrl: otherParticipant?.avatarUrl || `https://placehold.co/100x100.png?text=${otherParticipant?.name?.substring(0,1) || 'U'}`
    };
  };

  const { name, avatarUrl } = getDisplayNameAndAvatar();
  const lastMessageText = conversation.lastMessage?.text;
  const lastMessageTimestamp = conversation.lastMessage?.timestamp;

  return (
    <button
      onClick={() => onSelect(conversation)}
      className={cn(
        "w-full text-left p-3 flex items-center space-x-3 hover:bg-muted/50 transition-colors rounded-lg",
        isSelected && "bg-accent text-accent-foreground hover:bg-accent/90"
      )}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={avatarUrl} alt={name} data-ai-hint="user avatar chat list" />
        <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center">
          <h3 className={cn("text-sm font-semibold truncate", isSelected ? "text-accent-foreground" : "text-foreground")}>{name}</h3>
          {lastMessageTimestamp && (
            <span className={cn("text-xs", isSelected ? "text-accent-foreground/80" : "text-muted-foreground")}>
              {formatDistanceToNowStrict(new Date(lastMessageTimestamp), { addSuffix: true })}
            </span>
          )}
        </div>
        <p className={cn("text-xs truncate", isSelected ? "text-accent-foreground/70" : "text-muted-foreground")}>
          {conversation.lastMessage?.senderId === currentUserId ? "You: " : ""}
          {lastMessageText || "No messages yet."}
        </p>
      </div>
      {conversation.unreadCount && conversation.unreadCount > 0 && !isSelected && (
        <span className="ml-auto text-xs bg-primary text-primary-foreground font-semibold rounded-full px-2 py-0.5">
          {conversation.unreadCount}
        </span>
      )}
    </button>
  );
}
