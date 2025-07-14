// src/components/restaurants/menu-item-form-dialog.tsx
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MenuItem, MenuCategory } from '@/lib/restaurants-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const optionSchema = z.object({
  name: z.string().min(1, "Option name is required."),
  price: z.coerce.number().min(0, "Price must be a non-negative number."),
});

const optionGroupSchema = z.object({
  title: z.string().min(1, "Group title is required."),
  selectionType: z.enum(['single', 'multi']),
  isRequired: z.boolean().default(false),
  requiredCount: z.coerce.number().optional(),
  options: z.array(optionSchema).min(1, "Each group must have at least one option."),
});

const formSchema = z.object({
  name: z.string().min(2, "Item name is required."),
  description: z.string().min(5, "Description is required."),
  price: z.coerce.number().min(0, "Price must be non-negative."),
  categoryId: z.string().min(1, "Category is required."),
  imageUrl: z.string().url("A valid image URL is required."),
  dietaryFlags: z.array(z.enum(['vegetarian', 'spicy', 'gluten-free'])).optional(),
  optionGroups: z.array(optionGroupSchema).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MenuItemFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item?: MenuItem | null;
  restaurantId: string;
  categoryId: string;
  menuCategories: MenuCategory[];
  onSuccess: () => void;
}

export function MenuItemFormDialog({ isOpen, onClose, item, restaurantId, categoryId, menuCategories, onSuccess }: MenuItemFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });
  
  const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({ control: form.control, name: "optionGroups" });

  useEffect(() => {
    if (isOpen) {
      if (item) {
        form.reset({
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: item.categoryId,
          imageUrl: item.imageUrl,
          dietaryFlags: item.dietaryFlags,
          optionGroups: item.optionGroups?.map(g => ({ ...g, options: g.options.map(o => ({...o}))})), // Deep copy
        });
      } else {
        form.reset({
          name: "",
          description: "",
          price: 0,
          categoryId: categoryId,
          imageUrl: "https://placehold.co/100x100.png",
          dietaryFlags: [],
          optionGroups: [],
        });
      }
    }
  }, [item, categoryId, isOpen, form]);

  const handleSubmit = async (values: FormValues) => {
    setIsSaving(true);
    const isEditing = !!item;
    const apiUrl = isEditing 
      ? `/api/restaurants/${restaurantId}/menu-items/${item.id}` 
      : `/api/restaurants/${restaurantId}/menu-items`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to save menu item.`);
      }
      toast({ title: "Success!", description: `Menu item "${values.name}" has been saved.` });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Menu Item" : "Create New Menu Item"}</DialogTitle>
          <DialogDescription>Fill out the details for your menu item.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
              <div className="space-y-6 py-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name</FormLabel><Input {...field} /></FormItem>
                )}/>
                 <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><Textarea {...field} /></FormItem>
                )}/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem><FormLabel>Base Price ($)</FormLabel><Input type="number" {...field} /></FormItem>
                    )}/>
                    <FormField control={form.control} name="categoryId" render={({ field }) => (
                      <FormItem><FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select a category..." /></SelectTrigger></FormControl>
                            <SelectContent>{menuCategories.map(cat => <SelectItem key={cat.id} value={cat.id!}>{cat.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormItem>
                    )}/>
                </div>
                 <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem><FormLabel>Image URL</FormLabel><Input {...field} /></FormItem>
                )}/>
                <FormField control={form.control} name="dietaryFlags" render={() => (
                    <FormItem>
                        <FormLabel>Dietary Flags</FormLabel>
                        <div className="flex gap-4">
                            {['vegetarian', 'spicy', 'gluten-free'].map(flag => (
                                <FormField key={flag} control={form.control} name="dietaryFlags" render={({field}) => (
                                    <FormItem className="flex items-center gap-2"><Checkbox checked={field.value?.includes(flag as any)} onCheckedChange={(checked) => checked ? field.onChange([...(field.value || []), flag]) : field.onChange((field.value || []).filter(v => v !== flag))}/>
                                    <FormLabel className="font-normal capitalize">{flag}</FormLabel></FormItem>
                                )}/>
                            ))}
                        </div>
                    </FormItem>
                )}/>

                <Separator/>
                
                <div>
                    <h3 className="text-lg font-semibold mb-2">Customization Options</h3>
                    <div className="space-y-4">
                        {groupFields.map((group, groupIndex) => (
                           <Card key={group.id} className="p-4 bg-muted/50">
                               <div className="flex justify-between items-center mb-2">
                                 <h4 className="font-semibold">Option Group #{groupIndex+1}</h4>
                                 <Button variant="ghost" size="sm" onClick={() => removeGroup(groupIndex)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
                               </div>
                               <div className="space-y-2">
                                <FormField control={form.control} name={`optionGroups.${groupIndex}.title`} render={({field})=><FormItem><Input placeholder="Group Title (e.g., Size, Toppings)" {...field}/></FormItem>}/>
                                <div className="flex gap-4">
                                <FormField control={form.control} name={`optionGroups.${groupIndex}.selectionType`} render={({field})=><FormItem><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="single">Single Choice</SelectItem><SelectItem value="multi">Multiple Choice</SelectItem></SelectContent></Select></FormItem>}/>
                                <FormField control={form.control} name={`optionGroups.${groupIndex}.isRequired`} render={({field})=><FormItem className="flex items-center gap-2 pt-2"><Checkbox checked={field.value} onCheckedChange={field.onChange}/><Label>Required</Label></FormItem>}/>
                               </div>
                                <OptionsArray control={form.control} groupIndex={groupIndex} />
                               </div>
                           </Card>
                        ))}
                         <Button type="button" variant="outline" size="sm" onClick={() => appendGroup({title: "", selectionType: 'single', isRequired: false, options: [{name: "", price: 0}]})}>
                            <PlusCircle className="mr-2 h-4 w-4"/>Add Option Group
                        </Button>
                    </div>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : "Save Menu Item"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


function OptionsArray({ groupIndex, control }: { groupIndex: number, control: any}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `optionGroups.${groupIndex}.options`
  });

  return (
    <div className="pl-4 border-l-2 ml-2 space-y-2">
      <h5 className="text-sm font-medium">Options</h5>
      {fields.map((option, optionIndex) => (
        <div key={option.id} className="flex items-end gap-2">
          <FormField control={control} name={`optionGroups.${groupIndex}.options.${optionIndex}.name`} render={({field}) => (<FormItem className="flex-1"><FormLabel className="text-xs">Name</FormLabel><Input placeholder="e.g., Extra Cheese" {...field}/></FormItem>)}/>
          <FormField control={control} name={`optionGroups.${groupIndex}.options.${optionIndex}.price`} render={({field}) => (<FormItem><FormLabel className="text-xs">Price ($)</FormLabel><Input type="number" placeholder="0.00" {...field}/></FormItem>)}/>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => remove(optionIndex)}><Trash2 className="h-4 w-4 text-destructive"/></Button>
        </div>
      ))}
       <Button type="button" variant="ghost" size="sm" onClick={() => append({ name: "", price: 0 })}>
        <PlusCircle className="mr-2 h-4 w-4"/>Add Option
      </Button>
    </div>
  )
}
