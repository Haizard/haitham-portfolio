'use client';

import { Bell, BellOff, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface PriceAlertCardProps {
  alert: {
    id: string;
    alertType: string;
    targetName?: string;
    targetPrice: number;
    currentPrice?: number;
    lowestPrice?: number;
    highestPrice?: number;
    currency: string;
    alertTriggered: boolean;
    isActive: boolean;
    expiresAt: string;
  };
  onUpdate?: () => void;
}

export function PriceAlertCard({ alert, onUpdate }: PriceAlertCardProps) {
  const { toast } = useToast();

  const handleToggleActive = async () => {
    try {
      const response = await fetch(`/api/price-alerts/${alert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !alert.isActive }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: alert.isActive ? 'Alert paused' : 'Alert activated',
          description: alert.isActive
            ? 'You will not receive notifications'
            : 'You will receive notifications when price drops',
        });
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error toggling alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to update alert',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/price-alerts/${alert.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Alert deleted',
          description: 'Price alert has been deleted',
        });
        onUpdate?.();
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete alert',
        variant: 'destructive',
      });
    }
  };

  const daysUntilExpiry = Math.ceil(
    (new Date(alert.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-lg">
            {alert.targetName || `${alert.alertType} Alert`}
          </CardTitle>
          <div className="flex items-center gap-2 mt-2">
            {alert.alertTriggered && (
              <Badge variant="default" className="bg-green-600">
                Price Target Reached!
              </Badge>
            )}
            {!alert.isActive && (
              <Badge variant="secondary">Paused</Badge>
            )}
            {daysUntilExpiry <= 7 && (
              <Badge variant="outline">
                Expires in {daysUntilExpiry} days
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleActive}
          >
            {alert.isActive ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Target Price</p>
            <p className="text-lg font-semibold">
              {alert.currency} {alert.targetPrice.toFixed(2)}
            </p>
          </div>
          {alert.currentPrice && (
            <div>
              <p className="text-sm text-muted-foreground">Current Price</p>
              <p className="text-lg font-semibold">
                {alert.currency} {alert.currentPrice.toFixed(2)}
              </p>
            </div>
          )}
          {alert.lowestPrice && (
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingDown className="h-3 w-3" />
                Lowest
              </p>
              <p className="text-lg font-semibold text-green-600">
                {alert.currency} {alert.lowestPrice.toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

