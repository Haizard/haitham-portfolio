// src/app/(app)/vendor/restaurant/analytics/page.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { BarChart2, DollarSign, ListOrdered, ShoppingBag, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, Area, Line, Bar, ResponsiveContainer } from "recharts";
import type { RestaurantAnalyticsData } from '@/lib/orders-data';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const salesChartConfig = {
  sales: { label: "Sales (£)", color: "hsl(var(--primary))" },
  orders: { label: "Orders", color: "hsl(var(--accent))" },
};

const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`;

export default function RestaurantAnalyticsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [data, setData] = useState<RestaurantAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async (restaurantId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/analytics`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch analytics data.");
      }
      setData(await response.json());
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // In a real app, restaurantId would be fetched based on the logged-in user.
    // Assuming the user.id is the restaurantId for this context.
    if (user?.id) {
      fetchAnalytics(user.id);
    }
  }, [user, fetchAnalytics]);
  
  const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; }> = ({ title, value, icon: Icon }) => (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-7 w-24" /> : <div className="text-2xl font-bold">{value}</div>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
          <BarChart2 className="h-8 w-8 text-primary" />
          Restaurant Analytics
        </h1>
        <p className="text-muted-foreground mt-1">Track your sales, popular items, and performance over time.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Revenue" value={data ? formatCurrency(data.totalRevenue) : '£0.00'} icon={DollarSign}/>
          <StatCard title="Total Orders" value={data ? data.totalOrders.toLocaleString() : '0'} icon={ShoppingBag}/>
          <StatCard title="Average Order Value" value={data ? formatCurrency(data.averageOrderValue) : '£0.00'} icon={DollarSign}/>
      </section>

       <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
         <Card className="lg:col-span-3 shadow-xl">
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
            <CardDescription>Monthly revenue and order volume.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             {isLoading ? <Skeleton className="h-[350px] w-full" /> : (
                <ChartContainer config={salesChartConfig} className="h-[350px] w-full">
                <ResponsiveContainer>
                  <BarChart data={data?.monthlySales}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                      <YAxis yAxisId="left" stroke="hsl(var(--primary))" tickFormatter={(value) => formatCurrency(value)} />
                      <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--accent))" />
                      <RechartsTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Line yAxisId="right" type="monotone" dataKey="orders" stroke="hsl(var(--accent))" />
                  </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
             )}
          </CardContent>
        </Card>
         <Card className="lg:col-span-2 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ListOrdered/> Top Selling Items</CardTitle>
              <CardDescription>Your most popular menu items by quantity sold.</CardDescription>
            </CardHeader>
            <CardContent>
               {isLoading ? <Skeleton className="h-[350px] w-full" /> : !data || data.topSellingItems.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">No sales data available yet.</p>
               ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.topSellingItems.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium text-sm">{item.productName}</TableCell>
                        <TableCell className="text-right font-semibold">{item.totalQuantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
               )}
            </CardContent>
         </Card>
      </section>
    </div>
  );
}
