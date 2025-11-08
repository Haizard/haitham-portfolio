"use client";

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Loader2, Plane, DollarSign, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { FlightReferral } from '@/lib/flights-data';

export default function MyFlightsPage() {
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<FlightReferral[]>([]);
  const [stats, setStats] = useState({
    totalClicks: 0,
    confirmedBookings: 0,
    totalCommission: 0,
    paidCommission: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchReferrals();
  }, [filterStatus]);

  const fetchReferrals = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await fetch(`/api/flights/referrals?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch referrals');
      }

      const data = await response.json();
      setReferrals(data.referrals);
      setStats(data.stats);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch referrals',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (referral: FlightReferral) => {
    if (referral.commissionPaid) {
      return <Badge className="bg-green-500">Paid</Badge>;
    }
    if (referral.bookingConfirmed) {
      return <Badge className="bg-blue-500">Confirmed</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
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
        <h1 className="text-3xl font-bold mb-2">My Flight Referrals</h1>
        <p className="text-muted-foreground">
          Track your flight referrals and commission earnings
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Confirmed Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.confirmedBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalCommission.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Paid Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.paidCommission.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Referral History</h2>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Referrals</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Referrals List */}
      <div className="space-y-4">
        {referrals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No referrals found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => (window.location.href = '/flights')}
              >
                Search Flights
              </Button>
            </CardContent>
          </Card>
        ) : (
          referrals.map((referral) => (
            <Card key={referral.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    {/* Route */}
                    <div className="flex items-center gap-2">
                      <Plane className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-lg">
                        {referral.flightDetails.origin} → {referral.flightDetails.destination}
                      </span>
                      {getStatusBadge(referral)}
                    </div>

                    {/* Details */}
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Airline:</span>{' '}
                        <span className="font-medium">{referral.flightDetails.airline}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Departure:</span>{' '}
                        <span className="font-medium">
                          {format(new Date(referral.flightDetails.departureDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Price:</span>{' '}
                        <span className="font-medium">
                          ${referral.flightDetails.price} {referral.flightDetails.currency}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Clicked:</span>{' '}
                        <span className="font-medium">
                          {format(new Date(referral.clickedAt), 'MMM dd, yyyy HH:mm')}
                        </span>
                      </div>
                    </div>

                    {/* Commission Info */}
                    {referral.bookingConfirmed && (
                      <div className="flex items-center gap-4 pt-2 border-t">
                        <div className="text-sm">
                          <span className="text-muted-foreground">Commission Rate:</span>{' '}
                          <span className="font-medium">{referral.commissionRate}%</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Commission Amount:</span>{' '}
                          <span className="font-medium text-green-600">
                            ${referral.commissionAmount?.toFixed(2)}
                          </span>
                        </div>
                        {referral.confirmedAt && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Confirmed:</span>{' '}
                            <span className="font-medium">
                              {format(new Date(referral.confirmedAt), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(referral.referralUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

