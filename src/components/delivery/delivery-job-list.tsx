
"use client";

import type { Delivery } from '@/lib/deliveries-data';
import { DeliveryJobListItem } from './delivery-job-list-item';
import { Map } from 'lucide-react';

interface DeliveryJobListProps {
  deliveries: Delivery[];
  onJobAccepted: () => void;
}

export function DeliveryJobList({ deliveries, onJobAccepted }: DeliveryJobListProps) {
    if (deliveries.length === 0) {
        return (
            <div className="text-center py-10 border rounded-lg shadow-sm bg-card">
                <Map className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No Available Deliveries</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                Check back soon for new delivery opportunities in your area.
                </p>
            </div>
        );
    }
  
    return (
    <div className="space-y-6">
      {deliveries.map(delivery => (
        <DeliveryJobListItem key={delivery.id} delivery={delivery} onJobAccepted={onJobAccepted} />
      ))}
    </div>
  );
}
