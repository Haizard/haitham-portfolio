"use client";

import { HotelSearchForm } from '@/components/hotels/hotel-search-form';
import { Card, CardContent } from '@/components/ui/card';
import { Hotel, MapPin, Shield, CreditCard } from 'lucide-react';

export default function HotelsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Find Your Perfect Stay
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Search from thousands of hotels, apartments, and resorts worldwide
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-5xl mx-auto">
            <HotelSearchForm />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Book With Us?
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Hotel className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Wide Selection
                </h3>
                <p className="text-sm text-muted-foreground">
                  Choose from hotels, apartments, resorts, villas, and more
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Global Coverage
                </h3>
                <p className="text-sm text-muted-foreground">
                  Properties in destinations around the world
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Secure Booking
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your data and payments are always protected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Best Prices
                </h3>
                <p className="text-sm text-muted-foreground">
                  Competitive rates and exclusive deals
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Popular Destinations
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'New York', country: 'USA', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800' },
              { name: 'Paris', country: 'France', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800' },
              { name: 'Tokyo', country: 'Japan', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800' },
              { name: 'London', country: 'UK', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800' },
              { name: 'Dubai', country: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800' },
              { name: 'Barcelona', country: 'Spain', image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800' },
            ].map((destination) => (
              <Card key={destination.name} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${destination.image})` }}
                />
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold">{destination.name}</h3>
                  <p className="text-sm text-muted-foreground">{destination.country}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

