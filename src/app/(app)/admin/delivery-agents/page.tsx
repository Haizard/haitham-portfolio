
import { DeliveryAgentListManagement } from '@/components/admin/delivery-agents/delivery-agent-list-management';
import { Truck } from 'lucide-react';

export default function AdminDeliveryAgentsPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Truck className="mr-3 h-10 w-10 text-primary" />
          Manage Delivery Agents
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Approve, manage, and monitor all delivery agents on the platform.
        </p>
      </header>
      <DeliveryAgentListManagement />
    </div>
  );
}
