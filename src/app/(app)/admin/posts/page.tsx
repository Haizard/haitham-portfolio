
import { PostListManagement } from '@/components/admin/posts/post-list-management';
import { FileText } from 'lucide-react';

export default function AdminPostsPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <FileText className="mr-3 h-10 w-10 text-primary" />
          Manage Blog Posts
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          View, edit, and delete your blog posts.
        </p>
      </header>
      <PostListManagement />
    </div>
  );
}
