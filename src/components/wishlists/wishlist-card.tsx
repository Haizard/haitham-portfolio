'use client';

import Link from 'next/link';
import { Heart, Lock, Globe, MoreVertical, Trash2, Edit, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WishlistCardProps {
  wishlist: {
    id: string;
    name: string;
    description?: string;
    items: any[];
    isDefault: boolean;
    isPublic: boolean;
    shareToken?: string;
  };
  onEdit?: (wishlist: any) => void;
  onDelete?: (wishlistId: string) => void;
  onShare?: (wishlist: any) => void;
}

export function WishlistCard({
  wishlist,
  onEdit,
  onDelete,
  onShare,
}: WishlistCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1">
          <Link href={`/account/wishlists/${wishlist.id}`}>
            <CardTitle className="text-lg hover:text-primary cursor-pointer">
              {wishlist.name}
            </CardTitle>
          </Link>
          {wishlist.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {wishlist.description}
            </p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(wishlist)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
            )}
            {onShare && wishlist.isPublic && (
              <DropdownMenuItem onClick={() => onShare(wishlist)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
            )}
            {onDelete && !wishlist.isDefault && (
              <DropdownMenuItem
                onClick={() => onDelete(wishlist.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {wishlist.items.length} {wishlist.items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {wishlist.isDefault && (
              <Badge variant="secondary">Default</Badge>
            )}
            {wishlist.isPublic ? (
              <Globe className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

