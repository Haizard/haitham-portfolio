
"use client";

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart, type CartItem as CartItemType } from '@/hooks/use-cart';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      updateQuantity(item.id!, value);
    }
  };

  return (
    <div className="flex items-start gap-4 py-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
        <Image
          src={item.imageUrl}
          alt={item.name}
          fill
          sizes="64px"
          className="object-cover"
          data-ai-hint={item.imageHint}
        />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex justify-between">
          <h4 className="text-sm font-medium line-clamp-2">{item.name}</h4>
          <p className="text-sm font-semibold">${(item.price! * item.quantity).toFixed(2)}</p>
        </div>
        <p className="text-xs text-muted-foreground">Unit Price: ${item.price!.toFixed(2)}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id!, item.quantity - 1)} disabled={item.quantity <= 1}>
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <Input
              type="number"
              value={item.quantity}
              onChange={handleQuantityChange}
              className="h-7 w-12 text-center p-0"
              min="1"
            />
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.id!, item.quantity + 1)}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeFromCart(item.id!)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
