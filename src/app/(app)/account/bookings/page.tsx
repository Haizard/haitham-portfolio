"use client";

import { useEffect, useState } from 'react';
import { Loader2, Hotel, Car, Calendar, MapPin, DollarSign, Clock, AlertCircle, Plane, Map, Users, Star } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BookingReviewCard } from '@/components/bookings/booking-review-card';

interface HotelBooking {
  id: string;
  propertyId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
  pricing: {
    totalPrice: number;
    currency: string;
  };
  status: string;
  createdAt: string;
}

interface CarRental {
  id: string;
  vehicleId: string;
  pickupDate: string;
  returnDate: string;
  numberOfDays: number;
  pickupLocation: string;
  returnLocation: string;
  pricing: {
    totalPrice: number;
    currency: string;
  };
  status: string;
  createdAt: string;
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

interface TourBooking {
  id: string;
  tourId: string;
  tourName: string;
  tourSlug: string;
  tourDate: string;
  tourTime?: string;
  participants: {
    adults: number;
    children: number;
    seniors: number;
  };
  totalParticipants: number;
  contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  pricing: {
    total: number;
  };
  status: string;
  paymentInfo: {
    paymentStatus: string;
  };
  createdAt: string;
}

export default function BookingsPage() {
  const { toast } = useToast();
  const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>([]);
  const [carRentals, setCarRentals] = useState<CarRental[]>([]);
  const [transferBookings, setTransferBookings] = useState<TransferBooking[]>([]);
  const [tourBookings, setTourBookings] = useState<TourBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<{ id: string; type: 'hotel' | 'car' | 'transfer' | 'tour' } | null>(null);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [bookingToReview, setBookingToReview] = useState<{
    bookingId: string;
    reviewType: 'hotel' | 'car_rental' | 'tour' | 'transfer';
    targetId: string;
    targetName: string;
  } | null>(null);
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      // Fetch hotel bookings
      const hotelResponse = await fetch('/api/hotels/bookings');
      if (hotelResponse.ok) {
        const hotelData = await hotelResponse.json();
        setHotelBookings(hotelData.bookings || []);
      }

      // Fetch car rentals
      const carResponse = await fetch('/api/cars/rentals');
      if (carResponse.ok) {
        const carData = await carResponse.json();
        setCarRentals(carData.rentals || []);
      }

      // Fetch transfer bookings
      const transferResponse = await fetch('/api/transfers/bookings');
      if (transferResponse.ok) {
        const transferData = await transferResponse.json();
        setTransferBookings(transferData.bookings || []);
      }

      // Fetch tour bookings
      const tourResponse = await fetch('/api/tours/bookings');
      if (tourResponse.ok) {
        const tourData = await tourResponse.json();
        setTourBookings(tourData || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;

    setCancellingId(bookingToCancel.id);
    try {
      const endpoint = bookingToCancel.type === 'hotel'
        ? `/api/hotels/bookings/${bookingToCancel.id}`
        : bookingToCancel.type === 'car'
          ? `/api/cars/rentals/${bookingToCancel.id}`
          : bookingToCancel.type === 'tour'
            ? `/api/tours/bookings/${bookingToCancel.id}`
            : `/api/transfers/bookings/${bookingToCancel.id}`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          cancellationReason: 'Cancelled by customer',
        }),
      });

