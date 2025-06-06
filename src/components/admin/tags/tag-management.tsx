
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, Loader2, Tags as TagsIcon, Package } from "lucide-react"; // Added Package icon
import { useToast } from "@/hooks/use-toast";
import type { Tag } from '@/lib/tags-data';
import { TagFormDialog } from './tag-form-dialog';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function TagManagement() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      const data: Tag[] = await response.json();
      setTags(data);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not load tags.", variant: "destructive" });
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleCreateTag = () => {
    setEditingTag(null);
    setIsFormOpen(true);
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setIsFormOpen(true);
  };

  const confirmDeleteTag = (tag: Tag) => {
    setTagToDelete(tag);
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete || !tagToDelete.id) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tags/${tagToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete tag`);
      }
      toast({ title: `Tag Deleted`, description: `"${tagToDelete.name}" has been removed.` });
      fetchTags(); 
    } catch (error: any) {
      toast({ title: "Error", description: error.message || `Could not delete tag.`, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setTagToDelete(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Card className="shadow-xl mb-8">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-headline flex items-center"><TagsIcon className="mr-2 h-6 w-6 text-primary"/>Tag List</CardTitle>
            <CardDescription>Manage all content tags.</CardDescription>
          </div>
          <Button onClick={handleCreateTag} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Tag
          </Button>
        </CardHeader>
        <CardContent>
          {tags.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No tags found. Get started by creating one!</p>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Name</TableHead>
                    <TableHead className="min-w-[150px]">Slug</TableHead>
                    <TableHead className="min-w-[100px] text-center">Post Count</TableHead>
                    <TableHead className="min-w-[250px]">Description</TableHead>
                    <TableHead className="text-right min-w-[220px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.map(tag => (
                    <TableRow key={tag.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{tag.name}</TableCell>
                      <TableCell><code className="text-xs bg-muted/50 p-1 rounded">{tag.slug}</code></TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center">
                           <Package className="h-4 w-4 mr-1.5 text-muted-foreground" />
                           {tag.postCount ?? 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-[200px] md:max-w-[300px]">
                        {tag.description && tag.description.length > 70 ? (
                            <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                    <span className="cursor-help">{tag.description.substring(0, 70)}...</span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs text-xs p-2 bg-popover text-popover-foreground border rounded-md shadow-sm">
                                    {tag.description}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            tag.description || '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => handleEditTag(tag)}>
                                <Edit3 className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">Edit</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs p-1 bg-popover text-popover-foreground border rounded-md shadow-sm">Edit Tag</TooltipContent>
                        </Tooltip>
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                                <Button variant="destructive" size="sm" onClick={() => confirmDeleteTag(tag)}>
                                <Trash2 className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">Delete</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs p-1 bg-popover text-popover-foreground border rounded-md shadow-sm">Delete Tag</TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <TagFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        tag={editingTag}
        onSuccess={() => {
          fetchTags();
          setIsFormOpen(false);
          setEditingTag(null);
        }}
      />
      
      <AlertDialog open={!!tagToDelete} onOpenChange={(open) => !open && setTagToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tag "<strong>{tagToDelete?.name}</strong>".
              Posts using this tag will have the tag unlinked.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTagToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTag} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}

