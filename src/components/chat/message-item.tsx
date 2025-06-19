
"use client";

import type { Message as MessageType, User } from '@/lib/chat-data'; // Renamed Message to MessageType
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageItemProps {
  message: MessageType & { senderName?: string; senderAvatarUrl?: string }; // Allow enriched message
  isCurrentUser: boolean;
}

export function MessageItem({ message, isCurrentUser }: MessageItemProps) {
  const senderName = message.senderName || "User";
  const senderAvatarUrl = message.senderAvatarUrl || `https://placehold.co/100x100.png?text=${senderName.substring(0,1)}`;

  return (
    <div className={cn("flex items-end space-x-2", isCurrentUser ? "justify-end" : "justify-start")}>
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 self-start">
          <AvatarImage src={senderAvatarUrl} alt={senderName} data-ai-hint="chat user avatar" />
          <AvatarFallback>{senderName.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[70%] rounded-xl px-3 py-2 shadow-sm",
          isCurrentUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-secondary text-secondary-foreground rounded-bl-none"
        )}
      >
        {!isCurrentUser && <p className="text-xs font-semibold mb-0.5">{senderName}</p>}
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
        <p className={cn("text-xs mt-1", isCurrentUser ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-left")}>
          {format(new Date(message.timestamp), "p")}
        </p>
      </div>
      {isCurrentUser && (
        <Avatar className="h-8 w-8 self-start">
          {/* In a real app, current user's avatar would come from auth context */}
          <AvatarImage src={`https://placehold.co/100x100.png?text=Me`} alt="You" data-ai-hint="current user avatar" />
          <AvatarFallback>Me</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
