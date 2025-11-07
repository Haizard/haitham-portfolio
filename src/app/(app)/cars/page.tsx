"use client";

import { CarSearchForm } from '@/components/cars/car-search-form';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Shield, DollarSign, MapPin } from 'lucide-react';

export default function CarsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Rent the Perfect Car
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose from a wide selection of vehicles for your next journey
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-5xl mx-auto">
            <CarSearchForm />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Rent With Us?
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Wide Selection
                </h3>
                <p className="text-sm text-muted-foreground">
                  From economy to luxury, find the perfect vehicle for your needs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Best Prices
                </h3>
                <p className="text-sm text-muted-foreground">
                  Competitive rates with no hidden fees
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Convenient Locations
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pick up and drop off at locations that suit you
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Fully Insured
                </h3>
                <p className="text-sm text-muted-foreground">
                  All vehicles come with comprehensive insurance
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Vehicle Categories */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Popular Categories
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Economy', description: 'Affordable and fuel-efficient', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400' },
              { name: 'SUV', description: 'Spacious and comfortable', image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400' },
              { name: 'Luxury', description: 'Premium experience', image: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=400' },
              { name: 'Van', description: 'Perfect for groups', image: 'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=400' },
            ].map((category) => (
              <Card key={category.name} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url(${category.image})` }}
                />
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Search</h3>
              <p className="text-sm text-muted-foreground">
                Enter your location and dates to find available vehicles
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Book</h3>
              <p className="text-sm text-muted-foreground">
                Choose your vehicle and complete the booking with secure payment
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Drive</h3>
              <p className="text-sm text-muted-foreground">
                Pick up your car and enjoy your journey
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

