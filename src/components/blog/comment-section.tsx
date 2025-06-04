
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CommentItem, type Comment } from "./comment-item";

const commentFormSchema = z.object({
  commentText: z.string().min(3, "Comment must be at least 3 characters.").max(500, "Comment must be 500 characters or less."),
});

interface CommentSectionProps {
  postId: string;
  initialComments?: Comment[];
}

export function CommentSection({ postId, initialComments = [] }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      commentText: "",
    },
  });

  async function onSubmit(values: z.infer<typeof commentFormSchema>) {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newComment: Comment = {
      id: Math.random().toString(36).substring(2, 15), // Generate a random ID
      author: "Current User", // In a real app, get this from auth
      avatar: "https://placehold.co/50x50.png?text=CU", // Placeholder
      date: new Date().toISOString(),
      text: values.commentText,
    };

    setComments(prevComments => [newComment, ...prevComments]);
    form.reset();
    toast({
      title: "Comment Added!",
      description: "Your comment has been posted.",
    });
    setIsSubmitting(false);
    // In a real app, you would call an API endpoint here:
    // try {
    //   await fetch(`/api/posts/${postId}/comments`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ text: values.commentText }),
    //   });
    //   // Re-fetch comments or update optimistically
    // } catch (error) {
    //   toast({ title: "Error", description: "Failed to post comment.", variant: "destructive" });
    // }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl font-headline">
          <MessageSquare className="h-7 w-7 text-primary" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="commentText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="commentText" className="sr-only">Your Comment</FormLabel>
                  <FormControl>
                    <Textarea
                      id="commentText"
                      placeholder="Write your comment here..."
                      className="min-h-[100px] text-base p-3"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Post Comment"
              )}
            </Button>
          </form>
        </Form>

        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map(comment => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
