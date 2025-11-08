"use client";

import { Car, Shield, Clock, Star, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TransferSearchForm } from '@/components/transfers/transfer-search-form';

export default function TransfersPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Airport & City Transfers
            </h1>
            <p className="text-xl text-blue-100">
              Reliable, comfortable, and professional transfer services
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Book Your Transfer</CardTitle>
              </CardHeader>
              <CardContent>
                <TransferSearchForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our Transfer Service?
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Shield className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Safe & Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Professional drivers with verified licenses and insurance
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">On-Time Service</h3>
                <p className="text-sm text-muted-foreground">
                  Flight tracking and real-time updates for airport pickups
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Star className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Premium Vehicles</h3>
                <p className="text-sm text-muted-foreground">
                  Well-maintained, comfortable vehicles for all group sizes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold mb-2">Door-to-Door</h3>
                <p className="text-sm text-muted-foreground">
                  Convenient pickup and dropoff at your exact location
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vehicle Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Our Fleet
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Car className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Sedan</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Perfect for individuals or couples. Comfortable and economical.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>1-3 passengers</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Car className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">SUV</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Spacious and comfortable for families with extra luggage.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>1-5 passengers</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Car className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Van</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ideal for groups and families with lots of luggage.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>6-8 passengers</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Car className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Minibus</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Perfect for medium-sized groups and events.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>9-15 passengers</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Car className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Bus</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Large groups, corporate events, and tours.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>16-50 passengers</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <Car className="h-12 w-12 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Luxury</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Premium vehicles for VIP and executive transfers.
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>1-4 passengers</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  1
                </div>
              </div>
              <h3 className="font-semibold mb-2">Search & Select</h3>
              <p className="text-sm text-muted-foreground">
                Enter your pickup and dropoff locations, choose your vehicle
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  2
                </div>
              </div>
              <h3 className="font-semibold mb-2">Book & Pay</h3>
              <p className="text-sm text-muted-foreground">
                Confirm your booking and pay securely online
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  3
                </div>
              </div>
              <h3 className="font-semibold mb-2">Enjoy Your Ride</h3>
              <p className="text-sm text-muted-foreground">
                Meet your driver and enjoy a comfortable journey
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

