
import { BookingListManagement } from '@/components/admin/bookings/booking-list-management';
import { CalendarCheck2 } from 'lucide-react';

export default function AdminBookingsPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <CalendarCheck2 className="mr-3 h-10 w-10 text-primary" />
          Manage Service Bookings
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          View, confirm, or cancel client booking requests for your services.
        </p>
      </header>
      <BookingListManagement />
    </div>
  );
}
