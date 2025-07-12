
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit3, Trash2, Loader2, FileText, Eye, CalendarDays, User, Folder, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { BlogPost } from '@/lib/blog-data'; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user'; // To get current user

export function VendorPostListManagement() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postToDelete, setPostToDelete] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();

  const fetchPosts = useCallback(async () => {
    if (!user) return; // Don't fetch if user is not loaded
    setIsLoading(true);
    try {
      const response = await fetch(`/api/blog?authorId=${user.id}&enriched=true`); 
      if (!response.ok) throw new Error('Failed to fetch your posts');
      const data: BlogPost[] = await response.json();
      setPosts(data);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not load your posts.", variant: "destructive" });
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const confirmDeletePost = (post: BlogPost) => {
    setPostToDelete(post);
  };

  const handleDeletePost = async () => {
    if (!postToDelete || !postToDelete.slug) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/blog/${postToDelete.slug}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete post`);
      }
      toast({ title: `Post Deleted`, description: `"${postToDelete.title}" has been removed.` });
      fetchPosts(); 
    } catch (error: any) {
      toast({ title: "Error", description: error.message || `Could not delete post.`, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setPostToDelete(null);
    }
  };

  const handleEditPost = (slug: string) => {
    router.push(`/content-studio?editSlug=${slug}`);
  };

  const handleCreatePost = () => {
      router.push('/content-studio');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card className="shadow-xl mb-8">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <CardTitle className="text-2xl font-headline flex items-center"><FileText className="mr-2 h-6 w-6 text-primary"/>Your Authored Blog Posts</CardTitle>
                <CardDescription>View, manage, and create new posts for your store.</CardDescription>
            </div>
             <Button onClick={handleCreatePost} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
                <PlusCircle className="mr-2 h-5 w-5" /> Create New Post
            </Button>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">You haven't created any posts yet. Click "Create New Post" to get started.</p>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[250px]">Title</TableHead>
                    <TableHead className="min-w-[150px]">Date</TableHead>
                    <TableHead className="min-w-[180px]">Category</TableHead>
                    <TableHead className="text-right min-w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map(post => (
                    <TableRow key={post.id || post.slug} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                         <div className="flex items-center gap-1 text-xs">
                            <CalendarDays /> 
                            {new Date(post.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {post.categoryName ? (
                           <Link href={`/blog/category/${post.categorySlugPath || ''}`} target="_blank" className="hover:underline">
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Folder />{post.categoryName}
                            </Badge>
                          </Link>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Uncategorized</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <Eye /> <span className="hidden sm:inline ml-1">View</span>
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditPost(post.slug)}>
                          <Edit3 /> <span className="hidden sm:inline ml-1">Edit</span>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => confirmDeletePost(post)}>
                          <Trash2 /> <span className="hidden sm:inline ml-1">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post "<strong>{postToDelete?.title}</strong>".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPostToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
