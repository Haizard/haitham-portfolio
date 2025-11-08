'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CompareBarProps {
  comparisonType: 'property' | 'vehicle' | 'tour' | 'transfer';
}

export function CompareBar({ comparisonType }: CompareBarProps) {
  const [comparison, setComparison] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadComparison();

    // Poll for updates every 2 seconds
    const interval = setInterval(loadComparison, 2000);
    return () => clearInterval(interval);
  }, [comparisonType]);

  const loadComparison = async () => {
    try {
      const response = await fetch(`/api/comparisons/${comparisonType}`);
      const data = await response.json();

      if (data.success && data.comparison.items.length > 0) {
        setComparison(data.comparison);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error loading comparison:', error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await fetch(`/api/comparisons/${comparisonType}/items/${itemId}`, {
        method: 'DELETE',
      });
      loadComparison();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await fetch(`/api/comparisons/${comparisonType}`, {
        method: 'DELETE',
      });
      setIsVisible(false);
    } catch (error) {
      console.error('Error clearing comparison:', error);
    }
  };

  const handleCompare = () => {
    const itemIds = comparison.items.map((item: any) => item.itemId).join(',');
    router.push(`/compare/${comparisonType}?items=${itemIds}`);
  };

  if (!isVisible || !comparison) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <Card className="max-w-4xl mx-auto p-4 shadow-lg border-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-primary" />
            <span className="font-semibold">
              Compare ({comparison.items.length}/3)
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 overflow-x-auto">
            {comparison.items.map((item: any) => (
              <div
                key={item.itemId}
                className="flex items-center gap-2 bg-secondary px-3 py-1 rounded-md"
              >
                <span className="text-sm truncate max-w-[150px]">
                  Item {item.itemId.slice(-6)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => handleRemoveItem(item.itemId)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
            <Button
              size="sm"
              onClick={handleCompare}
              disabled={comparison.items.length < 2}
            >
              Compare Now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

