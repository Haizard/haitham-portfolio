'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFormatPrice } from '@/contexts/currency-context';

export default function CompareVehiclesPage() {
  const searchParams = useSearchParams();
  const itemIds = searchParams.get('items')?.split(',') || [];
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const format = useFormatPrice();

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const promises = itemIds.map((id) =>
        fetch(`/api/vehicles/${id}`).then((res) => res.json())
      );
      const results = await Promise.all(promises);
      const validVehicles = results
        .filter((r) => r.success)
        .map((r) => r.vehicle);
      setVehicles(validVehicles);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vehicles',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (vehicleId: string) => {
    try {
      await fetch(`/api/comparisons/vehicle/items/${vehicleId}`, {
        method: 'DELETE',
      });
      setVehicles(vehicles.filter((v) => v.id !== vehicleId));
      toast({
        title: 'Removed',
        description: 'Vehicle removed from comparison',
      });
    } catch (error) {
      console.error('Error removing vehicle:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No vehicles to compare
          </p>
          <Link href="/vehicles">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Vehicles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/vehicles">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vehicles
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mt-4">Compare Vehicles</h1>
        <p className="text-muted-foreground mt-2">
          Compare up to 3 vehicles side by side
        </p>
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-4 bg-muted text-left font-semibold">
                Feature
              </th>
              {vehicles.map((vehicle) => (
                <th key={vehicle.id} className="border p-4 bg-muted">
                  <div className="flex items-start justify-between">
                    <div className="text-left">
                      <p className="font-semibold">{vehicle.make} {vehicle.model}</p>
                      <p className="text-sm text-muted-foreground font-normal">
                        {vehicle.year}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemove(vehicle.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-4 font-semibold">Price (per day)</td>
              {vehicles.map((vehicle) => (
                <td key={vehicle.id} className="border p-4 text-center">
                  <p className="text-lg font-bold text-primary">
                    {format(vehicle.pricePerDay, 'USD')}
                  </p>
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Vehicle Type</td>
              {vehicles.map((vehicle) => (
                <td key={vehicle.id} className="border p-4 text-center">
                  <Badge>{vehicle.vehicleType}</Badge>
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Transmission</td>
              {vehicles.map((vehicle) => (
                <td key={vehicle.id} className="border p-4 text-center">
                  {vehicle.transmission}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Fuel Type</td>
              {vehicles.map((vehicle) => (
                <td key={vehicle.id} className="border p-4 text-center">
                  {vehicle.fuelType}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Seats</td>
              {vehicles.map((vehicle) => (
                <td key={vehicle.id} className="border p-4 text-center">
                  {vehicle.seats}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Features</td>
              {vehicles.map((vehicle) => (
                <td key={vehicle.id} className="border p-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {vehicle.features?.slice(0, 5).map((feature: string) => (
                      <Badge key={feature} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </td>
              ))}
            </tr>
            <tr>
              <td className="border p-4 font-semibold">Action</td>
              {vehicles.map((vehicle) => (
                <td key={vehicle.id} className="border p-4 text-center">
                  <Link href={`/vehicles/${vehicle.id}`}>
                    <Button>View Details</Button>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile View - Cards */}
      <div className="md:hidden space-y-4">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{vehicle.make} {vehicle.model}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.year}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(vehicle.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-2xl font-bold text-primary">
                  {format(vehicle.pricePerDay, 'USD')}/day
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge>{vehicle.vehicleType}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Transmission</p>
                  <p>{vehicle.transmission}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seats</p>
                  <p>{vehicle.seats}</p>
                </div>
              </div>
              <Link href={`/vehicles/${vehicle.id}`}>
                <Button className="w-full">View Details</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

