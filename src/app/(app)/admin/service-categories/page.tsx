
import { ServiceCategoryManagement } from '@/components/admin/services/service-category-management';
import { FolderKanban } from 'lucide-react';

export default function AdminServiceCategoriesPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <FolderKanban className="mr-3 h-10 w-10 text-primary" />
          Manage Service Categories
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Organize freelancer services by managing categories and subcategories.
        </p>
      </header>
      <ServiceCategoryManagement />
    </div>
  );
}
