import { Plane, TrendingUp, MapPin } from 'lucide-react';
import { FlightSearchForm } from '@/components/flights/flight-search-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FlightsPage() {
  // Popular routes (mock data)
  const popularRoutes = [
    { from: 'JFK', to: 'LAX', fromCity: 'New York', toCity: 'Los Angeles', price: 299 },
    { from: 'LHR', to: 'DXB', fromCity: 'London', toCity: 'Dubai', price: 599 },
    { from: 'SFO', to: 'NRT', fromCity: 'San Francisco', toCity: 'Tokyo', price: 899 },
    { from: 'CDG', to: 'JFK', fromCity: 'Paris', toCity: 'New York', price: 499 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Hero Section */}
      <div className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Plane className="h-12 w-12" />
              <h1 className="text-4xl md:text-5xl font-bold">Find Your Perfect Flight</h1>
            </div>
            <p className="text-lg text-primary-foreground/90">
              Search and compare flights from hundreds of airlines worldwide
            </p>
          </div>

          {/* Search Form */}
          <div className="max-w-5xl mx-auto">
            <FlightSearchForm />
          </div>
        </div>
      </div>

      {/* Popular Routes Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Popular Routes</h2>
          </div>
          <p className="text-muted-foreground">
            Discover the most searched flight routes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularRoutes.map((route, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  {route.from} → {route.to}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {route.fromCity} to {route.toCity}
                </p>
                <p className="text-2xl font-bold text-primary">
                  from ${route.price}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Why Book Flights With Us?
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plane className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Best Prices</h3>
                <p className="text-sm text-muted-foreground">
                  Compare prices from hundreds of airlines to find the best deals
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Easy Booking</h3>
                <p className="text-sm text-muted-foreground">
                  Simple and fast booking process with secure payment options
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Worldwide Coverage</h3>
                <p className="text-sm text-muted-foreground">
                  Access flights to thousands of destinations around the globe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

