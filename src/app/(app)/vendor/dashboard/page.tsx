
"use client";

import { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, Package, ShoppingCart, User, MoreHorizontal, Store, Landmark, ArrowRight, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Product } from '@/lib/products-data';
import type { FreelancerProfile } from '@/lib/user-profile-data';
import type { VendorFinanceSummary } from '@/lib/payouts-data';
import type { Order } from '@/lib/orders-data';
import { MetricCard } from '@/components/dashboard/metric-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

// This would come from an authenticated session
const MOCK_VENDOR_ID = "freelancer123";

interface VendorDashboardData {
  profile: FreelancerProfile;
  products: Product[];
  financeSummary: VendorFinanceSummary;
  orders: Order[];
}

export default function VendorDashboardPage() {
    const [data, setData] = useState<VendorDashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchVendorData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/vendors/${MOCK_VENDOR_ID}`);
            if (!response.ok) {
                throw new Error('Failed to fetch vendor dashboard data.');
            }
            const dashboardData: VendorDashboardData = await response.json();
            setData(dashboardData);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchVendorData();
    }, [fetchVendorData]);

    const recentOrders = data?.orders.slice(0, 5) || [];

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Vendor Dashboard</h1>
                <p className="text-muted-foreground">Welcome to your store's command center, {data?.profile.name || 'Vendor'}.</p>
            </header>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                 {isLoading ? (
                    <>
                        <Skeleton className="h-28" />
                        <Skeleton className="h-28" />
                        <Skeleton className="h-28" />
                        <Skeleton className="h-28" />
                    </>
                 ) : (
                    <>
                        <MetricCard title="Available Balance" value={`$${data?.financeSummary.availableBalance.toFixed(2) || '0.00'}`} icon={DollarSign} description="Ready for withdrawal" />
                        <MetricCard title="Total Products" value={data?.products.length.toString() || '0'} icon={Package} description="Products listed in your store" />
                        <MetricCard title="Total Orders" value={data?.orders.length.toString() || '0'} icon={ShoppingCart} description="Lifetime orders received" />
                        <MetricCard title="Lifetime Earnings" value={`$${data?.financeSummary.totalEarnings.toFixed(2) || '0.00'}`} icon={TrendingUp} description="From all completed orders" />
                    </>
                 )}
            </section>
            
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2 shadow-xl">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>A summary of your most recent customer orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-64"/> : recentOrders.length === 0 ? (
                             <p className="text-center text-muted-foreground py-10">You have no orders yet.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOrders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.customerName}</TableCell>
                                            <TableCell className="text-xs">{format(new Date(order.orderDate), 'PPP')}</TableCell>
                                            <TableCell>{order.lineItems.length}</TableCell>
                                            <TableCell className="text-right font-semibold">${order.totalAmount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                    <CardFooter className="justify-end">
                         <Button asChild variant="outline">
                            <Link href="/vendor/orders">
                                View All Orders <ArrowRight className="ml-2 h-4 w-4"/>
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="col-span-1 shadow-xl">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Manage your store efficiently.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                         <Button asChild variant="default" size="lg" className="justify-start">
                           <Link href="/vendor/products"><Package className="mr-3 h-5 w-5"/>Manage My Products</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="justify-start">
                           <Link href="/vendor/orders"><ShoppingCart className="mr-3 h-5 w-5"/>Manage All Orders</Link>
                        </Button>
                         <Button asChild variant="outline" size="lg" className="justify-start">
                           <Link href="/vendor/finances"><Landmark className="mr-3 h-5 w-5"/>My Finances</Link>
                        </Button>
                         <Button asChild variant="outline" size="lg" className="justify-start">
                           <Link href={`/store/${MOCK_VENDOR_ID}`} target="_blank"><Store className="mr-3 h-5 w-5"/>View My Storefront</Link>
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
