'use client';

import { useState, useEffect } from 'react';
import { Plus, Bell, BellOff, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { AirportAutocomplete } from '@/components/flights/airport-autocomplete';

interface PriceAlert {
  id: string;
  route: {
    origin: string;
    destination: string;
    departureDate?: string;
    returnDate?: string;
  };
  targetPrice: number;
  currency: string;
  currentPrice?: number;
  lowestPrice?: number;
  highestPrice?: number;
  alertTriggered: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function PriceAlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  // Form state
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [targetPrice, setTargetPrice] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/flights/price-alerts');
      const data = await response.json();

      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAlert = async () => {
    if (!origin || !destination || !targetPrice) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/flights/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route: { origin, destination },
          targetPrice: parseFloat(targetPrice),
          currency: 'USD',
          notificationPreferences: { email: true, push: false },
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Price alert created successfully',
        });
        setShowCreateDialog(false);
        setOrigin('');
        setDestination('');
        setTargetPrice('');
        fetchAlerts();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create price alert',
        variant: 'destructive',
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/flights/price-alerts/${alertId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Price alert deleted',
        });
        fetchAlerts();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete price alert',
        variant: 'destructive',
      });
    }
  };

  const deactivateAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/flights/price-alerts/${alertId}`, {
        method: 'PATCH',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Price alert deactivated',
        });
        fetchAlerts();
      } else {
        throw new Error(data.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to deactivate price alert',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading price alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Price Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Get notified when flight prices drop to your target
          </p>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Alert
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Price Alert</DialogTitle>
              <DialogDescription>
                Set a target price and we'll notify you when flights match or go below it
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label>From</Label>
                <AirportAutocomplete
                  value={origin}
                  onValueChange={setOrigin}
                  placeholder="Select origin airport"
                />
              </div>

              <div>
                <Label>To</Label>
                <AirportAutocomplete
                  value={destination}
                  onValueChange={setDestination}
                  placeholder="Select destination airport"
                />
              </div>

              <div>
                <Label>Target Price (USD)</Label>
                <Input
                  type="number"
                  placeholder="500"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                />
              </div>

              <Button onClick={createAlert} className="w-full">
                Create Alert
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No price alerts yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first price alert to get notified when prices drop
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Alert
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {alerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {alert.route.origin} → {alert.route.destination}
                    </CardTitle>
                    <CardDescription>
                      Target: ${alert.targetPrice} {alert.currency}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {alert.isActive ? (
                      <Badge variant="default">
                        <Bell className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <BellOff className="mr-1 h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                    {alert.alertTriggered && (
                      <Badge variant="destructive">Price Alert!</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {alert.currentPrice && (
                    <div>
                      <p className="text-sm text-muted-foreground">Current Price</p>
                      <p className="text-lg font-semibold">
                        ${alert.currentPrice}
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
                        ${alert.lowestPrice}
                      </p>
                    </div>
                  )}
                  {alert.highestPrice && (
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Highest
                      </p>
                      <p className="text-lg font-semibold text-red-600">
                        ${alert.highestPrice}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {alert.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deactivateAlert(alert.id)}
                    >
                      <BellOff className="mr-2 h-4 w-4" />
                      Deactivate
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteAlert(alert.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

