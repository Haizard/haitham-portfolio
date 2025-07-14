
"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/use-cart';
import type { MenuItem } from '@/lib/restaurants-data';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MenuItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null; // Allow item to be null
}

const formatPrice = (price: number) => {
  if (price === 0) return 'FREE';
  return `+£${price.toFixed(2)}`;
};

export function MenuItemDialog({ isOpen, onClose, item }: MenuItemDialogProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  // Reset state when dialog opens with a new item or closes
  useEffect(() => {
    if (isOpen && item) {
      setSelectedOptions({});
      setQuantity(1);
      setValidationMessage(null);
    }
  }, [isOpen, item]);
  
  const handleSelectionChange = (groupId: string, optionId: string, selectionType: 'single' | 'multi', maxSelections?: number) => {
    setSelectedOptions(prev => {
      const newSelection = { ...prev };
      const currentGroupSelection = newSelection[groupId] || [];

      if (selectionType === 'single') {
        newSelection[groupId] = [optionId];
      } else { // multi
        if (currentGroupSelection.includes(optionId)) {
          newSelection[groupId] = currentGroupSelection.filter(id => id !== optionId);
        } else {
          if (maxSelections && currentGroupSelection.length >= maxSelections) {
            // Optional: Provide feedback that max selections have been reached
             toast({
              title: "Selection limit reached",
              description: `You can only select up to ${maxSelections} options for this group.`,
              variant: "default",
            });
            return prev; // Do not add the new selection
          }
          newSelection[groupId] = [...currentGroupSelection, optionId];
        }
      }
      return newSelection;
    });
    // Clear validation message on any change, as it will be re-validated on add to cart.
    setValidationMessage(null);
  };

  const validationInfo = useMemo(() => {
    if (!item) return { isValid: false, message: "No item selected." };

    for (const group of item.optionGroups || []) {
      const selectionCount = selectedOptions[group.id]?.length || 0;
      if (group.isRequired) {
        const required = group.requiredCount || 1;
        if (selectionCount < required) {
          return { isValid: false, message: `Please select at least ${required} option(s) from "${group.title}".` };
        }
      }
      // Assuming a simple max selection logic for now. Could be a property on the group.
      // Example: if (group.maxSelections && selectionCount > group.maxSelections) { ... }
    }
    return { isValid: true, message: "" };
  }, [selectedOptions, item]);

  const totalExtrasPrice = useMemo(() => {
    if (!item) return 0;
    let total = 0;
    for (const groupId in selectedOptions) {
      const group = item.optionGroups?.find(g => g.id === groupId);
      if (group) {
        for (const optionId of selectedOptions[groupId]) {
          const option = group.options.find(o => o.id === optionId);
          if (option) {
            total += option.price;
          }
        }
      }
    }
    return total;
  }, [selectedOptions, item]);

  if (!item) return null; // Don't render the dialog if no item is selected

  const totalItemPrice = (item.price + totalExtrasPrice) * quantity;
  
  const handleAddToCart = () => {
    if (!validationInfo.isValid) {
      setValidationMessage(validationInfo.message);
      return;
    }
    
    let customizedName = item.name;
    const descriptions: string[] = [];
    
    item.optionGroups?.forEach(group => {
      const selectedIds = selectedOptions[group.id];
      if (selectedIds && selectedIds.length > 0) {
        const optionNames = selectedIds.map(id => group.options.find(o => o.id === id)?.name).filter(Boolean);
        if (optionNames.length > 0) {
          descriptions.push(`${group.title}: ${optionNames.join(', ')}`);
        }
      }
    });
    
    const customizedDescription = descriptions.join(' | ');

    const itemToAdd = {
      id: `${item.id}-${JSON.stringify(selectedOptions)}`,
      name: customizedName,
      price: item.price + totalExtrasPrice,
      imageUrl: item.imageUrl,
      description: customizedDescription,
      productType: 'creator' as const,
      vendorId: item.restaurantId,
    };
    
    addToCart(itemToAdd, quantity);
    onClose();
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>{item.description}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] -mx-6 px-6">
          <div className="space-y-4">
            {item.optionGroups?.map(group => (
              <div key={group.id}>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold">{group.title}</h4>
                    {group.isRequired && <Badge variant="outline">Required: {group.requiredCount || 1}</Badge>}
                </div>
                {group.selectionType === 'multi' ? (
                  <div className="space-y-2">
                    {group.options.map(option => (
                      <div key={option.id} className="flex items-center justify-between p-2 border rounded-md">
                        <Label htmlFor={option.id} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox 
                                id={option.id} 
                                onCheckedChange={() => handleSelectionChange(group.id, option.id, 'multi')}
                                checked={(selectedOptions[group.id] || []).includes(option.id)}
                            /> 
                            {option.name}
                        </Label>
                        <span className="text-sm text-muted-foreground">{formatPrice(option.price)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <RadioGroup 
                    onValueChange={(value) => handleSelectionChange(group.id, value, 'single')}
                    value={(selectedOptions[group.id] || [])[0]}
                    className="space-y-2"
                  >
                    {group.options.map(option => (
                      <div key={option.id} className="flex items-center justify-between p-2 border rounded-md">
                        <Label htmlFor={option.id} className="flex items-center gap-2 cursor-pointer">
                           <RadioGroupItem value={option.id} id={option.id} />
                           {option.name}
                        </Label>
                        <span className="text-sm text-muted-foreground">{formatPrice(option.price)}</span>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                <Separator className="mt-4"/>
              </div>
            ))}
          </div>
        </ScrollArea>
        {validationMessage && (
           <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Selection Required</AlertTitle>
            <AlertDescription>
                {validationMessage}
            </AlertDescription>
            </Alert>
        )}
        <DialogFooter className="flex-col sm:flex-row sm:justify-between items-center gap-4 pt-4">
            <div className="flex items-center gap-2">
                 <Button variant="outline" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</Button>
                 <span className="font-bold text-lg w-10 text-center">{quantity}</span>
                 <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)}>+</Button>
            </div>
          <Button onClick={handleAddToCart} size="lg" className="w-full sm:w-auto bg-red-600 hover:bg-red-700">
            Add to Order - £{totalItemPrice.toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
