
import { VendorPostListManagement } from '@/components/vendor/vendor-post-list-management';
import { FileText } from 'lucide-react';

export default function VendorPostsPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <FileText className="mr-3 h-10 w-10 text-primary" />
          My Blog Posts
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Create, edit, and manage blog posts for your products and store.
        </p>
      </header>
      <VendorPostListManagement />
    </div>
  );
}
