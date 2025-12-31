"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Car, MapPin, Star, Edit, Trash2, Eye, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
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

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  category: string;
  transmission: string;
  fuelType: string;
  color: string;
  licensePlate: string;
  location: {
    city: string;
    state: string;
    country: string;
  };
  pricing: {
    dailyRate: number;
    currency: string;
  };
  status: string;
  averageRating?: number;
  reviewCount?: number;
  totalRentals: number;
  images: Array<{ url: string; isPrimary: boolean }>;
}

interface VehicleRental {
  id: string;
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
  numberOfDays: number;
  pricing: {
    totalPrice: number;
    currency: string;
  };
  status: string;
  driverInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  mileageStart?: number;
  mileageEnd?: number;
}

export default function MyVehiclesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [rentals, setRentals] = useState<VehicleRental[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [updatingRentalId, setUpdatingRentalId] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      // Fetch vehicles owned by user
      const response = await fetch('/api/cars/vehicles?ownerId=me');
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles || []);

        // Fetch rentals for all vehicles
        if (data.vehicles && data.vehicles.length > 0) {
          const rentalsPromises = data.vehicles.map((vehicle: Vehicle) =>
            fetch(`/api/cars/vehicles/${vehicle.id}/rentals`)
              .then((res) => res.ok ? res.json() : { rentals: [] })
              .then((data) => data.rentals || [])
          );

          const allRentals = await Promise.all(rentalsPromises);
          setRentals(allRentals.flat());
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
      setIsLoading(false);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;

    setDeletingId(vehicleToDelete);
    try {
      const response = await fetch(`/api/cars/vehicles/${vehicleToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete vehicle');

      toast({
        title: 'Vehicle Deleted',
        description: 'Your vehicle has been deleted successfully',
      });

      fetchVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete vehicle',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
      setShowDeleteDialog(false);
      setVehicleToDelete(null);
    }
  };

  const handleUpdateRentalStatus = async (rentalId: string, newStatus: string) => {
    setUpdatingRentalId(rentalId);
    try {
      const response = await fetch(`/api/cars/rentals/${rentalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update rental status');

      toast({
        title: 'Status Updated',
        description: `Rental status changed to ${newStatus}`,
      });

      fetchVehicles();
    } catch (error) {
      console.error('Error updating rental:', error);
      toast({
        title: 'Error',
        description: 'Failed to update rental status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingRentalId(null);
    }
  };

  const getVehicleRentals = (vehicleId: string) => {
    return rentals.filter((r) => r.vehicleId === vehicleId);
  };

  const getTotalRevenue = () => {
    return rentals
      .filter((r) => r.status === 'confirmed' || r.status === 'completed')
      .reduce((sum, r) => sum + r.pricing.totalPrice, 0);
  };

  const getActiveRentals = () => {
    return rentals.filter((r) => r.status === 'active' || r.status === 'confirmed');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24 font-display">
        <MobileManagementHeader
          title="My Vehicles"
          subtitle="Manage your fleet"
        />

        <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto no-scrollbar">
          {/* Mobile Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2rem] p-5 text-white shadow-lg shadow-blue-600/20 col-span-2">
              <p className="opacity-80 text-[10px] font-black uppercase tracking-widest mb-1">Total Revenue</p>
              <h3 className="text-3xl font-black tracking-tight">${getTotalRevenue().toFixed(2)}</h3>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm">
              <h4 className="text-2xl font-black tracking-tight">{vehicles.length}</h4>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">Vehicles</p>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm">
              <h4 className="text-2xl font-black tracking-tight">{getActiveRentals().length}</h4>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">Active</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/account/my-vehicles/new')}
              className="flex-1 h-12 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Vehicle
            </Button>
          </div>

          {/* Vehicles List */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.15em] opacity-40 px-1">Active Fleet</h3>
            {vehicles.length === 0 ? (
              <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-12 text-center border border-dashed border-gray-200 dark:border-white/10">
                <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">directions_car</span>
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
                        <Badge className="bg-blue-500/10 text-blue-600 border-none text-[8px] font-black uppercase tracking-widest h-5 px-2 mb-1">
                          {vehicle.category}
                        </Badge>
                        <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">{vehicle.status}</span>
                      </div>
                      <h4 className="text-sm font-black tracking-tight truncate mb-0.5">{vehicle.make} {vehicle.model}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium truncate">
                        <span className="material-symbols-outlined text-[12px]">payments</span>
                        ${vehicle.pricing.dailyRate}/day
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => router.push(`/account/my-vehicles/${vehicle.id}/edit`)}
                          className="h-8 w-8 rounded-xl bg-gray-50 dark:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => router.push(`/cars/${vehicle.id}`)}
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Vehicles</h1>
          <p className="text-muted-foreground">
            Manage your rental vehicles and bookings
          </p>
        </div>
        <Button onClick={() => router.push('/account/my-vehicles/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
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
            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getActiveRentals().length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalRevenue().toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vehicles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="vehicles">Vehicles ({vehicles.length})</TabsTrigger>
          <TabsTrigger value="rentals">Rentals ({rentals.length})</TabsTrigger>
        </TabsList>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles" className="space-y-4">
          {vehicles.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No vehicles yet</p>
                <Button onClick={() => router.push('/account/my-vehicles/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Vehicle
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => {
                const primaryImage = vehicle.images.find((img) => img.isPrimary) || vehicle.images[0];
                const vehicleRentals = getVehicleRentals(vehicle.id);

                return (
                  <Card key={vehicle.id} className="overflow-hidden">
                    <div className="relative h-48 bg-muted">
                      {primaryImage ? (
                        <img
                          src={primaryImage.url}
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Car className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <Badge className="absolute top-2 left-2 capitalize">
                        {vehicle.category}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="absolute top-2 right-2 capitalize"
                      >
                        {vehicle.status}
                      </Badge>
                    </div>

                    <CardHeader>
                      <CardTitle className="line-clamp-1">
                        {vehicle.make} {vehicle.model} {vehicle.year}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">
                          {vehicle.location.city}, {vehicle.location.state}
                        </span>
                      </div>
                      {vehicle.averageRating && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {vehicle.averageRating.toFixed(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({vehicle.reviewCount} reviews)
                          </span>
                        </div>
                      )}
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Daily Rate:</span>
                          <span className="font-medium">
                            ${vehicle.pricing.dailyRate} {vehicle.pricing.currency}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Rentals:</span>
                          <span className="font-medium">{vehicle.totalRentals}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active Rentals:</span>
                          <span className="font-medium">{vehicleRentals.length}</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/cars/${vehicle.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/account/my-vehicles/${vehicle.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setVehicleToDelete(vehicle.id);
                          setShowDeleteDialog(true);
                        }}
                        disabled={deletingId === vehicle.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Rentals Tab */}
        <TabsContent value="rentals" className="space-y-4">
          {rentals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No rentals yet</p>
              </CardContent>
            </Card>
          ) : (
            rentals.map((rental) => {
              const vehicle = vehicles.find((v) => v.id === rental.vehicleId);
              return (
                <Card key={rental.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Driver: {rental.driverInfo.firstName} {rental.driverInfo.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {rental.driverInfo.email}
                        </p>
                      </div>
                      <Badge>{rental.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Pickup:</span>
                        <p className="font-medium">{new Date(rental.pickupDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Return:</span>
                        <p className="font-medium">{new Date(rental.returnDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <p className="font-medium">
                          {rental.pricing.currency} {rental.pricing.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {rental.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateRentalStatus(rental.id, 'confirmed')}
                          disabled={updatingRentalId === rental.id}
                        >
                          {updatingRentalId === rental.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Confirm Rental'
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUpdateRentalStatus(rental.id, 'cancelled')}
                          disabled={updatingRentalId === rental.id}
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                    {rental.status === 'confirmed' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateRentalStatus(rental.id, 'active')}
                        disabled={updatingRentalId === rental.id}
                      >
                        {updatingRentalId === rental.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Mark as Active (Picked Up)'
                        )}
                      </Button>
                    )}

                    {rental.status === 'active' && (
                      <Button
                        size="sm"
                        onClick={() => handleUpdateRentalStatus(rental.id, 'completed')}
                        disabled={updatingRentalId === rental.id}
                      >
                        {updatingRentalId === rental.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Mark as Completed (Returned)'
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vehicle? This action cannot be undone.
              All rentals associated with this vehicle will also be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteVehicle} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Vehicle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

