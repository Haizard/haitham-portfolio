
import { TransportPartnerListManagement } from '@/components/admin/transport-partners/transport-partner-list-management';
import { Truck } from 'lucide-react';

export default function AdminTransportPartnersPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Truck className="mr-3 h-10 w-10 text-primary" />
          Manage Transport Partners
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Approve, manage, and monitor all transport partners on the platform.
        </p>
      </header>
      <TransportPartnerListManagement />
    </div>
  );
}
