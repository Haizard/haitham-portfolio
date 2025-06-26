
import { VendorFinanceDashboard } from '@/components/vendor/vendor-finance-dashboard';
import { Landmark } from 'lucide-react';

export default function VendorFinancesPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Landmark className="mr-3 h-10 w-10 text-primary" />
          My Finances
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Track your earnings, manage payouts, and view your financial history.
        </p>
      </header>
      <VendorFinanceDashboard />
    </div>
  );
}
