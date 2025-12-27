
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, PlusCircle, Trash2, DollarSign, Package, LinkIcon as LinkIconLucide } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product, AffiliateLink, ProductType } from '@/lib/products-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProductCategoryNode } from '@/lib/product-categories-data';


const affiliateLinkSchemaDialog = z.object({
  vendorName: z.string().min(1, "Vendor name is required.").max(100),
  url: z.string().url("Must be a valid URL."),
  priceDisplay: z.string().min(1, "Price display is required.").max(50),
});

// Updated schema to use categoryId
const baseProductFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters.").max(150),
  description: z.string().min(10, "Description must be at least 10 characters.").max(5000),
  categoryId: z.string().min(1, "Category is required."),
  imageUrl: z.string().url("Image URL must be a valid URL."),
  imageHint: z.string().min(1, "Image hint is required (max 2 words).").max(50).refine(s => s.split(' ').length <= 2, "Hint should be max 2 words."),
  videoUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  tags: z.string().optional().transform(val => val ? val.split(',').map(tag => tag.trim()).filter(Boolean) : []),
  productType: z.enum(['creator', 'affiliate'], { required_error: "Product type is required." }),
});

const creatorProductFormSchema = baseProductFormSchema.extend({
  productType: z.literal('creator'),
  price: z.coerce.number().min(0, "Price must be non-negative."),
  stock: z.coerce.number().int("Stock must be an integer.").min(0, "Stock must be non-negative.").optional().default(0),
  sku: z.string().max(50).optional().nullable(),
  links: z.array(affiliateLinkSchemaDialog).max(0, "Creator products cannot have affiliate links.").optional(),
});

const affiliateProductFormSchema = baseProductFormSchema.extend({
  productType: z.literal('affiliate'),
  links: z.array(affiliateLinkSchemaDialog).min(1, "Affiliate products need at least one link.").max(5),
  price: z.preprocess((val) => (val === "" || val === undefined || val === null) ? undefined : Number(val), z.number().optional().transform(() => undefined)), // Always undefined
  stock: z.preprocess((val) => (val === "" || val === undefined || val === null) ? undefined : Number(val), z.number().optional().transform(() => undefined)), // Always undefined
  sku: z.preprocess((val) => (val === "" || val === undefined || val === null) ? undefined : String(val), z.string().optional().transform(() => undefined)), // Always undefined
});

const productFormDialogSchema = z.discriminatedUnion("productType", [
  creatorProductFormSchema,
  affiliateProductFormSchema,
]);

export type ProductFormValues = z.infer<typeof productFormDialogSchema>;

interface ProductFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: (product: Product) => void;
}

interface FlattenedCategory {
  value: string;
  label: string;
  level: number;
}

const flattenCategories = (categories: ProductCategoryNode[], level = 0): FlattenedCategory[] => {
  let flatList: FlattenedCategory[] = [];
  const indent = "\u00A0\u00A0".repeat(level * 2);
  for (const category of categories) {
    if (!category.id) continue;
    flatList.push({ value: category.id, label: `${indent}${category.name}`, level });
    if (category.children && category.children.length > 0) {
      flatList = flatList.concat(flattenCategories(category.children, level + 1));
    }
  }
  return flatList;
};