      if (!response.ok) throw new Error('Failed to cancel booking');

      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been cancelled successfully',
      });

      // Refresh bookings
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel booking',
        variant: 'destructive',
      });
    } finally {
      setCancellingId(null);
      setShowCancelDialog(false);
      setBookingToCancel(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'completed':
        return 'bg-blue-500';
      case 'active':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const canCancelBooking = (status: string, startDate: string) => {
    if (status === 'cancelled' || status === 'completed') return false;
    const start = parseISO(startDate);
    const now = new Date();
    return start > now;
  };

  const canReviewBooking = (status: string, bookingId: string) => {
    return (status === 'completed' || status === 'confirmed') && !reviewedBookings.has(bookingId);
  };

  const handleOpenReviewDialog = (
    bookingId: string,
    reviewType: 'hotel' | 'car_rental' | 'tour' | 'transfer',
    targetId: string,
    targetName: string
  ) => {
    setBookingToReview({ bookingId, reviewType, targetId, targetName });
    setShowReviewDialog(true);
  };

  const handleReviewSubmitted = () => {
    if (bookingToReview) {
      setReviewedBookings(prev => new Set(prev).add(bookingToReview.bookingId));
    }
    setShowReviewDialog(false);
    setBookingToReview(null);
    toast({
      title: 'Review submitted!',
      description: 'Thank you for sharing your experience.',
    });
  };

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
        <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
        <p className="text-muted-foreground">
          Manage your hotel reservations, car rentals, transfers, and tours
        </p>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">
            All ({hotelBookings.length + carRentals.length + transferBookings.length + tourBookings.length})
          </TabsTrigger>
          <TabsTrigger value="hotels">
            <Hotel className="h-4 w-4 mr-2" />
            Hotels ({hotelBookings.length})
          </TabsTrigger>
          <TabsTrigger value="cars">
            <Car className="h-4 w-4 mr-2" />
            Cars ({carRentals.length})
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

        {/* All Bookings */}
        <TabsContent value="all" className="space-y-4">
          {hotelBookings.length === 0 && carRentals.length === 0 && transferBookings.length === 0 && tourBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No bookings yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start exploring hotels, cars, and transfers to make your first booking!
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {hotelBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Hotel className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Hotel Booking</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Booking ID: {booking.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(parseISO(booking.checkInDate), 'MMM dd, yyyy')} -{' '}
                          {format(parseISO(booking.checkOutDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{booking.numberOfNights} night{booking.numberOfNights !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {booking.pricing.currency} {booking.pricing.totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {booking.guests.adults} adult{booking.guests.adults !== 1 ? 's' : ''}
                          {booking.guests.children > 0 && `, ${booking.guests.children} child${booking.guests.children !== 1 ? 'ren' : ''}`}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Booked on {format(parseISO(booking.createdAt), 'MMM dd, yyyy')}
                      </p>
                      <div className="flex gap-2">
                        {canReviewBooking(booking.status, booking.id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReviewDialog(
                              booking.id,
                              'hotel',
                              booking.propertyId,
                              'Property' // TODO: Add property name to booking
                            )}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Leave Review
                          </Button>
                        )}
                        {canCancelBooking(booking.status, booking.checkInDate) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setBookingToCancel({ id: booking.id, type: 'hotel' });
                              setShowCancelDialog(true);
                            }}
                            disabled={cancellingId === booking.id}
                          >
                            {cancellingId === booking.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              'Cancel Booking'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {carRentals.map((rental) => (
                <Card key={rental.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Car className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Car Rental</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Rental ID: {rental.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(rental.status)}>
                        {rental.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(parseISO(rental.pickupDate), 'MMM dd, yyyy')} -{' '}
                          {format(parseISO(rental.returnDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{rental.numberOfDays} day{rental.numberOfDays !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {rental.pricing.currency} {rental.pricing.totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">
                          {rental.pickupLocation}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Booked on {format(parseISO(rental.createdAt), 'MMM dd, yyyy')}
                      </p>
                      <div className="flex gap-2">
                        {canReviewBooking(rental.status, rental.id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReviewDialog(
                              rental.id,
                              'car_rental',
                              rental.vehicleId,
                              'Vehicle' // TODO: Add vehicle name to rental
                            )}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Leave Review
                          </Button>
                        )}
                        {canCancelBooking(rental.status, rental.pickupDate) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setBookingToCancel({ id: rental.id, type: 'car' });
                              setShowCancelDialog(true);
                            }}
                            disabled={cancellingId === rental.id}
                          >
                            {cancellingId === rental.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              'Cancel Rental'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {transferBookings.map((transfer) => (
                <Card key={transfer.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Plane className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Transfer Booking</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Booking ID: {transfer.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(transfer.status)}>
                        {transfer.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(parseISO(transfer.pickupDate), 'MMM dd, yyyy')} at {transfer.pickupTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground capitalize">
                          {transfer.transferType.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {transfer.pricing.currency} {transfer.pricing.totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          {transfer.passengerInfo.numberOfPassengers} passenger{transfer.passengerInfo.numberOfPassengers !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="flex items-start gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Pickup</p>
                          <p className="text-muted-foreground">{transfer.pickupLocation.address}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Dropoff</p>
                          <p className="text-muted-foreground">{transfer.dropoffLocation.address}</p>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Booked on {format(parseISO(transfer.createdAt), 'MMM dd, yyyy')}
                      </p>
                      <div className="flex gap-2">
                        {canReviewBooking(transfer.status, transfer.id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReviewDialog(
                              transfer.id,
                              'transfer',
                              transfer.vehicleId,
                              'Transfer Vehicle' // TODO: Add vehicle name to transfer
                            )}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Leave Review
                          </Button>
                        )}
                        {canCancelBooking(transfer.status, transfer.pickupDate) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setBookingToCancel({ id: transfer.id, type: 'transfer' });
                              setShowCancelDialog(true);
                            }}
                            disabled={cancellingId === transfer.id}
                          >
                            {cancellingId === transfer.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              'Cancel Transfer'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {tourBookings.map((tour) => (
                <Card key={tour.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Map className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tour.tourName}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Booking ID: {tour.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(tour.status)}>
                        {tour.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(parseISO(tour.tourDate), 'MMM dd, yyyy')}
                          {tour.tourTime && ` at ${tour.tourTime}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {tour.totalParticipants} participant{tour.totalParticipants !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          ${tour.pricing.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">
                          Adults: {tour.participants.adults}, Children: {tour.participants.children}, Seniors: {tour.participants.seniors}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        Booked on {format(parseISO(tour.createdAt), 'MMM dd, yyyy')}
                      </p>
                      {canCancelBooking(tour.status, tour.tourDate) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setBookingToCancel({ id: tour.id, type: 'tour' });
                            setShowCancelDialog(true);
                          }}
                          disabled={cancellingId === tour.id}
                        >
                          {cancellingId === tour.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            'Cancel Tour'
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </TabsContent>

        {/* Hotels Only */}
        <TabsContent value="hotels" className="space-y-4">
          {hotelBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Hotel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hotel bookings yet</p>
              </CardContent>
            </Card>
          ) : (
            hotelBookings.map((booking) => (
              <Card key={booking.id}>
                {/* Same content as above */}
              </Card>
            ))
          )}
        </TabsContent>

        {/* Cars Only */}
        <TabsContent value="cars" className="space-y-4">
          {carRentals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No car rentals yet</p>
              </CardContent>
            </Card>
          ) : (
            carRentals.map((rental) => (
              <Card key={rental.id}>
                {/* Same content as above */}
              </Card>
            ))
          )}
        </TabsContent>

        {/* Transfers Only */}
        <TabsContent value="transfers" className="space-y-4">
          {transferBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No transfer bookings yet</p>
              </CardContent>
            </Card>
          ) : (
            transferBookings.map((transfer) => (
              <Card key={transfer.id}>
                {/* Same content as above */}
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tours Only */}
        <TabsContent value="tours" className="space-y-4">
          {tourBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Map className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No tour bookings yet</p>
              </CardContent>
            </Card>
          ) : (
            tourBookings.map((tour) => (
              <Card key={tour.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Map className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tour.tourName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Booking ID: {tour.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(tour.status)}>
                      {tour.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(parseISO(tour.tourDate), 'MMM dd, yyyy')}
                        {tour.tourTime && ` at ${tour.tourTime}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {tour.totalParticipants} participant{tour.totalParticipants !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        ${tour.pricing.total.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">
                        Adults: {tour.participants.adults}, Children: {tour.participants.children}, Seniors: {tour.participants.seniors}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium">Contact Information</p>
                    <p className="text-muted-foreground">
                      {tour.contactInfo.firstName} {tour.contactInfo.lastName}
                    </p>
                    <p className="text-muted-foreground">{tour.contactInfo.email}</p>
                    <p className="text-muted-foreground">{tour.contactInfo.phone}</p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Booked on {format(parseISO(tour.createdAt), 'MMM dd, yyyy')}
                    </p>
                    <div className="flex gap-2">
                      {canReviewBooking(tour.status, tour.id) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReviewDialog(
                            tour.id,
                            'tour',
                            tour.tourId,
                            tour.tourName
                          )}
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Leave Review
                        </Button>
                      )}
                      {canCancelBooking(tour.status, tour.tourDate) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setBookingToCancel({ id: tour.id, type: 'tour' });
                            setShowCancelDialog(true);
                          }}
                          disabled={cancellingId === tour.id}
                        >
                          {cancellingId === tour.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            'Cancel Tour'
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
              Please check the cancellation policy for any applicable fees.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelBooking} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cancel Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience to help other travelers
            </DialogDescription>
          </DialogHeader>
          {bookingToReview && (
            <BookingReviewCard
              bookingId={bookingToReview.bookingId}
              reviewType={bookingToReview.reviewType}
              targetId={bookingToReview.targetId}
              targetName={bookingToReview.targetName}
              onReviewSubmit={handleReviewSubmitted}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

