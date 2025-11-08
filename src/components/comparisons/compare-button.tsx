'use client';

import { useState, useEffect } from 'react';
import { GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface CompareButtonProps {
  itemType: 'property' | 'vehicle' | 'tour' | 'transfer';
  itemId: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

export function CompareButton({
  itemType,
  itemId,
  className,
  variant = 'outline',
  size = 'sm',
}: CompareButtonProps) {
  const [isInComparison, setIsInComparison] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if item is in comparison on mount
  useEffect(() => {
    checkIfInComparison();
  }, [itemId]);

  const checkIfInComparison = async () => {
    try {
      const response = await fetch(`/api/comparisons/${itemType}`);
      const data = await response.json();

      if (data.success) {
        const inComparison = data.comparison.items.some(
          (item: any) => item.itemId === itemId
        );
        setIsInComparison(inComparison);
      }
    } catch (error) {
      console.error('Error checking comparison:', error);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);

    try {
      if (isInComparison) {
        // Remove from comparison
        const response = await fetch(
          `/api/comparisons/${itemType}/items/${itemId}`,
          { method: 'DELETE' }
        );

        const data = await response.json();

        if (data.success) {
          setIsInComparison(false);
          toast({
            title: 'Removed from comparison',
            description: 'Item has been removed from comparison',
          });
        }
      } else {
        // Add to comparison
        const response = await fetch('/api/comparisons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            comparisonType: itemType,
            itemId,
          }),
        });

        const data = await response.json();

        if (data.success) {
          setIsInComparison(true);
          toast({
            title: 'Added to comparison',
            description: `Item added to comparison (${data.comparison.items.length}/3)`,
          });
        } else if (data.error === 'Comparison is full. Maximum 3 items allowed.') {
          toast({
            title: 'Comparison full',
            description: 'You can only compare up to 3 items at a time',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error toggling comparison:', error);
      toast({
        title: 'Error',
        description: 'Failed to update comparison',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleToggle}
      disabled={isLoading}
    >
      <GitCompare className={cn('h-4 w-4 mr-2', isInComparison && 'text-primary')} />
      {isInComparison ? 'Remove from Compare' : 'Compare'}
    </Button>
  );
}