export function ProductFormDialog({ isOpen, onClose, product, onSuccess }: ProductFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<ProductCategoryNode[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormDialogSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      imageUrl: "https://placehold.co/600x400.png",
      imageHint: "product image",
      videoUrl: "",
      tags: [],
      productType: "creator",
      price: 0,
      stock: 0,
      sku: "",
      links: [],
    },
  });

  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({
    control: form.control,
    name: "links",
  });

  useEffect(() => {
    if (isOpen) {
      async function fetchInitialData() {
        setIsLoadingCategories(true);
        try {
          const response = await fetch('/api/product-categories');
          if (!response.ok) throw new Error('Failed to fetch product categories');
          const catData: ProductCategoryNode[] = await response.json();
          setCategories(catData);
        } catch (error) {
          console.error("Error fetching product categories:", error);
          toast({ title: "Error", description: "Could not load product categories.", variant: "destructive" });
        } finally {
          setIsLoadingCategories(false);
        }
      }
      fetchInitialData();
    }
  }, [isOpen, toast]);

  useEffect(() => {
    if (isOpen) {
      if (product) {
        form.reset({
          ...product,
          videoUrl: product.videoUrl || "",
          tags: product.tags || [],
          price: product.productType === 'creator' ? product.price : undefined,
          stock: product.productType === 'creator' ? product.stock : undefined,
          sku: product.productType === 'creator' ? (product.sku || "") : undefined,
          links: product.productType === 'affiliate' ? (product.links || [{ vendorName: "", url: "", priceDisplay: "" }]) : [],
        });
      } else {
        form.reset({
          name: "",
          description: "",
          categoryId: "",
          imageUrl: "https://placehold.co/600x400.png",
          imageHint: "product image",
          videoUrl: "",
          tags: [],
          productType: "creator",
          price: 0,
          stock: 0,
          sku: "",
          links: [],
        });
      }
    }
  }, [product, form, isOpen]);

  const productType = form.watch("productType");

  useEffect(() => {
    if (productType === 'creator') {
      form.setValue('links', []); // Clear links if switching to creator
      if (form.getValues('price') === undefined) form.setValue('price', 0);
      if (form.getValues('stock') === undefined) form.setValue('stock', 0);
    } else if (productType === 'affiliate') {
      form.setValue('price', undefined);
      form.setValue('stock', undefined);
      form.setValue('sku', undefined);
      if (form.getValues('links')?.length === 0) {
        appendLink({ vendorName: "", url: "", priceDisplay: "" });
      }
    }
  }, [productType, form, appendLink]);

  const flattenedCategoryOptions = useMemo(() => flattenCategories(categories), [categories]);

  const handleSubmit = async (values: ProductFormValues) => {
    setIsSaving(true);
    const apiUrl = product && product.id ? `/api/products/${product.id}` : '/api/products';
    const method = product ? 'PUT' : 'POST';

    const payload = {
      ...values,
      tags: typeof values.tags === 'string' ? values.tags.split(',').map(tag => tag.trim()).filter(Boolean) : values.tags,
    };

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        const errorMessages = errorData.errors ? Object.values(errorData.errors).flat().join(', ') : errorData.message;
        throw new Error(errorMessages || `Failed to ${product ? 'update' : 'create'} product`);
      }
      const savedProduct: Product = await response.json();
      toast({
        title: `Product ${product ? 'Updated' : 'Created'}!`,
        description: `"${savedProduct.name}" has been successfully ${product ? 'updated' : 'created'}.`,
      });
      onSuccess(savedProduct);
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Could not ${product ? 'update' : 'create'} product.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update the details of this product." : "Fill in the details for your new product."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <ScrollArea className="h-[calc(100vh-20rem)] pr-6">
              <div className="space-y-4 py-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="Product Name" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Detailed product description..." {...field} className="min-h-[100px]" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""} disabled={isLoadingCategories || flattenedCategoryOptions.length === 0}>
                          <FormControl><SelectTrigger><SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select category"} /></SelectTrigger></FormControl>
                          <SelectContent>
                            {isLoadingCategories ? <SelectItem value="loading" disabled>Loading...</SelectItem> :
                              flattenedCategoryOptions.length === 0 ? <SelectItem value="no-cat" disabled>No categories found.</SelectItem> :
                                flattenedCategoryOptions.map(opt => <SelectItem key={opt.value} value={opt.value} style={{ paddingLeft: `${opt.level * 1 + 0.5}rem` }}>{opt.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags (comma-separated)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., productivity, design, code"
                            {...field}
                            value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem><FormLabel>Image URL</FormLabel><FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="imageHint" render={({ field }) => (
                    <FormItem><FormLabel>Image Hint (max 2 words)</FormLabel><FormControl><Input placeholder="e.g., modern gadget" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="videoUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video URL (Optional - YouTube or TikTok)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.youtube.com/watch?v=... or https://www.tiktok.com/@.../video/..." {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">If provided, this video will replace the image in the homepage feed.</p>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="productType" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Product Type</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="creator" /></FormControl><FormLabel className="font-normal">Creator Product</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="affiliate" /></FormControl><FormLabel className="font-normal">Affiliate Product</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl><FormMessage />
                  </FormItem>
                )} />

                {productType === 'creator' && (
                  <Card className="p-4 bg-secondary/50">
                    <h3 className="text-md font-semibold mb-3 flex items-center gap-2"><Package className="h-5 w-5 text-primary" />Creator Product Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem><FormLabel>Price ($)</FormLabel><FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="stock" render={({ field }) => (
                        <FormItem><FormLabel>Stock Quantity</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="sku" render={({ field }) => (
                        <FormItem><FormLabel>SKU (Optional)</FormLabel><FormControl><Input placeholder="PRODUCT-001" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  </Card>
                )}

                {productType === 'affiliate' && (
                  <Card className="p-4 bg-secondary/50">
                    <h3 className="text-md font-semibold mb-3 flex items-center gap-2"><LinkIconLucide className="h-5 w-5 text-primary" />Affiliate Links</h3>
                    {linkFields.map((item, index) => (
                      <div key={item.id} className="p-3 border rounded-md mb-3 bg-background/50 shadow-sm">
                        <FormField control={form.control} name={`links.${index}.vendorName`} render={({ field }) => (
                          <FormItem><FormLabel>Vendor Name</FormLabel><FormControl><Input placeholder="Amazon, Vendor Site" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`links.${index}.url`} render={({ field }) => (
                          <FormItem className="mt-2"><FormLabel>Link URL</FormLabel><FormControl><Input type="url" placeholder="https://vendor.com/product-link" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name={`links.${index}.priceDisplay`} render={({ field }) => (
                          <FormItem className="mt-2"><FormLabel>Price Display</FormLabel><FormControl><Input placeholder="$99.99 or Check Price" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeLink(index)} className="mt-2 text-destructive hover:text-destructive/90 text-xs"><Trash2 className="mr-1 h-3 w-3" />Remove Link</Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendLink({ vendorName: "", url: "", priceDisplay: "" })} className="mt-2">
                      <PlusCircle className="mr-2 h-4 w-4" />Add Affiliate Link
                    </Button>
                  </Card>
                )}
              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline" disabled={isSaving}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90">
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : (product ? "Save Changes" : "Create Product")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
