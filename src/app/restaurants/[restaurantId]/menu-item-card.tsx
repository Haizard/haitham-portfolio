
"use client";

import type { MenuItem } from '@/lib/restaurants-data';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Leaf, Flame, WheatOff } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

const DIETARY_ICONS: { [key: string]: React.ElementType } = {
  vegetarian: Leaf,
  spicy: Flame,
  'gluten-free': WheatOff,
};

const DIETARY_COLORS: { [key: string]: string } = {
  vegetarian: 'text-green-600',
  spicy: 'text-red-600',
  'gluten-free': 'text-yellow-600',
};

interface MenuItemCardProps {
  item: MenuItem;
  onOpenDialog: (item: MenuItem) => void;
}

export function MenuItemCard({ item, onOpenDialog }: MenuItemCardProps) {
  const { addToCart } = useCart();
  
  const handleAction = () => {
    // If there are options, open the dialog. Otherwise, add directly to cart.
    if (item.optionGroups && item.optionGroups.length > 0) {
      onOpenDialog(item);
    } else {
      const productToAdd = {
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        description: item.description,
        productType: 'creator' as const,
        vendorId: item.restaurantId,
      };
      addToCart(productToAdd);
    }
  }

  return (
    <Card className="flex flex-row p-4 gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={handleAction}>
      <div className="flex-1">
        <h3 className="font-bold">{item.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.description}</p>
        <div className="flex items-center justify-between mt-2">
            <p className="font-semibold text-base">${item.price.toFixed(2)}</p>
            <div className="flex items-center gap-2">
                {item.dietaryFlags?.map(flag => {
                    const Icon = DIETARY_ICONS[flag];
                    const colorClass = DIETARY_COLORS[flag] || 'text-muted-foreground';
                    return Icon ? <Icon key={flag} className={`h-4 w-4 ${colorClass}`} title={flag} /> : null;
                })}
            </div>
        </div>
      </div>
       <div className="flex-shrink-0 flex flex-col items-end justify-start gap-2">
        <Image src={item.imageUrl} alt={item.name} width={80} height={80} className="rounded-md object-cover border" />
         <Button size="icon" variant="outline" className="rounded-full h-8 w-8 hover:bg-red-500 hover:text-white mt-auto" onClick={(e) => { e.stopPropagation(); handleAction(); }}>
            <Plus className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
}
