
import { VendorListManagement } from '@/components/admin/vendors/vendor-list-management';
import { Users } from 'lucide-react';

export default function AdminVendorsPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Users className="mr-3 h-10 w-10 text-primary" />
          Manage Vendors
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Approve, manage, and monitor all vendors on the platform.
        </p>
      </header>
      <VendorListManagement />
    </div>
  );
}
