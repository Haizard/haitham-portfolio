
import { ProductCategoryManagement } from '@/components/admin/products/product-category-management';
import { FolderKanban } from 'lucide-react';

export default function AdminProductCategoriesPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <FolderKanban className="mr-3 h-10 w-10 text-primary" />
          Manage Product Categories
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Organize your store's products effectively by managing categories and subcategories.
        </p>
      </header>
      <ProductCategoryManagement />
    </div>
  );
}
