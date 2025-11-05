
"use client";

import { useEffect, useState, useCallback } from 'react';
import { DeliveryJobList } from '@/components/delivery/delivery-job-list';
import { Loader2, Map } from 'lucide-react';
import type { Delivery } from '@/lib/deliveries-data';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';

export default function FindTransportWorkPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUser();

  const fetchAvailableDeliveries = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/deliveries`);
      if (!response.ok) {
        throw new Error('Failed to fetch available delivery jobs.');
      }
      const data: Delivery[] = await response.json();
      setDeliveries(data);
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
        fetchAvailableDeliveries();
    }
  }, [fetchAvailableDeliveries, user]);

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Map className="mr-3 h-10 w-10 text-primary" />
          Find Transport Jobs
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Browse and accept available delivery tasks in your area.
        </p>
      </header>
      
       <main>
           {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            ) : (
                <DeliveryJobList deliveries={deliveries} onJobAccepted={fetchAvailableDeliveries} />
            )}
        </main>
    </div>
  );
}
