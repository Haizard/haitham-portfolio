
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, Loader2, ChevronDown, ChevronRight, FolderPlus, ListTree } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CategoryNode } from '@/lib/categories-data';
import { CategoryFormDialog } from './category-form-dialog';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function CategoryManagement() {
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [editingNode, setEditingNode] = useState<CategoryNode | null>(null);
  const [parentForNewNode, setParentForNewNode] = useState<{ id: string | null; name: string | null } | null>(null);
  
  const [nodeToDelete, setNodeToDelete] = useState<CategoryNode | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openNodes, setOpenNodes] = useState<Record<string, boolean>>({});

  const { toast } = useToast();

  const fetchCategoryTree = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch category tree');
      const tree: CategoryNode[] = await response.json();
      setCategoryTree(tree);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not load category tree.", variant: "destructive" });
      setCategoryTree([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategoryTree();
  }, [fetchCategoryTree]);

  const toggleNodeOpen = (nodeId: string) => {
    setOpenNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const handleCreateTopLevelCategory = () => {
    setEditingNode(null);
    setParentForNewNode(null);
    setIsFormOpen(true);
  };

  const handleCreateChildCategory = (parentNode: CategoryNode) => {
    setEditingNode(null);
    setParentForNewNode({ id: parentNode.id, name: parentNode.name });
    setIsFormOpen(true);
  };

  const handleEditNode = (node: CategoryNode) => {
    setEditingNode(node);
    setParentForNewNode(null); 
    setIsFormOpen(true);
  };

  const confirmDeleteNode = (node: CategoryNode) => {
    setNodeToDelete(node);
  };

  const handleDeleteNode = async () => {
    if (!nodeToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/categories/${nodeToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete category`);
      }
      toast({ title: `Category Deleted`, description: `"${nodeToDelete.name}" and all its children have been removed.` });
      fetchCategoryTree(); 
    } catch (error: any) {
      toast({ title: "Error", description: error.message || `Could not delete category.`, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setNodeToDelete(null);
    }
  };

  const renderCategoryRowsRecursive = (nodes: CategoryNode[], level = 0): React.ReactNode[] => {
    return nodes.flatMap(node => [
      <TableRow key={node.id} className="hover:bg-muted/50">
        <TableCell style={{ paddingLeft: `${level * 24 + 16}px` }}> {/* Increased base padding */}
          <div className="flex items-center">
            {node.children && node.children.length > 0 ? (
              <Button variant="ghost" size="icon" onClick={() => toggleNodeOpen(node.id)} className="h-8 w-8 mr-1">
                {openNodes[node.id] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            ) : (
              <span className="inline-block w-8 mr-1"></span> // Placeholder for alignment
            )}
            <span className="font-medium">{node.name}</span>
            {node.children && node.children.length > 0 && (
               <Badge variant="secondary" className="ml-2">{node.children.length} child{node.children.length === 1 ? '' : 'ren'}</Badge>
            )}
          </div>
        </TableCell>
        <TableCell><code className="text-xs bg-muted/50 p-1 rounded">{node.slug}</code></TableCell>
        <TableCell className="text-sm text-muted-foreground truncate max-w-[300px]">
          {node.description && node.description.length > 70 ? (
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <span className="cursor-help">{node.description.substring(0, 70)}...</span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs p-2">
                {node.description}
              </TooltipContent>
            </Tooltip>
          ) : (
            node.description || '-'
          )}
        </TableCell>
        <TableCell className="text-right">
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => handleCreateChildCategory(node)} className="mr-2">
                <FolderPlus className="mr-1 h-4 w-4" /> Add Child
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs p-1">Add Child Category</TooltipContent>
          </Tooltip>
           <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => handleEditNode(node)} className="mr-2">
                <Edit3 className="mr-1 h-4 w-4" /> Edit
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs p-1">Edit Category</TooltipContent>
          </Tooltip>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button variant="destructive" size="sm" onClick={() => confirmDeleteNode(node)}>
                <Trash2 className="mr-1 h-4 w-4" /> Delete
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs p-1">Delete Category</TooltipContent>
          </Tooltip>
        </TableCell>
      </TableRow>,
      ...(node.children && node.children.length > 0 && openNodes[node.id]
        ? renderCategoryRowsRecursive(node.children, level + 1)
        : [])
    ]);
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
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-headline flex items-center"><ListTree className="mr-2 h-6 w-6 text-primary"/>Category Tree</CardTitle>
            <CardDescription>Manage your hierarchical blog categories.</CardDescription>
          </div>
          <Button onClick={handleCreateTopLevelCategory} className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-5 w-5" /> Create Top-Level Category
          </Button>
        </CardHeader>
        <CardContent>
          {categoryTree.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No categories found. Get started by creating one!</p>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right w-[300px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderCategoryRowsRecursive(categoryTree)}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        categoryNode={editingNode}
        parentId={parentForNewNode?.id}
        parentName={parentForNewNode?.name}
        onSuccess={() => {
          fetchCategoryTree();
          setIsFormOpen(false);
        }}
      />
      
      <AlertDialog open={!!nodeToDelete} onOpenChange={(open) => !open && setNodeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category "<strong>{nodeToDelete?.name}</strong>"
              and all of its descendant categories/subcategories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNodeToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNode} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
