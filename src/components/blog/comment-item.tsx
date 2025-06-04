
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  date: string;
  text: string;
}

interface CommentItemProps {
  comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
  return (
    <Card className="bg-secondary/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.avatar} alt={comment.author} data-ai-hint="user avatar" />
            <AvatarFallback>{comment.author.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-sm">{comment.author}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(comment.date).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{comment.text}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
