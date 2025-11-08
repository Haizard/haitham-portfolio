"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Loader2,
  Map,
  Plus,
  Calendar,
  Users,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Star,
  TrendingUp,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { TourPackage, TourBooking } from '@/lib/tours-data';

interface DashboardStats {
  totalTours: number;
  activeTours: number;
  totalBookings: number;
  upcomingBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export default function MyToursPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [bookings, setBookings] = useState<TourBooking[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTours: 0,
    activeTours: 0,
    totalBookings: 0,
    upcomingBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch tours owned by the current user
      const toursResponse = await fetch('/api/tours?ownerId=me');
      if (!toursResponse.ok) throw new Error('Failed to fetch tours');
      const toursData = await toursResponse.json();
      const userTours = toursData.tours || [];
      setTours(userTours);

      // Fetch all bookings for user's tours
      const allBookings: TourBooking[] = [];
      for (const tour of userTours) {
        try {
          const bookingsResponse = await fetch(`/api/tours/${tour.id}/bookings`);
          if (bookingsResponse.ok) {
            const tourBookings = await bookingsResponse.json();
            allBookings.push(...tourBookings);
          }
        } catch (error) {
          console.error(`Failed to fetch bookings for tour ${tour.id}:`, error);
        }
      }
      setBookings(allBookings);

      // Calculate stats
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const upcomingBookings = allBookings.filter(
        (b) => b.status !== 'cancelled' && new Date(b.tourDate) >= now
      );
      
      const paidBookings = allBookings.filter((b) => b.paymentInfo.paymentStatus === 'paid');
      const totalRevenue = paidBookings.reduce((sum, b) => sum + b.pricing.total, 0);
      
      const monthlyBookings = paidBookings.filter(
        (b) => new Date(b.createdAt) >= firstDayOfMonth
      );
      const monthlyRevenue = monthlyBookings.reduce((sum, b) => sum + b.pricing.total, 0);

      setStats({
        totalTours: userTours.length,
        activeTours: userTours.filter((t) => t.isActive).length,
        totalBookings: allBookings.length,
        upcomingBookings: upcomingBookings.length,
        totalRevenue,
        monthlyRevenue,
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTour = async (tourId: string) => {
    if (!confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/tours/${tourId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tour');
      }

      toast({
        title: 'Success',
        description: 'Tour deleted successfully',
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete tour',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
            <Map className="h-8 w-8" />
            My Tours
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your tour packages and bookings
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tours">
            <Plus className="mr-2 h-4 w-4" />
            Create New Tour
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tours</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTours}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeTours} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingBookings} upcoming
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              ${stats.monthlyRevenue.toFixed(2)} this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tours" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tours">My Tours ({tours.length})</TabsTrigger>
          <TabsTrigger value="bookings">Bookings ({bookings.length})</TabsTrigger>
        </TabsList>

        {/* Tours Tab */}
        <TabsContent value="tours" className="space-y-4">
          {tours.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Map className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tours yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first tour package to start accepting bookings
                </p>
                <Button asChild>
                  <Link href="/admin/tours">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Tour
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => {
                const tourBookings = bookings.filter((b) => b.tourId === tour.id);
                const upcomingTourBookings = tourBookings.filter(
                  (b) => b.status !== 'cancelled' && new Date(b.tourDate) >= new Date()
                );

                return (
                  <Card key={tour.id} className="overflow-hidden">
                    <div className="relative aspect-video">
                      <Image
                        src={tour.featuredImageUrl}
                        alt={tour.name}
                        fill
                        className="object-cover"
                      />
                      <Badge
                        className="absolute top-2 right-2"
                        variant={tour.isActive ? 'default' : 'secondary'}
                      >
                        {tour.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-1">{tour.name}</CardTitle>
                      <CardDescription className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {tour.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {tour.duration}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-semibold">${tour.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Bookings:</span>
                        <span className="font-semibold">
                          {tourBookings.length} ({upcomingTourBookings.length} upcoming)
                        </span>
                      </div>
                      {tour.rating && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Rating:</span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {tour.rating.toFixed(1)} ({tour.reviewCount || 0})
                          </span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/tours/${tour.slug}`}>
                            <Eye className="mr-1 h-3 w-3" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/admin/tours?edit=${tour.id}`}>
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTour(tour.id!)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
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
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground text-center">
                  Bookings for your tours will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{booking.tourName}</CardTitle>
                        <CardDescription>
                          Booking ID: {booking.id}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          booking.status === 'confirmed'
                            ? 'default'
                            : booking.status === 'cancelled'
                            ? 'destructive'
                            : booking.status === 'completed'
                            ? 'secondary'
                            : 'outline'
                        }
                      >
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tour Date</p>
                        <p className="font-semibold">{booking.tourDate}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Participants</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {booking.totalParticipants}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Amount</p>
                        <p className="font-semibold">${booking.pricing.total.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payment Status</p>
                        <Badge variant={booking.paymentInfo.paymentStatus === 'paid' ? 'default' : 'outline'}>
                          {booking.paymentInfo.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Customer</p>
                        <p className="font-semibold">
                          {booking.contactInfo.firstName} {booking.contactInfo.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{booking.contactInfo.email}</p>
                        <p className="text-xs text-muted-foreground">{booking.contactInfo.phone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Breakdown</p>
                        <p className="text-xs">Adults: {booking.participants.adults}</p>
                        <p className="text-xs">Children: {booking.participants.children}</p>
                        <p className="text-xs">Seniors: {booking.participants.seniors}</p>
                      </div>
                    </div>
                    {booking.specialRequests && (
                      <div>
                        <p className="text-muted-foreground text-sm">Special Requests</p>
                        <p className="text-sm">{booking.specialRequests}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

