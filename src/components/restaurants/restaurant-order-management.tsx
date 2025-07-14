
// src/components/restaurants/restaurant-order-management.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BellRing, Package, Soup, CheckCircle, XCircle, Calendar, Users, Clock, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Order, OrderStatus, TableBooking, TableBookingStatus } from '@/lib/restaurants-data';
import { useUser } from '@/hooks/use-user';
import { format } from 'date-fns';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const orderStatusOptions: OrderStatus[] = ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Completed', 'Cancelled'];
const bookingStatusOptions: TableBookingStatus[] = ['pending', 'confirmed', 'cancelled'];

const getOrderStatusBadgeVariant = (status: OrderStatus): "default" | "secondary" | "outline" | "destructive" => {
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

const getOrderStatusIcon = (status: OrderStatus) => {
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
                    {orderStatusOptions.map(status => (
                        <SelectItem key={status} value={status} className="text-xs">{status}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
    );
};

const BookingStatusUpdater: React.FC<{ booking: TableBooking; onUpdate: () => void; restaurantId: string; }> = ({ booking, onUpdate, restaurantId }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const { toast } = useToast();

    const handleStatusChange = async (newStatus: TableBookingStatus) => {
        if (newStatus === booking.status) return;
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/restaurants/${restaurantId}/bookings/${booking.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!response.ok) throw new Error("Failed to update booking status");
            toast({ title: "Booking Updated", description: `Booking for ${booking.customerName} is now ${newStatus}.` });
            onUpdate();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Select onValueChange={handleStatusChange} value={booking.status} disabled={isUpdating}>
                <SelectTrigger className="w-[150px] h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {bookingStatusOptions.map(status => (
                        <SelectItem key={status} value={status} className="text-xs capitalize">{status}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
    );
}

export function RestaurantOrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [bookings, setBookings] = useState<TableBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUser();

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [ordersRes, bookingsRes] = await Promise.all([
        fetch(`/api/orders?vendorId=${user.id}`),
        fetch(`/api/restaurants/${user.id}/bookings`) // Assuming vendorId and restaurantId are the same user ID
      ]);
      
      if (!ordersRes.ok) throw new Error('Failed to fetch food orders');
      const ordersData: Order[] = await ordersRes.json();
      setOrders(ordersData);
      
      if (!bookingsRes.ok) throw new Error('Failed to fetch table bookings');
      const bookingsData: TableBooking[] = await bookingsRes.json();
      setBookings(bookingsData);

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    if (user) {
        fetchData();
    }
  }, [fetchData, user]);

  if (isLoading) {
    return <Card><CardContent className="p-6 flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/></CardContent></Card>;
  }

  return (
    <Tabs defaultValue="food-orders" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="food-orders">Food Orders ({orders.length})</TabsTrigger>
        <TabsTrigger value="table-bookings">Table Bookings ({bookings.length})</TabsTrigger>
      </TabsList>
      <TabsContent value="food-orders" className="mt-4">
        <Card className="shadow-xl">
          <CardHeader><CardTitle>Incoming Food Orders</CardTitle><CardDescription>A real-time view of customer orders.</CardDescription></CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">You have no food orders yet.</p>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <Card key={order.id} className="bg-muted/30">
                    <CardHeader className="flex flex-row justify-between items-start p-4">
                      <div>
                        <h3 className="font-semibold">Order #{order.id!.substring(0,8).toUpperCase()}</h3>
                        <p className="text-xs text-muted-foreground">For: {order.customerName}</p>
                        <p className="text-xs text-muted-foreground">Received: {format(new Date(order.orderDate), 'PPP p')}</p>
                        <div className="mt-2 flex items-center gap-2">
                           <Badge variant="outline" className="text-xs capitalize flex items-center gap-1.5">
                               <ShoppingBag className="h-3 w-3"/>{order.orderType || 'delivery'}
                           </Badge>
                           <Badge variant="outline" className="text-xs capitalize flex items-center gap-1.5">
                               <Clock className="h-3 w-3"/>{format(new Date(order.fulfillmentTime), 'p')}
                           </Badge>
                        </div>
                      </div>
                      <Badge variant={getOrderStatusBadgeVariant(order.status)} className="text-xs flex items-center gap-1.5 capitalize">{getOrderStatusIcon(order.status)} {order.status}</Badge>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <Separator className="mb-4" /><div className="space-y-2 mb-4">
                        {order.lineItems.map(item => (
                          <div key={item._id.toString()} className="flex justify-between items-start text-sm">
                            <div><p><span className="font-semibold">{item.quantity}x</span> {item.productName}</p><p className="text-xs text-muted-foreground pl-5">{item.description}</p></div>
                            <p className="font-mono text-xs">${item.price.toFixed(2)}</p>
                          </div>))}
                      </div><Separator className="mb-4" />
                      <div className="flex justify-between items-center">
                        <div className="text-right flex-1"><span className="font-bold">Total: ${order.totalAmount.toFixed(2)}</span></div>
                        <OrderStatusUpdater order={order} onUpdate={fetchData} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="table-bookings" className="mt-4">
         <Card className="shadow-xl">
          <CardHeader><CardTitle>Table Booking Requests</CardTitle><CardDescription>Manage your table reservations.</CardDescription></CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">You have no table booking requests.</p>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <Card key={booking.id} className="bg-muted/30">
                    <div className="p-4 grid grid-cols-1 md:grid-cols-4 items-center gap-4">
                        <div className="md:col-span-3 space-y-1">
                            <h3 className="font-semibold">{booking.customerName}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Users className="h-4 w-4"/> {booking.guestCount} guest(s)</span>
                                <span className="flex items-center gap-1"><Calendar className="h-4 w-4"/> {format(new Date(booking.bookingDate), 'PPP')}</span>
                                <span className="flex items-center gap-1"><Clock className="h-4 w-4"/> {booking.bookingTime}</span>
                            </div>
                        </div>
                        <div className="flex md:justify-end">
                            <BookingStatusUpdater booking={booking} onUpdate={fetchData} restaurantId={booking.restaurantId}/>
                        </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
