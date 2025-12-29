
import { TourListManagement } from '@/components/admin/tours/tour-list-management';
import { Compass } from 'lucide-react';

export default function AdminToursPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Compass className="mr-3 h-10 w-10 text-primary" />
          Manage Tour Packages
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Create, edit, and manage all tourism packages offered on the platform.
        </p>
      </header>
      <TourListManagement />
    </div>
  );
}
