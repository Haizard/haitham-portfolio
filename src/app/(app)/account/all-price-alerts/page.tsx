'use client';

import { useState, useEffect } from 'react';
import { Bell, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PriceAlertCard } from '@/components/price-alerts/price-alert-card';

export default function AllPriceAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadAlerts();
  }, [filterType, filterStatus]);

  const loadAlerts = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.append('alertType', filterType);
      }
      if (filterStatus === 'active') {
        params.append('isActive', 'true');
      } else if (filterStatus === 'inactive') {
        params.append('isActive', 'false');
      }

      const response = await fetch(`/api/price-alerts?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Error loading price alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load price alerts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = () => {
    loadAlerts();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading price alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">All Price Alerts</h1>
          <p className="text-muted-foreground mt-2">
            Manage your price alerts across all booking types
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="property">Hotels</SelectItem>
            <SelectItem value="vehicle">Cars</SelectItem>
            <SelectItem value="tour">Tours</SelectItem>
            <SelectItem value="transfer">Transfers</SelectItem>
            <SelectItem value="flight">Flights</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            {filterType !== 'all' || filterStatus !== 'all'
              ? 'No price alerts match your filters'
              : "You don't have any price alerts yet"}
          </p>
          <p className="text-sm text-muted-foreground">
            Create price alerts from listing pages to get notified when prices drop
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alert) => (
            <PriceAlertCard
              key={alert.id}
              alert={alert}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

