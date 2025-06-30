import { PayoutListManagement } from '@/components/admin/payouts/payout-list-management';
import { Banknote } from 'lucide-react';

export default function AdminPayoutsPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Banknote className="mr-3 h-10 w-10 text-primary" />
          Manage Payouts
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Review, approve, and process vendor withdrawal requests.
        </p>
      </header>
      <PayoutListManagement />
    </div>
  );
}
