
import { ClientProjectListManagement } from '@/components/admin/client-projects/client-project-list-management';
import { Briefcase } from 'lucide-react';

export default function AdminClientProjectsPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Briefcase className="mr-3 h-10 w-10 text-primary" />
          Manage Client Projects
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Oversee all client projects, update their status, and manage details.
        </p>
      </header>
      <ClientProjectListManagement />
    </div>
  );
}
