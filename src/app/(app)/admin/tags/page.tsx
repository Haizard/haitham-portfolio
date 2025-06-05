
import { TagManagement } from '@/components/admin/tags/tag-management';
import { Tags } from 'lucide-react';

export default function AdminTagsPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Tags className="mr-3 h-10 w-10 text-primary" />
          Manage Tags
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Create, edit, and delete tags for your blog posts.
        </p>
      </header>
      <TagManagement />
    </div>
  );
}
