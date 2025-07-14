
"use client";

import { useEffect, useState, useCallback } from 'react';
import { MyDeliveriesList } from '@/components/delivery/my-deliveries-list';
import { Loader2, Truck } from 'lucide-react';
import type { Delivery } from '@/lib/deliveries-data';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';

export default function MyDeliveriesPage() {
  const [myDeliveries, setMyDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUser();

  const fetchMyDeliveries = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/deliveries/my-deliveries`);
      if (!response.ok) {
        throw new Error('Failed to fetch your delivery jobs.');
      }
      const data: Delivery[] = await response.json();
      setMyDeliveries(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user?.id]);

  useEffect(() => {
    if (user) {
        fetchMyDeliveries();
    }
  }, [fetchMyDeliveries, user]);

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Truck className="mr-3 h-10 w-10 text-primary" />
          My Active Deliveries
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Manage your accepted delivery tasks and update their status.
        </p>
      </header>
      
       <main>
           {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            ) : (
                <MyDeliveriesList deliveries={myDeliveries} onDeliveryUpdate={fetchMyDeliveries} />
            )}
        </main>
    </div>
  );
}
