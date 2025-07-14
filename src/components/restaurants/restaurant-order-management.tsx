// src/components/restaurants/restaurant-order-management.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BellRing, Package, Soup, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderStatus } from '@/lib/orders-data';
import { useUser } from '@/hooks/use-user';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';

const statusOptions: OrderStatus[] = ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'];

const getStatusBadgeVariant = (status: OrderStatus): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
        case "Pending": return "secondary";
        case "Confirmed": return "default";
        case "Preparing": return "default";
        case "Ready for Pickup": return "default";
        case "Completed": return "outline";
        case "Cancelled": return "destructive";
        default: return "outline";
    }
};

const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
        case "Pending": return <BellRing className="h-3.5 w-3.5" />;
        case "Confirmed": return <Package className="h-3.5 w-3.5" />;
        case "Preparing": return <Soup className="h-3.5 w-3.5" />;
        case "Ready for Pickup": return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
        case "Completed": return <CheckCircle className="h-3.5 w-3.5" />;
        case "Cancelled": return <XCircle className="h-3.5 w-3.5" />;
        default: return <Package className="h-3.5 w-3.5" />;
    }
};

const OrderStatusUpdater: React.FC<{ order: Order; onUpdate: () => void; }> = ({ order, onUpdate }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const { toast } = useToast();

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (newStatus === order.status) return;
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/orders/${order.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update status");
            }
            toast({ title: "Status Updated", description: `Order for ${order.customerName} is now ${newStatus}.` });
            onUpdate();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Select onValueChange={handleStatusChange} value={order.status} disabled={isUpdating}>
                <SelectTrigger className="w-[180px] h-9 text-xs">
                    <SelectValue placeholder="Update status" />
                </SelectTrigger>
                <SelectContent>
                    {statusOptions.map(status => (
                        <SelectItem key={status} value={status} className="text-xs">{status}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
    );
};

export function RestaurantOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUser();

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // API route uses vendorId, which corresponds to the restaurant owner's userId
      const response = await fetch(`/api/orders?vendorId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch your orders');
      const data: Order[] = await response.json();
      setOrders(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    if (user) {
        fetchOrders();
    }
  }, [fetchOrders, user]);

  if (isLoading) {
    return <Card><CardContent className="p-6 flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/></CardContent></Card>;
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>Incoming Orders</CardTitle>
        <CardDescription>A real-time view of customer orders.</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">You have no orders yet.</p>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Card key={order.id} className="bg-muted/30">
                <CardHeader className="flex flex-row justify-between items-center p-4">
                  <div>
                    <h3 className="font-semibold">Order #{order.id!.substring(0,8).toUpperCase()}</h3>
                    <p className="text-xs text-muted-foreground">
                      For: {order.customerName} | Received: {format(new Date(order.orderDate), 'PPP p')}
                    </p>
                  </div>
                   <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs flex items-center gap-1.5 capitalize">
                        {getStatusIcon(order.status)}
                        {order.status}
                    </Badge>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Separator className="mb-4" />
                  <div className="space-y-2 mb-4">
                    {order.lineItems.map(item => (
                        <div key={item._id.toString()} className="flex justify-between items-start text-sm">
                            <div>
                               <p><span className="font-semibold">{item.quantity}x</span> {item.productName}</p>
                               <p className="text-xs text-muted-foreground pl-5">{item.description}</p>
                            </div>
                            <p className="font-mono text-xs">${item.price.toFixed(2)}</p>
                        </div>
                    ))}
                  </div>
                   <Separator className="mb-4" />
                   <div className="flex justify-between items-center">
                        <div className="text-right flex-1">
                            <span className="font-bold">Total: ${order.totalAmount.toFixed(2)}</span>
                        </div>
                        <OrderStatusUpdater order={order} onUpdate={fetchOrders} />
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
