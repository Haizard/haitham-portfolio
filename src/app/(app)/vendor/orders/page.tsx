
import { VendorOrderList } from '@/components/vendor/vendor-order-list';
import { ShoppingCart } from 'lucide-react';

export default function VendorOrdersPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <ShoppingCart className="mr-3 h-10 w-10 text-primary" />
          My Orders
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Manage and fulfill orders for your products.
        </p>
      </header>
      <VendorOrderList />
    </div>
  );
}
