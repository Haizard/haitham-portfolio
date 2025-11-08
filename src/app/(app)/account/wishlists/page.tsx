'use client';

import { useState, useEffect } from 'react';
import { Plus, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { WishlistCard } from '@/components/wishlists/wishlist-card';

export default function WishlistsPage() {
  const [wishlists, setWishlists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedWishlist, setSelectedWishlist] = useState<any>(null);
  const { toast } = useToast();

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    loadWishlists();
  }, []);

  const loadWishlists = async () => {
    try {
      const response = await fetch('/api/wishlists');
      const data = await response.json();

      if (data.success) {
        setWishlists(data.wishlists);
      }
    } catch (error) {
      console.error('Error loading wishlists:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wishlists',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWishlist = async () => {
    try {
      const response = await fetch('/api/wishlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, isPublic }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Wishlist created',
          description: 'Your wishlist has been created successfully',
        });
        setCreateDialogOpen(false);
        setName('');
        setDescription('');
        setIsPublic(false);
        loadWishlists();
      }
    } catch (error) {
      console.error('Error creating wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to create wishlist',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteWishlist = async (wishlistId: string) => {
    if (!confirm('Are you sure you want to delete this wishlist?')) {
      return;
    }

    try {
      const response = await fetch(`/api/wishlists/${wishlistId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Wishlist deleted',
          description: 'Your wishlist has been deleted',
        });
        loadWishlists();
      }
    } catch (error) {
      console.error('Error deleting wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete wishlist',
        variant: 'destructive',
      });
    }
  };

  const handleShareWishlist = (wishlist: any) => {
    setSelectedWishlist(wishlist);
    setShareDialogOpen(true);
  };

  const copyShareLink = () => {
    if (selectedWishlist?.shareToken) {
      const link = `${window.location.origin}/wishlists/shared/${selectedWishlist.shareToken}`;
      navigator.clipboard.writeText(link);
      toast({
        title: 'Link copied',
        description: 'Share link has been copied to clipboard',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading wishlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Wishlists</h1>
          <p className="text-muted-foreground mt-2">
            Save and organize your favorite items
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Wishlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Wishlist</DialogTitle>
              <DialogDescription>
                Create a new wishlist to organize your favorite items
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Summer Vacation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="public">Make Public</Label>
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWishlist} disabled={!name}>
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {wishlists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            You don't have any wishlists yet
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Wishlist
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlists.map((wishlist) => (
            <WishlistCard
              key={wishlist.id}
              wishlist={wishlist}
              onDelete={handleDeleteWishlist}
              onShare={handleShareWishlist}
            />
          ))}
        </div>
      )}

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Wishlist</DialogTitle>
            <DialogDescription>
              Share this wishlist with friends and family
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Share Link</Label>
              <div className="flex gap-2">
                <Input
                  value={
                    selectedWishlist?.shareToken
                      ? `${window.location.origin}/wishlists/shared/${selectedWishlist.shareToken}`
                      : ''
                  }
                  readOnly
                />
                <Button onClick={copyShareLink}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

