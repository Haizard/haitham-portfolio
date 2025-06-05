
"use client";

import { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, Loader2, ChevronDown, ChevronRight, Eye, FolderPlus, ListTree } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Category, Subcategory } from '@/lib/categories-data';
import { CategoryFormDialog } from './category-form-dialog';
import { SubcategoryFormDialog } from './subcategory-form-dialog';
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
import { Separator } from '@/components/ui/separator';

type CategoryWithSubcategories = Category & { subcategories: Subcategory[], isOpen?: boolean };

export function CategoryManagement() {
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isSubcategoryFormOpen, setIsSubcategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [parentCategoryForSub, setParentCategoryForSub] = useState<Category | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'category' | 'subcategory', data: Category | Subcategory } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  const fetchCategoriesAndSubcategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const categoriesResponse = await fetch('/api/categories');
      if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
      const fetchedCategories: Category[] = await categoriesResponse.json();

      const categoriesWithData: CategoryWithSubcategories[] = await Promise.all(
        fetchedCategories.map(async (cat) => {
          const subcategoriesResponse = await fetch(`/api/categories/${cat.id}/subcategories`);
          const fetchedSubcategories: Subcategory[] = subcategoriesResponse.ok ? await subcategoriesResponse.json() : [];
          const currentCategoryState = categories.find(c => c.id === cat.id);
          return { ...cat, subcategories: fetchedSubcategories, isOpen: currentCategoryState?.isOpen || false };
        })
      );
      setCategories(categoriesWithData);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not load categories or subcategories.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, categories]); // Added categories to dependency array for isOpen state persistence

  useEffect(() => {
    fetchCategoriesAndSubcategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Initial fetch only

  const toggleCategoryOpen = (categoryId: string) => {
    setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, isOpen: !cat.isOpen } : cat));
  };

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setIsCategoryFormOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryFormOpen(true);
  };

  const handleCreateSubcategory = (parentCategory: Category) => {
    setParentCategoryForSub(parentCategory);
    setEditingSubcategory(null);
    setIsSubcategoryFormOpen(true);
  };

  const handleEditSubcategory = (subcategory: Subcategory, parentCategory: Category) => {
    setParentCategoryForSub(parentCategory);
    setEditingSubcategory(subcategory);
    setIsSubcategoryFormOpen(true);
  };

  const confirmDeleteItem = (type: 'category' | 'subcategory', data: Category | Subcategory) => {
    setItemToDelete({ type, data });
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    const { type, data } = itemToDelete;
    const url = type === 'category' ? `/api/categories/${data.id}` : `/api/categories/${(data as Subcategory).parentCategoryId}/subcategories/${data.id}`;
    
    try {
      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete ${type}`);
      }
      toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Deleted`, description: `"${data.name}" has been removed.` });
      fetchCategoriesAndSubcategories();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || `Could not delete ${type}.`, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
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
    <>
      <Card className="shadow-xl mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-headline flex items-center"><ListTree className="mr-2 h-6 w-6 text-primary"/>Categories Overview</CardTitle>
            <CardDescription>View, add, edit, or delete blog categories and their subcategories.</CardDescription>
          </div>
          <Button onClick={handleCreateCategory} className="bg-primary hover:bg-primary/90">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Category
          </Button>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No categories found. Get started by creating one!</p>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right w-[250px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map(category => (
                    <>
                      <TableRow key={category.id} className="hover:bg-muted/50">
                        <TableCell>
                          {category.subcategories.length > 0 && (
                            <Button variant="ghost" size="icon" onClick={() => toggleCategoryOpen(category.id)} className="h-8 w-8">
                              {category.isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{category.name} <Badge variant="secondary" className="ml-2">{category.subcategories.length} sub</Badge></TableCell>
                        <TableCell className="text-muted-foreground text-xs">{category.slug}</TableCell>
                        <TableCell className="text-sm text-muted-foreground truncate max-w-xs">{category.description || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleCreateSubcategory(category)} className="mr-2">
                            <FolderPlus className="mr-1 h-4 w-4" /> Add Sub
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)} className="mr-2">
                            <Edit3 className="mr-1 h-4 w-4" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => confirmDeleteItem('category', category)}>
                            <Trash2 className="mr-1 h-4 w-4" /> Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                      {category.isOpen && category.subcategories.length > 0 && (
                        <TableRow className="bg-secondary/30 hover:bg-secondary/40">
                          <TableCell colSpan={5} className="p-0">
                            <div className="p-4 pl-12">
                               <h4 className="text-sm font-semibold mb-2 text-muted-foreground">Subcategories for "{category.name}"</h4>
                                {category.subcategories.map(sub => (
                                <Card key={sub.id} className="mb-2 shadow-sm bg-card">
                                  <CardContent className="p-3 flex justify-between items-center">
                                    <div>
                                      <p className="font-medium text-sm">{sub.name}</p>
                                      <p className="text-xs text-muted-foreground">{sub.slug}</p>
                                      {sub.description && <p className="text-xs text-muted-foreground mt-1">{sub.description}</p>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button variant="outline" size="xs" onClick={() => handleEditSubcategory(sub, category)}>
                                        <Edit3 className="mr-1 h-3 w-3" /> Edit
                                      </Button>
                                      <Button variant="destructive" size="xs" onClick={() => confirmDeleteItem('subcategory', sub)}>
                                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                              {category.subcategories.length === 0 && <p className="text-xs text-muted-foreground">No subcategories yet.</p>}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog
        isOpen={isCategoryFormOpen}
        onClose={() => setIsCategoryFormOpen(false)}
        category={editingCategory}
        onSuccess={() => {
          fetchCategoriesAndSubcategories();
          setIsCategoryFormOpen(false);
        }}
      />
      <SubcategoryFormDialog
        isOpen={isSubcategoryFormOpen}
        onClose={() => setIsSubcategoryFormOpen(false)}
        subcategory={editingSubcategory}
        parentCategory={parentCategoryForSub}
        onSuccess={() => {
          fetchCategoriesAndSubcategories();
          setIsSubcategoryFormOpen(false);
        }}
      />
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {itemToDelete?.type} "<strong>{itemToDelete?.data.name}</strong>".
              {itemToDelete?.type === 'category' && ' All its subcategories will also be deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
