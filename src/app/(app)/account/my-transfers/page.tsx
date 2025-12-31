"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Car, Plus, DollarSign, Calendar, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileManagementHeader } from "@/components/layout/mobile-management-header";
import { MobileManagementNav } from "@/components/layout/mobile-management-nav";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface TransferVehicle {
  id: string;
  category: string;
  make: string;
  model: string;
  year: number;
  capacity: {
    passengers: number;
    luggage: number;
  };
  images: Array<{
    url: string;
    isPrimary: boolean;
  }>;
  location: {
    city: string;
    state: string;
  };
  pricing: {
    basePrice: number;
    currency: string;
  };
  status: string;
  totalTransfers: number;
  averageRating?: number;
}

interface TransferBooking {
  id: string;
  vehicleId: string;
  transferType: string;
  pickupLocation: {
    address: string;
    city: string;
  };
  dropoffLocation: {
    address: string;
    city: string;
  };
  pickupDate: string;
  pickupTime: string;
  passengerInfo: {
    firstName: string;
    lastName: string;
    numberOfPassengers: number;
  };
  pricing: {
    totalPrice: number;
    currency: string;
  };
  status: string;
  createdAt: string;
}

export default function MyTransfersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<TransferVehicle[]>([]);
  const [bookings, setBookings] = useState<Record<string, TransferBooking[]>>({});
  const [loading, setLoading] = useState(true);
  const [deleteVehicleId, setDeleteVehicleId] = useState<string | null>(null);
  const [updatingBooking, setUpdatingBooking] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/transfers/vehicles?ownerId=me');
      const data = await response.json();

      if (data.success) {
        setVehicles(data.vehicles);

        // Fetch bookings for each vehicle
        for (const vehicle of data.vehicles) {
          fetchVehicleBookings(vehicle.id);
        }
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vehicles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicleBookings = async (vehicleId: string) => {
    try {
      const response = await fetch(`/api/transfers/vehicles/${vehicleId}/bookings`);
      const data = await response.json();

      if (data.success) {
        setBookings((prev) => ({
          ...prev,
          [vehicleId]: data.bookings,
        }));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!deleteVehicleId) return;

    try {
      const response = await fetch(`/api/transfers/vehicles/${deleteVehicleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete vehicle');
      }

      toast({
        title: 'Success',
        description: 'Vehicle deleted successfully',
      });

      setVehicles(vehicles.filter((v) => v.id !== deleteVehicleId));
      setDeleteVehicleId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete vehicle',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      setUpdatingBooking(bookingId);

      const response = await fetch(`/api/transfers/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking');
      }

      toast({
        title: 'Success',
        description: 'Booking status updated',
      });

      // Refresh bookings
      const booking = Object.values(bookings)
        .flat()
        .find((b) => b.id === bookingId);
      if (booking) {
        fetchVehicleBookings(booking.vehicleId);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update booking',
        variant: 'destructive',
      });
    } finally {
      setUpdatingBooking(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: 'secondary',
      confirmed: 'default',
      assigned: 'default',
      in_progress: 'default',
      completed: 'default',
      cancelled: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'secondary'} className="capitalize">
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const totalRevenue = vehicles.reduce((sum, vehicle) => {
    const vehicleBookings = bookings[vehicle.id] || [];
    const completedBookings = vehicleBookings.filter((b) => b.status === 'completed');
    return sum + completedBookings.reduce((s, b) => s + b.pricing.totalPrice, 0);
  }, 0);

  const activeBookings = Object.values(bookings)
    .flat()
    .filter((b) => b.status === 'in_progress' || b.status === 'assigned').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24 font-display">
        <MobileManagementHeader
          title="My Transfers"
          subtitle="Manage your fleet"
        />

        <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto no-scrollbar">
          {/* Mobile Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-[#0ea5e9] to-[#38bdf8] rounded-[2rem] p-5 text-white shadow-lg shadow-sky-500/20 col-span-2">
              <p className="opacity-80 text-[10px] font-black uppercase tracking-widest mb-1">Total Revenue</p>
              <h3 className="text-3xl font-black tracking-tight">${totalRevenue.toFixed(2)}</h3>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm">
              <h4 className="text-2xl font-black tracking-tight">{vehicles.length}</h4>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">Fleet Size</p>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm">
              <h4 className="text-2xl font-black tracking-tight">{activeBookings}</h4>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">Active</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/account/my-transfers/new')}
              className="flex-1 h-12 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transfer Vehicle
            </Button>
          </div>

          {/* Vehicles List */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.15em] opacity-40 px-1">Your Fleet</h3>
            {vehicles.length === 0 ? (
              <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-12 text-center border border-dashed border-gray-200 dark:border-white/10">
                <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">airport_shuttle</span>
                <p className="text-xs font-bold text-muted-foreground">No vehicles found</p>
              </div>
            ) : (
              vehicles.map((vehicle) => {
                const primaryImage = vehicle.images.find((img) => img.isPrimary) || vehicle.images[0];
                return (
                  <div key={vehicle.id} className="bg-white dark:bg-white/5 rounded-[2.5rem] p-3 border border-gray-100 dark:border-white/5 shadow-sm flex gap-4">
                    <div className="h-24 w-24 rounded-[1.8rem] overflow-hidden shrink-0 shadow-inner bg-gray-100 dark:bg-white/5">
                      {primaryImage ? (
                        <img src={primaryImage.url} alt={`${vehicle.make} ${vehicle.model}`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          <span className="material-symbols-outlined text-2xl">image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-sky-500/10 text-sky-600 border-none text-[8px] font-black uppercase tracking-widest h-5 px-2 mb-1">
                          {vehicle.category}
                        </Badge>
                        <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">{vehicle.status}</span>
                      </div>
                      <h4 className="text-sm font-black tracking-tight truncate mb-0.5">{vehicle.make} {vehicle.model}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium truncate">
                        <span className="material-symbols-outlined text-[12px]">group</span>
                        {vehicle.capacity.passengers} pax • {vehicle.capacity.luggage} bags
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => router.push(`/account/my-transfers/${vehicle.id}/edit`)}
                          className="h-8 w-8 rounded-xl bg-gray-50 dark:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => router.push(`/transfers`)}
                          className="flex-1 h-8 rounded-xl bg-gray-50 dark:bg-white/10 text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                          Live View
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <MobileManagementNav />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Transfer Vehicles</h1>
          <p className="text-muted-foreground">Manage your transfer vehicles and bookings</p>
        </div>
        <Button onClick={() => router.push('/account/my-transfers/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Transfers</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vehicles List */}
      {vehicles.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              You haven't added any transfer vehicles yet
            </p>
            <Button onClick={() => router.push('/account/my-transfers/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Vehicle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {vehicles.map((vehicle) => {
            const vehicleBookings = bookings[vehicle.id] || [];
            const primaryImage = vehicle.images.find((img) => img.isPrimary) || vehicle.images[0];

            return (
              <Card key={vehicle.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      {primaryImage && (
                        <div className="w-24 h-24 rounded-md overflow-hidden bg-muted">
                          <img
                            src={primaryImage.url}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-xl">
                          {vehicle.make} {vehicle.model} {vehicle.year}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {vehicle.location.city}, {vehicle.location.state}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge className="capitalize">{vehicle.category}</Badge>
                          <Badge variant="outline">{getStatusBadge(vehicle.status)}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {vehicle.totalTransfers} transfers
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.push(`/account/my-transfers/${vehicle.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteVehicleId(vehicle.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h3 className="font-semibold mb-4">Recent Bookings</h3>
                  {vehicleBookings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No bookings yet</p>
                  ) : (
                    <div className="space-y-3">
                      {vehicleBookings.slice(0, 5).map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">
                                {booking.passengerInfo.firstName} {booking.passengerInfo.lastName}
                              </span>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p>
                                {booking.pickupLocation.city} → {booking.dropoffLocation.city}
                              </p>
                              <p>
                                {format(new Date(booking.pickupDate), 'MMM dd, yyyy')} at{' '}
                                {booking.pickupTime}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {booking.pricing.currency} {booking.pricing.totalPrice}
                            </p>
                            {booking.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                                disabled={updatingBooking === booking.id}
                              >
                                {updatingBooking === booking.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Confirm'
                                )}
                              </Button>
                            )}
                            {booking.status === 'confirmed' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateBookingStatus(booking.id, 'assigned')}
                                disabled={updatingBooking === booking.id}
                              >
                                Assign
                              </Button>
                            )}
                            {booking.status === 'assigned' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateBookingStatus(booking.id, 'in_progress')}
                                disabled={updatingBooking === booking.id}
                              >
                                Start
                              </Button>
                            )}
                            {booking.status === 'in_progress' && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                                disabled={updatingBooking === booking.id}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteVehicleId} onOpenChange={() => setDeleteVehicleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVehicle}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

