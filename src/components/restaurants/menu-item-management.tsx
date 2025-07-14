// src/components/restaurants/menu-item-management.tsx
"use client";

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Edit3, Trash2, Loader2, List, Settings, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { FullMenu, MenuCategory, MenuItem } from '@/lib/restaurants-data';
import Image from 'next/image';
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
import { MenuItemFormDialog } from './menu-item-form-dialog';
import { MenuCategoryFormDialog } from './menu-category-form-dialog';


interface MenuItemManagementProps {
  restaurantId: string;
}

export function MenuItemManagement({ restaurantId }: MenuItemManagementProps) {
  const [menu, setMenu] = useState<FullMenu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<MenuCategory | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [categoryForNewItem, setCategoryForNewItem] = useState<string | null>(null);

  const fetchMenu = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/menu`);
      if (!response.ok) throw new Error("Failed to fetch menu");
      const data: FullMenu = await response.json();
      setMenu(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId, toast]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const menuItemsByCategory = useMemo(() => {
    if (!menu) return {};
    return menu.items.reduce((acc, item) => {
      (acc[item.categoryId] = acc[item.categoryId] || []).push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [menu]);
  
  const handleOpenNewCategoryDialog = () => {
    setEditingCategory(null);
    setIsCategoryFormOpen(true);
  };

  const handleOpenEditCategoryDialog = (category: MenuCategory) => {
    setEditingCategory(category);
    setIsCategoryFormOpen(true);
  };
  
  const handleOpenNewItemDialog = (categoryId: string) => {
    setEditingItem(null);
    setCategoryForNewItem(categoryId);
    setIsItemFormOpen(true);
  };

  const handleOpenEditItemDialog = (item: MenuItem) => {
    setEditingItem(item);
    setCategoryForNewItem(null);
    setIsItemFormOpen(true);
  };
  
  const handleSuccess = () => {
    fetchMenu();
    setIsItemFormOpen(false);
    setIsCategoryFormOpen(false);
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    let url = '';
    let type = '';
    let name = '';

    if (itemToDelete) {
        url = `/api/restaurants/${restaurantId}/menu-items/${itemToDelete.id}`;
        type = 'Menu Item';
        name = itemToDelete.name;
    } else if (categoryToDelete) {
        url = `/api/restaurants/${restaurantId}/menu-categories/${categoryToDelete.id}`;
        type = 'Category';
        name = categoryToDelete.name;
    }

    try {
        const response = await fetch(url, { method: 'DELETE' });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `Failed to delete ${type}`);
        }
        toast({ title: `${type} Deleted`, description: `"${name}" has been removed.` });
        fetchMenu();
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsProcessing(false);
        setItemToDelete(null);
        setCategoryToDelete(null);
    }
  };


  if (isLoading) {
    return <Card><CardContent className="p-6 flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/></CardContent></Card>;
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Menu Management</CardTitle>
              <CardDescription>Add, edit, and organize your menu categories and items.</CardDescription>
            </div>
            <Button onClick={handleOpenNewCategoryDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Category
            </Button>
        </CardHeader>
        <CardContent>
          {menu?.categories.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No menu categories found. Click "Add Category" to start building your menu.</p>
          ) : (
            <Accordion type="multiple" className="w-full space-y-4">
              {menu?.categories.map(category => (
                <Card key={category.id} className="bg-muted/30">
                  <AccordionItem value={category.id!} className="border-b-0">
                    <AccordionTrigger className="p-4 hover:no-underline">
                        <div className="flex-1 text-left">
                            <h3 className="text-lg font-semibold">{category.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleOpenEditCategoryDialog(category); }}><Edit3 className="h-4 w-4 mr-1"/> Edit</Button>
                             <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); setCategoryToDelete(category); }}><Trash2 className="h-4 w-4 mr-1"/> Delete</Button>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 border-t">
                       <div className="space-y-4">
                         {(menuItemsByCategory[category.id!] || []).length > 0 ? (
                            (menuItemsByCategory[category.id!] || []).map(item => (
                                <Card key={item.id} className="flex items-center p-3 gap-4 bg-background">
                                    <ImageIcon className="h-10 w-10 text-muted-foreground flex-shrink-0" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold">{item.name}</h4>
                                        <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenEditItemDialog(item)}><Edit3 className="h-4 w-4 mr-1"/> Edit</Button>
                                        <Button variant="destructive" size="sm" onClick={() => setItemToDelete(item)}><Trash2 className="h-4 w-4 mr-1"/> Delete</Button>
                                    </div>
                                </Card>
                            ))
                         ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No items in this category yet.</p>
                         )}
                         <Button variant="secondary" size="sm" className="w-full" onClick={() => handleOpenNewItemDialog(category.id!)}>
                            <PlusCircle className="h-4 w-4 mr-2"/> Add Item to {category.name}
                         </Button>
                       </div>
                    </AccordionContent>
                  </AccordionItem>
                </Card>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
       <MenuItemFormDialog
          isOpen={isItemFormOpen}
          onClose={() => setIsItemFormOpen(false)}
          item={editingItem}
          restaurantId={restaurantId}
          categoryId={editingItem?.categoryId || categoryForNewItem || ''}
          menuCategories={menu?.categories || []}
          onSuccess={handleSuccess}
      />
      <MenuCategoryFormDialog
          isOpen={isCategoryFormOpen}
          onClose={() => setIsCategoryFormOpen(false)}
          category={editingCategory}
          restaurantId={restaurantId}
          onSuccess={handleSuccess}
      />
      <AlertDialog open={!!itemToDelete || !!categoryToDelete} onOpenChange={() => { setItemToDelete(null); setCategoryToDelete(null); }}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the {itemToDelete ? 'menu item' : 'category'} "<strong>{itemToDelete?.name || categoryToDelete?.name}</strong>".
                      {categoryToDelete && " All items within this category will also be deleted."}
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isProcessing} className="bg-destructive hover:bg-destructive/90">
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : "Delete"}
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
