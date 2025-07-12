
import { VendorProductListManagement } from '@/components/vendor/vendor-product-list-management';
import { PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FolderKanban, Tags } from 'lucide-react';

export default function AdminProductsManagementPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
            <PackageSearch className="mr-3 h-10 w-10 text-primary" />
            Manage Store Products
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Oversee all products available in the e-commerce store.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button asChild variant="outline">
             <Link href="/admin/product-categories">
                <FolderKanban className="mr-2 h-4 w-4"/> Manage Product Categories
            </Link>
          </Button>
           <Button asChild variant="outline">
             <Link href="/admin/product-tags">
                <Tags className="mr-2 h-4 w-4"/> Manage Product Tags
            </Link>
          </Button>
        </div>
      </header>
      <VendorProductListManagement isAdminView={true} />
    </div>
  );
}
