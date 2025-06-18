
import { ProductListManagement } from '@/components/admin/products/product-list-management';
import { PackageSearch } from 'lucide-react';

export default function AdminProductsManagementPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <PackageSearch className="mr-3 h-10 w-10 text-primary" />
          Manage Store Products
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Oversee all products available in your e-commerce store.
        </p>
      </header>
      <ProductListManagement />
    </div>
  );
}
