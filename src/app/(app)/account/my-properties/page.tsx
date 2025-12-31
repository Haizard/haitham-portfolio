"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Hotel, MapPin, Star, Edit, Trash2, Eye, Calendar } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface Property {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  country: string;
  starRating?: number;
  averageRating?: number;
  reviewCount?: number;
  status: string;
  images: Array<{ url: string; isPrimary: boolean }>;
}

interface PropertyBooking {
  id: string;
  propertyId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  guests: {
    adults: number;
    children: number;
  };
  pricing: {
    totalPrice: number;
    currency: string;
  };
  status: string;
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function MyPropertiesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<PropertyBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      // Fetch properties owned by user
      const response = await fetch('/api/hotels/properties?ownerId=me');
      if (response.ok) {
        const data = await response.json();
        setProperties(data.properties || []);

        // Fetch bookings for all properties
        if (data.properties && data.properties.length > 0) {
          const bookingsPromises = data.properties.map((property: Property) =>
            fetch(`/api/hotels/properties/${property.id}/bookings`)
              .then((res) => res.ok ? res.json() : { bookings: [] })
              .then((data) => data.bookings || [])
          );

          const allBookings = await Promise.all(bookingsPromises);
          setBookings(allBookings.flat());
        }
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load properties',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;

    setDeletingId(propertyToDelete);
    try {
      const response = await fetch(`/api/hotels/properties/${propertyToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete property');

      toast({
        title: 'Property Deleted',
        description: 'Your property has been deleted successfully',
      });

      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete property',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
      setShowDeleteDialog(false);
      setPropertyToDelete(null);
    }
  };

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/hotels/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      toast({
        title: 'Status Updated',
        description: `Booking status changed to ${newStatus}`,
      });

      // Update local state
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    } catch (error: any) {
      console.error('Error updating booking status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const getPropertyBookings = (propertyId: string) => {
    return bookings.filter((b) => b.propertyId === propertyId);
  };

  const getTotalRevenue = () => {
    return bookings
      .filter((b) => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + b.pricing.totalPrice, 0);
  };

  const getUpcomingBookings = () => {
    const now = new Date();
    return bookings.filter((b) => {
      const checkIn = new Date(b.checkInDate);
      return checkIn > now && (b.status === 'confirmed' || b.status === 'pending');
    });
  };

  if (isLoading) {
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
          title="My Properties"
          subtitle="Manage your inventory"
        />

        <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto no-scrollbar">
          {/* Mobile Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-primary to-orange-500 rounded-[2rem] p-5 text-white shadow-lg shadow-primary/20 col-span-2">
              <p className="opacity-80 text-[10px] font-black uppercase tracking-widest mb-1">Total Revenue</p>
              <h3 className="text-3xl font-black tracking-tight">${getTotalRevenue().toFixed(2)}</h3>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm">
              <h4 className="text-2xl font-black tracking-tight">{properties.length}</h4>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">Properties</p>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm">
              <h4 className="text-2xl font-black tracking-tight">{getUpcomingBookings().length}</h4>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">Bookings</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex gap-3">
            <Button
              onClick={() => router.push('/account/my-properties/new')}
              className="flex-1 h-12 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Property
            </Button>
          </div>

          {/* Properties List */}
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.15em] opacity-40 px-1">Your Inventory</h3>
            {properties.length === 0 ? (
              <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-12 text-center border border-dashed border-gray-200 dark:border-white/10">
                <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">hotel</span>
                <p className="text-xs font-bold text-muted-foreground">No properties found</p>
              </div>
            ) : (
              properties.map((property) => {
                const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0];
                return (
                  <div key={property.id} className="bg-white dark:bg-white/5 rounded-[2.5rem] p-3 border border-gray-100 dark:border-white/5 shadow-sm flex gap-4">
                    <div className="h-24 w-24 rounded-[1.8rem] overflow-hidden shrink-0 shadow-inner">
                      {primaryImage ? (
                        <img src={primaryImage.url} alt={property.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-muted-foreground">
                          <span className="material-symbols-outlined text-2xl">image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center py-1">
                      <div className="flex justify-between items-start">
                        <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-widest h-5 px-2 mb-1">
                          {property.type}
                        </Badge>
                        <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">{property.status}</span>
                      </div>
                      <h4 className="text-sm font-black tracking-tight truncate mb-0.5">{property.name}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium truncate">
                        <span className="material-symbols-outlined text-[12px]">location_on</span>
                        {property.city}, {property.country}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => router.push(`/account/my-properties/${property.id}/edit`)}
                          className="h-8 w-8 rounded-xl bg-gray-50 dark:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => router.push(`/hotels/${property.id}`)}
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
          <h1 className="text-3xl font-bold mb-2">My Properties</h1>
          <p className="text-muted-foreground">
            Manage your hotel properties and bookings
          </p>
        </div>
        <Button onClick={() => router.push('/account/my-properties/new')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getUpcomingBookings().length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-sm text-muted-foreground">USD</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${getTotalRevenue().toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="properties" className="space-y-6">
        <TabsList>
          <TabsTrigger value="properties">Properties ({properties.length})</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
        </TabsList>

        {/* Properties Tab */}
        <TabsContent value="properties" className="space-y-4">
          {properties.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Hotel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No properties yet</p>
                <Button onClick={() => router.push('/account/my-properties/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Property
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => {
                const primaryImage = property.images.find((img) => img.isPrimary) || property.images[0];
                const propertyBookings = getPropertyBookings(property.id);

                return (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="relative h-48 bg-muted">
                      {primaryImage ? (
                        <img
                          src={primaryImage.url}
                          alt={property.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Hotel className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <Badge className="absolute top-2 left-2 capitalize">
                        {property.type}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="absolute top-2 right-2 capitalize"
                      >
                        {property.status}
                      </Badge>
                    </div>

                    <CardHeader>
                      <CardTitle className="line-clamp-1">{property.name}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">
                          {property.city}, {property.state}, {property.country}
                        </span>
                      </div>
                      {property.averageRating && (
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {property.averageRating.toFixed(1)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({property.reviewCount} reviews)
                          </span>
                        </div>
                      )}
                    </CardHeader>

                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {propertyBookings.length} booking{propertyBookings.length !== 1 ? 's' : ''}
                      </div>
                    </CardContent>

                    <CardFooter className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/hotels/${property.id}`)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => router.push(`/account/my-properties/${property.id}/edit`)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setPropertyToDelete(property.id);
                          setShowDeleteDialog(true);
                        }}
                        disabled={deletingId === property.id}
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

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No bookings yet</p>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => {
              const property = properties.find((p) => p.id === booking.propertyId);
              return (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{property?.name || 'Unknown Property'}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Guest: {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={
                          booking.status === 'confirmed' ? 'default' :
                            booking.status === 'checked_in' ? 'secondary' :
                              booking.status === 'cancelled' ? 'destructive' : 'outline'
                        }>
                          {booking.status}
                        </Badge>
                        <Select
                          defaultValue={booking.status}
                          onValueChange={(val) => handleUpdateBookingStatus(booking.id, val)}
                        >
                          <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="checked_in">Checked In</SelectItem>
                            <SelectItem value="checked_out">Checked Out</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Check-in:</span>
                        <p className="font-medium">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Check-out:</span>
                        <p className="font-medium">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <p className="font-medium">
                          {booking.pricing.currency} {booking.pricing.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
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
            <AlertDialogTitle>Delete Property?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
              All rooms and bookings associated with this property will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProperty} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Property
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

