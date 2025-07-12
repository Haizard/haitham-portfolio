
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Package, Truck, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Order, LineItem, LineItemStatus } from '@/lib/orders-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { format } from 'date-fns';

const getStatusBadgeVariant = (status: LineItemStatus): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
        case "Pending": return "secondary";
        case "Processing": return "default";
        case "Shipped": return "default";
        case "Delivered": return "outline";
        case "Cancelled": return "destructive";
        case "Returned": return "destructive";
        default: return "outline";
    }
};

const getStatusIcon = (status: LineItemStatus) => {
    switch (status) {
        case "Pending": return <Package className="h-3.5 w-3.5 text-muted-foreground" />;
        case "Processing": return <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />;
        case "Shipped": return <Truck className="h-3.5 w-3.5 text-orange-500" />;
        case "Delivered": return <CheckCircle className="h-3.5 w-3.5 text-green-500" />;
        case "Cancelled": return <XCircle className="h-3.5 w-3.5 text-red-500" />;
        default: return <Package className="h-3.5 w-3.5 text-muted-foreground" />;
    }
};

export function AdminOrderListManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAllOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders`);
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data: Order[] = await response.json();
      setOrders(data);
    } catch (error: any) {
      console.error("Error fetching admin orders:", error);
      toast({ title: "Error", description: error.message || "Could not load orders.", variant: "destructive" });
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAllOrders();
  }, [fetchAllOrders]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>All Marketplace Orders</CardTitle>
        <CardDescription>A global view of all customer orders.</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No orders have been placed in the marketplace yet.</p>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {orders.map((order) => (
              <AccordionItem value={order.id!} key={order.id}>
                <AccordionTrigger className="hover:bg-muted/50 px-4 py-3 rounded-lg">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 items-center text-left gap-2 md:gap-4">
                    <div className="font-semibold text-sm">Order #{order.id!.substring(0, 8).toUpperCase()}</div>
                    <div className="text-xs text-muted-foreground">Vendor: {order.vendorName}</div>
                    <div className="text-xs text-muted-foreground">Customer: {order.customerName}</div>
                    <div className="text-xs font-medium">Total: ${order.totalAmount.toFixed(2)}</div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-2 md:p-4">
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Item</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {order.lineItems.map(item => (
                          <TableRow key={item._id.toString()}>
                            <TableCell>
                              <Image src={item.productImageUrl} alt={item.productName} width={50} height={50} className="rounded object-contain aspect-square"/>
                            </TableCell>
                            <TableCell className="font-medium text-xs">{item.productName}</TableCell>
                            <TableCell className="text-xs">x{item.quantity}</TableCell>
                            <TableCell className="text-xs">${item.price.toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadgeVariant(item.status)} className="text-xs flex items-center gap-1.5 w-fit">
                                    {getStatusIcon(item.status)}
                                    {item.status}
                                </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
