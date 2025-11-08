'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

interface PriceAlertButtonProps {
  alertType: 'property' | 'vehicle' | 'tour' | 'transfer' | 'flight';
  targetId: string;
  targetName: string;
  currentPrice: number;
  searchCriteria: any;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export function PriceAlertButton({
  alertType,
  targetId,
  targetName,
  currentPrice,
  searchCriteria,
  variant = 'outline',
  size = 'sm',
}: PriceAlertButtonProps) {
  const [open, setOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState(
    Math.floor(currentPrice * 0.9).toString()
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateAlert = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertType,
          targetId,
          targetName,
          targetPrice: parseFloat(targetPrice),
          currency: 'USD',
          searchCriteria,
          currentPrice,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Price alert created',
          description: `You'll be notified when the price drops to $${targetPrice}`,
        });
        setOpen(false);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to create price alert',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating price alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to create price alert',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size}>
          <Bell className="h-4 w-4 mr-2" />
          Set Price Alert
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Price Alert</DialogTitle>
          <DialogDescription>
            Get notified when the price drops below your target price
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Item</Label>
            <p className="text-sm text-muted-foreground">{targetName}</p>
          </div>
          <div className="space-y-2">
            <Label>Current Price</Label>
            <p className="text-lg font-semibold">${currentPrice.toFixed(2)}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetPrice">Target Price</Label>
            <Input
              id="targetPrice"
              type="number"
              step="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Enter target price"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 10% below current price
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateAlert} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Alert'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

