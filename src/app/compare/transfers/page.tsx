'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFormatPrice } from '@/contexts/currency-context';

export default function CompareTransfersPage() {
  const searchParams = useSearchParams();
  const itemIds = searchParams.get('items')?.split(',') || [];
  const [transfers, setTransfers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const format = useFormatPrice();

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    try {
      const promises = itemIds.map((id) =>
        fetch(`/api/transfers/${id}`).then((res) => res.json())
      );
      const results = await Promise.all(promises);
      const validTransfers = results
        .filter((r) => r.success)
        .map((r) => r.transfer);
      setTransfers(validTransfers);
    } catch (error) {
      console.error('Error loading transfers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transfers',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (transferId: string) => {
    try {
      await fetch(`/api/comparisons/transfer/items/${transferId}`, {
        method: 'DELETE',
      });
      setTransfers(transfers.filter((t) => t.id !== transferId));
      toast({
        title: 'Removed',
        description: 'Transfer removed from comparison',
      });
    } catch (error) {
      console.error('Error removing transfer:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No transfers to compare</p>
          <Link href="/transfers">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Transfers
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/transfers">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Transfers
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mt-4">Compare Transfers</h1>
        <p className="text-muted-foreground mt-2">
          Compare up to 3 transfer options side by side
        </p>
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-4 bg-muted text-left font-semibold">
                Feature
              </th>
              {transfers.map((transfer) => (
                <th key={transfer.id} className="border p-4 bg-muted">
                  <div className="flex items-start justify-between">
                    <div className="text-left">
                      <p className="font-semibold">
                        {transfer.vehicleType}
                      </p>
                      <p className="text-sm text-muted-foreground font-normal">
                        {transfer.make} {transfer.model}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(transfer.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-4 font-semibold">Base Price</td>
              {transfers.map((transfer) => (
                <td key={transfer.id} className="border p-4 text-center">
                  <p className="text-lg font-bold text-primary">
                    {format(transfer.basePrice, 'USD')}
                  </p>
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Price per KM</td>
              {transfers.map((transfer) => (
                <td key={transfer.id} className="border p-4 text-center">
                  {format(transfer.pricePerKm, 'USD')}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Capacity</td>
              {transfers.map((transfer) => (
                <td key={transfer.id} className="border p-4 text-center">
                  {transfer.capacity} passengers
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Luggage</td>
              {transfers.map((transfer) => (
                <td key={transfer.id} className="border p-4 text-center">
                  {transfer.luggageCapacity} bags
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Features</td>
              {transfers.map((transfer) => (
                <td key={transfer.id} className="border p-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {transfer.features?.slice(0, 5).map((feature: string) => (
                      <Badge key={feature} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Action</td>
              {transfers.map((transfer) => (
                <td key={transfer.id} className="border p-4 text-center">
                  <Link href={`/transfers/${transfer.id}`}>
                    <Button>View Details</Button>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {transfers.map((transfer) => (
          <Card key={transfer.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{transfer.vehicleType}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {transfer.make} {transfer.model}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(transfer.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Base Price</p>
                <p className="text-2xl font-bold text-primary">
                  {format(transfer.basePrice, 'USD')}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p>{transfer.capacity} passengers</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Luggage</p>
                  <p>{transfer.luggageCapacity} bags</p>
                </div>
              </div>
              <Link href={`/transfers/${transfer.id}`}>
                <Button className="w-full">View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

