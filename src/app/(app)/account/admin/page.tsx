"use client";

import { useEffect, useState } from 'react';
import { Loader2, Users, Hotel, Car, DollarSign, TrendingUp, Calendar, AlertCircle, Plane, Map } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  totalVehicles: number;
  totalTransferVehicles: number;
  totalTours: number;
  totalHotelBookings: number;
  totalCarRentals: number;
  totalTransferBookings: number;
  totalTourBookings: number;
  totalFlightReferrals: number;
  totalRevenue: number;
  recentBookings: number;
  activeRentals: number;
  activeTransfers: number;
  activeTours: number;
  flightCommissionEarned: number;
}

interface HotelBooking {
  id: string;
  propertyId: string;
  userId: string;
  checkIn: string;
  checkOut: string;
  status: string;
  pricing: {
    totalPrice: number;
    currency: string;
  };
  guestInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

interface CarRental {
  id: string;
  vehicleId: string;
  userId: string;
  pickupDate: string;
  returnDate: string;
  status: string;
  pricing: {
    totalPrice: number;
    currency: string;
  };
  driverInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

interface TransferBooking {
  id: string;
  vehicleId: string;
  userId: string;
  pickupDate: string;
  pickupTime: string;
  status: string;
  pricing: {
    totalPrice: number;
    currency: string;
  };
  passengerInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

interface TourBooking {
  id: string;
  tourId: string;
  tourName: string;
  userId: string;
  tourDate: string;
  status: string;
  pricing: {
    total: number;
  };
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  totalParticipants: number;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProperties: 0,
    totalVehicles: 0,
    totalTransferVehicles: 0,
    totalTours: 0,
    totalHotelBookings: 0,
    totalCarRentals: 0,
    totalTransferBookings: 0,
    totalTourBookings: 0,
    totalFlightReferrals: 0,
    totalRevenue: 0,
    recentBookings: 0,
    activeRentals: 0,
    activeTransfers: 0,
    activeTours: 0,
    flightCommissionEarned: 0,
  });
  const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>([]);
  const [carRentals, setCarRentals] = useState<CarRental[]>([]);
  const [transferBookings, setTransferBookings] = useState<TransferBooking[]>([]);
  const [tourBookings, setTourBookings] = useState<TourBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      // Check if user is admin
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.user && data.user.roles && data.user.roles.includes('admin')) {
          setIsAuthorized(true);
          fetchDashboardData();
        } else {
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to access this page',
            variant: 'destructive',
          });
          router.push('/account/dashboard');
        }
      }
    } catch (error) {
      console.error('Error checking authorization:', error);
      router.push('/account/dashboard');
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch all hotel bookings
      const hotelResponse = await fetch('/api/hotels/bookings?all=true');
      if (hotelResponse.ok) {
        const hotelData = await hotelResponse.json();
        setHotelBookings(hotelData.bookings || []);
      }

      // Fetch all car rentals
      const carResponse = await fetch('/api/cars/rentals?all=true');
      if (carResponse.ok) {
        const carData = await carResponse.json();
        setCarRentals(carData.rentals || []);
      }

      // Fetch all transfer bookings
      const transferResponse = await fetch('/api/transfers/bookings?all=true');
      if (transferResponse.ok) {
        const transferData = await transferResponse.json();
        setTransferBookings(transferData.bookings || []);
      }

      // Fetch all tour bookings
      const tourResponse = await fetch('/api/tours/bookings');
      let tourBookingsData: TourBooking[] = [];
      if (tourResponse.ok) {
        const tourData = await tourResponse.json();
        tourBookingsData = tourData || [];
        setTourBookings(tourBookingsData);
      }

      // Fetch properties count
      const propertiesResponse = await fetch('/api/hotels/properties');
      let totalProperties = 0;
      if (propertiesResponse.ok) {
        const propertiesData = await propertiesResponse.json();
        totalProperties = propertiesData.properties?.length || 0;
      }

      // Fetch vehicles count
      const vehiclesResponse = await fetch('/api/cars/vehicles');
      let totalVehicles = 0;
      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json();
        totalVehicles = vehiclesData.vehicles?.length || 0;
      }

      // Fetch transfer vehicles count
      const transferVehiclesResponse = await fetch('/api/transfers/vehicles');
      let totalTransferVehicles = 0;
      if (transferVehiclesResponse.ok) {
        const transferVehiclesData = await transferVehiclesResponse.json();
        totalTransferVehicles = transferVehiclesData.vehicles?.length || 0;
      }

      // Fetch tours count
      const toursResponse = await fetch('/api/tours');
      let totalTours = 0;
      if (toursResponse.ok) {
        const toursData = await toursResponse.json();
        totalTours = toursData.tours?.length || 0;
      }

      // Calculate stats
      const hotelBookingsData = hotelBookings.length > 0 ? hotelBookings : [];
      const carRentalsData = carRentals.length > 0 ? carRentals : [];
      const transferBookingsData = transferBookings.length > 0 ? transferBookings : [];

      const totalRevenue = [
        ...hotelBookingsData.filter((b) => b.status === 'confirmed' || b.status === 'completed'),
        ...carRentalsData.filter((r) => r.status === 'confirmed' || r.status === 'completed'),
        ...transferBookingsData.filter((t) => t.status === 'confirmed' || t.status === 'completed'),
      ].reduce((sum, item) => sum + item.pricing.totalPrice, 0) +
      tourBookingsData.filter((t) => t.status === 'confirmed' || t.status === 'completed')
        .reduce((sum, t) => sum + t.pricing.total, 0);

      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const recentBookings = [
        ...hotelBookingsData,
        ...carRentalsData,
        ...transferBookingsData,
        ...tourBookingsData,
      ].filter((item) => new Date(item.createdAt) > sevenDaysAgo).length;

      const activeRentals = carRentalsData.filter((r) => r.status === 'active').length;
      const activeTransfers = transferBookingsData.filter((t) => t.status === 'in_progress' || t.status === 'assigned').length;
      const activeTours = tourBookingsData.filter((t) => t.status === 'confirmed' && new Date(t.tourDate) >= now).length;

      setStats({
        totalUsers: 0, // Would need a users API endpoint
        totalProperties,
        totalVehicles,
        totalTransferVehicles,
        totalTours,
        totalHotelBookings: hotelBookingsData.length,
        totalCarRentals: carRentalsData.length,
        totalTransferBookings: transferBookingsData.length,
        totalTourBookings: tourBookingsData.length,
        totalFlightReferrals: 0, // TODO: Fetch from flight referrals API
        totalRevenue,
        recentBookings,
        activeRentals,
        activeTransfers,
        activeTours,
        flightCommissionEarned: 0, // TODO: Fetch from flight referrals API
      });
    } catch (error) {
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

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From all confirmed bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Bookings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentBookings}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Hotel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalHotelBookings} bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rental Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeRentals} active rentals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transfer Vehicles</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransferVehicles}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeTransfers} active transfers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tour Packages</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTours}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeTours} upcoming tours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalHotelBookings + stats.totalCarRentals + stats.totalTransferBookings + stats.totalTourBookings}
            </div>
            <p className="text-xs text-muted-foreground">
              Hotels: {stats.totalHotelBookings} | Cars: {stats.totalCarRentals} | Transfers: {stats.totalTransferBookings} | Tours: {stats.totalTourBookings}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flight Referrals</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFlightReferrals}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.flightCommissionEarned.toFixed(2)} commission earned
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings and Rentals */}
      <Tabs defaultValue="hotels" className="space-y-6">
        <TabsList>
          <TabsTrigger value="hotels">
            <Hotel className="h-4 w-4 mr-2" />
            Hotel Bookings ({hotelBookings.length})
          </TabsTrigger>
          <TabsTrigger value="cars">
            <Car className="h-4 w-4 mr-2" />
            Car Rentals ({carRentals.length})
          </TabsTrigger>
          <TabsTrigger value="transfers">
            <Plane className="h-4 w-4 mr-2" />
            Transfers ({transferBookings.length})
          </TabsTrigger>
          <TabsTrigger value="tours">
            <Map className="h-4 w-4 mr-2" />
            Tours ({tourBookings.length})
          </TabsTrigger>
        </TabsList>

        {/* Hotel Bookings */}
        <TabsContent value="hotels" className="space-y-4">
          {hotelBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hotel bookings yet</p>
              </CardContent>
            </Card>
          ) : (
            hotelBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Booking #{booking.id.slice(0, 8)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Guest: {booking.guestInfo.firstName} {booking.guestInfo.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.guestInfo.email}
                      </p>
                    </div>
                    <Badge>{booking.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Check-in:</span>
                      <p className="font-medium">{new Date(booking.checkIn).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Check-out:</span>
                      <p className="font-medium">{new Date(booking.checkOut).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <p className="font-medium">
                        {booking.pricing.currency} {booking.pricing.totalPrice.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Booked:</span>
                      <p className="font-medium">{new Date(booking.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Car Rentals */}
        <TabsContent value="cars" className="space-y-4">
          {carRentals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No car rentals yet</p>
              </CardContent>
            </Card>
          ) : (
            carRentals.map((rental) => (
              <Card key={rental.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Rental #{rental.id.slice(0, 8)}
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
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 text-sm">
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
                    <div>
                      <span className="text-muted-foreground">Booked:</span>
                      <p className="font-medium">{new Date(rental.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Transfer Bookings */}
        <TabsContent value="transfers" className="space-y-4">
          {transferBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No transfer bookings yet</p>
              </CardContent>
            </Card>
          ) : (
            transferBookings.map((transfer) => (
              <Card key={transfer.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Transfer Booking</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        ID: {transfer.id.slice(0, 8)}...
                      </p>
                    </div>
                    <Badge>{transfer.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Passenger:</span>
                      <p className="font-medium">
                        {transfer.passengerInfo.firstName} {transfer.passengerInfo.lastName}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p className="font-medium">{transfer.passengerInfo.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pickup:</span>
                      <p className="font-medium">
                        {new Date(transfer.pickupDate).toLocaleDateString()} {transfer.pickupTime}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <p className="font-medium">
                        {transfer.pricing.currency} {transfer.pricing.totalPrice.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Booked:</span>
                      <p className="font-medium">{new Date(transfer.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tour Bookings */}
        <TabsContent value="tours" className="space-y-4">
          {tourBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tour bookings yet</p>
              </CardContent>
            </Card>
          ) : (
            tourBookings.map((tour) => (
              <Card key={tour.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{tour.tourName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Booking ID: {tour.id.slice(0, 8)}...
                      </p>
                    </div>
                    <Badge>{tour.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Customer:</span>
                      <p className="font-medium">
                        {tour.contactInfo.firstName} {tour.contactInfo.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">{tour.contactInfo.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Tour Date:</span>
                      <p className="font-medium">{new Date(tour.tourDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Participants:</span>
                      <p className="font-medium">{tour.totalParticipants}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <p className="font-medium">${tour.pricing.total.toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Booked:</span>
                      <p className="font-medium">{new Date(tour.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

