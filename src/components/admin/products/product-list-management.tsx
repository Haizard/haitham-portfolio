
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit3, Trash2, Loader2, PlusCircle, Package, DollarSign, Link as LinkIcon, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product } from '@/lib/products-data';
import { ProductFormDialog } from './product-form-dialog';
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
import Image from 'next/image';
import Link from 'next/link';

export function ProductListManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data: Product[] = await response.json();
      setProducts(data);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast({ title: "Error", description: error.message || "Could not load products.", variant: "destructive" });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCreateNewProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const confirmDeleteProduct = (product: Product) => {
    setProductToDelete(product);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete || !productToDelete.id) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }
      toast({ title: "Product Deleted", description: `"${productToDelete.name}" has been removed.` });
      fetchProducts();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Could not delete product.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const handleFormSuccess = (savedProduct: Product) => {
    fetchProducts(); // Re-fetch products to update the list
    setIsFormOpen(false);
    setEditingProduct(null);
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
            <CardTitle className="text-2xl font-headline flex items-center"><Package className="mr-2 h-6 w-6 text-primary"/>Manage Products</CardTitle>
            <CardDescription>Add, edit, or remove products from your store.</CardDescription>
          </div>
          <Button onClick={handleCreateNewProduct} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
          </Button>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No products found. Click "Add New Product" to get started.</p>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] hidden md:table-cell">Image</TableHead>
                    <TableHead className="min-w-[200px]">Name</TableHead>
                    <TableHead className="min-w-[120px]">Category</TableHead>
                    <TableHead className="min-w-[100px]">Type</TableHead>
                    <TableHead className="min-w-[120px]">Price / Links</TableHead>
                    <TableHead className="min-w-[80px]">Stock</TableHead>
                    <TableHead className="text-right min-w-[180px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map(product => (
                    <TableRow key={product.id} className="hover:bg-muted/50">
                      <TableCell className="hidden md:table-cell">
                        <Image src={product.imageUrl} alt={product.name} width={50} height={50} className="rounded object-cover aspect-square" data-ai-hint={product.imageHint}/>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/ecommerce?product=${product.slug}`} target="_blank" className="hover:text-primary hover:underline">
                            {product.name}
                        </Link>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>
                        <Badge variant={product.productType === 'creator' ? 'default' : 'secondary'}>
                          {product.productType.charAt(0).toUpperCase() + product.productType.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.productType === 'creator' && product.price !== undefined ? (
                          <span className="flex items-center text-sm"><DollarSign className="h-4 w-4 mr-1 text-green-600"/>{product.price.toFixed(2)}</span>
                        ) : product.productType === 'affiliate' && product.links && product.links.length > 0 ? (
                           <div className="flex items-center text-sm text-blue-600 hover:underline">
                            <LinkIcon className="h-4 w-4 mr-1"/> {product.links.length} link(s)
                           </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{product.productType === 'creator' ? (product.stock ?? 0) : '-'}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                          <Edit3 className="h-4 w-4 mr-1 sm:mr-0" /> <span className="hidden sm:inline ml-1">Edit</span>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => confirmDeleteProduct(product)}>
                          <Trash2 className="h-4 w-4 mr-1 sm:mr-0" /> <span className="hidden sm:inline ml-1">Delete</span>
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

      <ProductFormDialog
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingProduct(null); }}
        product={editingProduct}
        onSuccess={handleFormSuccess}
      />
      
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product "<strong>{productToDelete?.name}</strong>".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
