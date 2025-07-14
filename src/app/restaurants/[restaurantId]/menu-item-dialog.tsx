
"use client";

import { useState, useMemo } from 'react';
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
import type { MenuItem, MenuItemOption, MenuItemOptionGroup } from '@/lib/restaurants-data';
import { Badge } from '@/components/ui/badge';

interface MenuItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem;
}

const formatPrice = (price: number) => {
  if (price === 0) return 'FREE';
  return `+£${price.toFixed(2)}`;
};

export function MenuItemDialog({ isOpen, onClose, item }: MenuItemDialogProps) {
  const { addToCart } = useCart();
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);

  const handleSelectionChange = (groupId: string, optionId: string, selectionType: 'single' | 'multi') => {
    setSelectedOptions(prev => {
      const newSelection = { ...prev };
      const currentGroupSelection = newSelection[groupId] || [];

      if (selectionType === 'single') {
        newSelection[groupId] = [optionId];
      } else { // multi
        if (currentGroupSelection.includes(optionId)) {
          newSelection[groupId] = currentGroupSelection.filter(id => id !== optionId);
        } else {
          newSelection[groupId] = [...currentGroupSelection, optionId];
        }
      }
      return newSelection;
    });
  };
  
  const validationInfo = useMemo(() => {
    let isValid = true;
    let message = "";
    for (const group of item.optionGroups || []) {
      if (group.isRequired) {
        const selectionCount = selectedOptions[group.id]?.length || 0;
        const required = group.requiredCount || 1;
        if (selectionCount < required) {
          isValid = false;
          message = `Please select at least ${required} option(s) from "${group.title}".`;
          break;
        }
      }
    }
    return { isValid, message };
  }, [selectedOptions, item.optionGroups]);

  const totalExtrasPrice = useMemo(() => {
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
  }, [selectedOptions, item.optionGroups]);

  const totalItemPrice = (item.price + totalExtrasPrice) * quantity;
  
  const handleAddToCart = () => {
    if (!validationInfo.isValid) {
      alert(validationInfo.message); // Simple alert for now, could be a toast
      return;
    }
    
    let customizedName = item.name;
    const descriptions: string[] = [];
    
    // Add selected options to description
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
      id: `${item.id}-${JSON.stringify(selectedOptions)}`, // Create a unique ID for this specific customization
      name: customizedName,
      price: item.price + totalExtrasPrice, // Final price per item
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
                    {group.isRequired && <Badge variant="outline">Required {group.requiredCount || 1}</Badge>}
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
