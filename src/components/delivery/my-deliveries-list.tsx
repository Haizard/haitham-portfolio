
"use client";

import type { Delivery } from '@/lib/deliveries-data';
import { MyDeliveryListItem } from './my-deliveries-list-item';
import { Truck } from 'lucide-react';

interface MyDeliveriesListProps {
  deliveries: Delivery[];
  onDeliveryUpdate: () => void;
}

export function MyDeliveriesList({ deliveries, onDeliveryUpdate }: MyDeliveriesListProps) {
    if (deliveries.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg shadow-sm bg-card">
                <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Active Deliveries</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  You have not accepted any delivery jobs yet. Go to "Find Deliveries" to get started.
                </p>
            </div>
        );
    }
  
    return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {deliveries.map(delivery => (
        <MyDeliveryListItem key={delivery.id} delivery={delivery} onDeliveryUpdate={onDeliveryUpdate} />
      ))}
    </div>
  );
}
