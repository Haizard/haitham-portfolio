
import { TourActivityManagement } from '@/components/admin/tours/tour-activity-management';
import { MountainSnow } from 'lucide-react';

export default function AdminTourActivitiesPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <MountainSnow className="mr-3 h-10 w-10 text-primary" />
          Manage Tour Activities
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Create, edit, and manage activities that can be associated with tour packages.
        </p>
      </header>
      <TourActivityManagement />
    </div>
  );
}
