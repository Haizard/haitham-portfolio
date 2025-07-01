
import { AdminOrderListManagement } from '@/components/admin/orders/admin-order-list-management';
import { ShoppingCart } from 'lucide-react';

export default function AdminOrdersPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <ShoppingCart className="mr-3 h-10 w-10 text-primary" />
          Manage All Orders
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Oversee all orders from all vendors across the platform.
        </p>
      </header>
      <AdminOrderListManagement />
    </div>
  );
}
