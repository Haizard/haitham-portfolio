
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
import { useUser } from '@/hooks/use-user';
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileManagementHeader } from "@/components/layout/mobile-management-header";
import { MobileManagementNav } from "@/components/layout/mobile-management-nav";
import { cn } from "@/lib/utils";

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
    const { user } = useUser(); // Get the current user from the context

    const fetchVendorData = useCallback(async () => {
        if (!user) return; // Don't fetch if there's no user
        setIsLoading(true);
        try {
            const response = await fetch(`/api/vendors/${user.id}`); // Use the logged-in user's ID
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
    }, [toast, user]);

    useEffect(() => {
        if (user) { // Only fetch data when the user object is available
            fetchVendorData();
        }
    }, [fetchVendorData, user]);

    const recentOrders = data?.orders.slice(0, 5) || [];

    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24 font-display">
                <MobileManagementHeader
                    title="Vendor Dashboard"
                    subtitle={`Store: ${data?.profile.name || 'Vendor'}`}
                />

                <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto no-scrollbar">
                    {/* Primary Balance Card - Gradient */}
                    <div className="bg-gradient-to-br from-[#f45925] to-orange-400 rounded-[2rem] p-6 text-white shadow-lg shadow-[#f45925]/20">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                                <span className="material-symbols-outlined text-[28px]">account_balance_wallet</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border border-white/10">
                                <span className="material-symbols-outlined text-[16px]">verified</span>
                                <span>Verified</span>
                            </div>
                        </div>
                        <div>
                            <p className="opacity-80 text-sm font-bold mb-1 tracking-wide uppercase">Available Balance</p>
                            <h3 className="text-4xl font-black tracking-tight">
                                {isLoading ? "---" : `$${data?.financeSummary.availableBalance.toFixed(2) || '0.00'}`}
                            </h3>
                        </div>
                    </div>

                    {/* Secondary Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 w-fit mb-4">
                                <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                            </div>
                            <h4 className="text-2xl font-black tracking-tight">{isLoading ? "--" : data?.products.length.toString() || '0'}</h4>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">Products</p>
                        </div>
                        <div className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl text-green-600 dark:text-green-400 w-fit mb-4">
                                <span className="material-symbols-outlined text-[24px]">shopping_cart_checkout</span>
                            </div>
                            <h4 className="text-2xl font-black tracking-tight">{isLoading ? "--" : data?.orders.length.toString() || '0'}</h4>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">New Orders</p>
                        </div>
                    </div>

                    {/* Quick Actions Scroll */}
                    <div>
                        <h3 className="text-lg font-black tracking-tight mb-4 px-1">Quick Actions</h3>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 -mx-5 px-5">
                            {[
                                { label: 'Add Product', icon: 'add_circle', href: '/vendor/products' },
                                { label: 'Withdraw', icon: 'payments', href: '/vendor/finances' },
                                { label: 'Storefront', icon: 'store', href: `/store/${user?.id}` },
                                { label: 'Settings', icon: 'settings', href: '/account/settings' }
                            ].map((action) => (
                                <Link key={action.label} href={action.href} className="flex flex-col items-center gap-2 min-w-[90px] group">
                                    <div className="h-16 w-16 rounded-[1.5rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-center shadow-sm active:scale-95 transition-all group-hover:border-primary/50">
                                        <span className="material-symbols-outlined text-primary text-[28px]">{action.icon}</span>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-center opacity-80 whitespace-nowrap">{action.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="text-lg font-black tracking-tight">Recent Sales</h3>
                            <button className="text-primary text-[10px] font-black uppercase tracking-widest">View All</button>
                        </div>
                        <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-2 border border-gray-100 dark:border-white/5 shadow-sm space-y-1">
                            {isLoading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-[1.8rem]" />)
                            ) : recentOrders.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8 text-xs font-bold uppercase tracking-widest opacity-40">No sales yet</p>
                            ) : (
                                recentOrders.map((order) => (
                                    <div key={order.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-[1.8rem] transition-colors">
                                        <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-black truncate">{order.customerName}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">{format(new Date(order.orderDate), 'PPP')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-foreground">${order.totalAmount.toFixed(2)}</p>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#f45925] bg-[#f45925]/10 px-2 py-0.5 rounded-full">Paid</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <MobileManagementNav />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Vendor Dashboard</h1>
                <p className="text-muted-foreground">Welcome to your store's command center, {data?.profile.name || 'Vendor'}.</p>
            </header>

            <section className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                        {isLoading ? <Skeleton className="h-64" /> : recentOrders.length === 0 ? (
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
                                View All Orders <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <Card className="col-span-1 shadow-xl">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Manage your store efficiently.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        <Button asChild variant="default" className="justify-start col-span-2">
                            <Link href="/vendor/products"><Package className="mr-3 h-5 w-5" />Manage Products</Link>
                        </Button>
                        <Button asChild variant="outline" className="justify-start">
                            <Link href="/vendor/orders"><ShoppingCart className="mr-2 h-4 w-4" />Orders</Link>
                        </Button>
                        <Button asChild variant="outline" className="justify-start">
                            <Link href="/vendor/finances"><Landmark className="mr-2 h-4 w-4" />Finances</Link>
                        </Button>
                        <Button asChild variant="outline" className="justify-start col-span-2">
                            <Link href={`/store/${user?.id}`} target="_blank"><Store className="mr-3 h-5 w-5" />View My Storefront</Link>
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
