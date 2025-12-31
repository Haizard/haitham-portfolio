
"use client";

import { BarChartHorizontalBig, DollarSign, ListFilter, Package, Settings2, ShoppingCart, Users, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, ExternalLink, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useState, useEffect } from "react";
import { ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, Area, Line, Bar } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminDashboardStats } from "@/lib/orders-data";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileManagementHeader } from "@/components/layout/mobile-management-header";
import { MobileManagementNav } from "@/components/layout/mobile-management-nav";
import { cn } from "@/lib/utils";

const salesChartConfig = {
  sales: { label: "Sales ($)", color: "hsl(var(--primary))" },
  orders: { label: "Orders", color: "hsl(var(--accent))" },
} satisfies ChartConfig;

const StatCard: React.FC<{ title: string; value: string; trend?: string; trendDirection?: "up" | "down"; icon: React.ElementType; color: string; isLoading: boolean }> = ({ title, value, trend, trendDirection, icon: Icon, color, isLoading }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`p-2 rounded-full ${color} text-white`}>
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="h-[28px] w-1/2 bg-muted animate-pulse rounded-md my-1"></div>
      ) : (
        <div className="text-2xl font-bold">{value}</div>
      )}
      {isLoading ? (
        <div className="h-[18px] w-3/4 bg-muted animate-pulse rounded-md mt-1"></div>
      ) : (
        trend && trendDirection && (
          <p className={`text-xs ${trendDirection === "up" ? "text-green-600" : "text-red-600"} flex items-center`}>
            {trendDirection === "up" ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
            {trend} vs last month
          </p>
        )
      )}
    </CardContent>
  </Card>
);


export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/dashboard-stats');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch dashboard data.');
        }
        const data: AdminDashboardStats = await response.json();
        setStats(data);
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        toast({ title: "Error", description: `Could not load dashboard stats: ${error.message}`, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, [toast]);

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "Processing": return "default";
      case "Shipped": return "secondary";
      case "Delivered": return "outline";
      case "Cancelled": return "destructive";
      default: return "outline";
    }
  };

  const statCardsData = [
    { id: "sales", title: "Total Sales", value: stats ? `$${stats.totalSales.toLocaleString()}` : "$0", trend: "+0%", trendDirection: "up" as const, icon: DollarSign, color: "bg-green-500", isLoading: isLoading },
    { id: "orders", title: "Total Orders", value: stats ? stats.totalOrders.toLocaleString() : "0", trend: "+0%", trendDirection: "up" as const, icon: ShoppingCart, color: "bg-blue-500", isLoading: isLoading },
    { id: "products", title: "Products", value: stats ? stats.totalProducts.toLocaleString() : "0", trend: "", icon: Package, color: "bg-orange-500", isLoading: isLoading },
    { id: "visitors", title: "Visitors", value: "35,678", trend: "+20.1%", trendDirection: "up" as const, icon: Users, color: "bg-purple-500", isLoading: false }, // Visitors is still mock
  ];

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24 font-display">
        <MobileManagementHeader
          title="Admin Panel"
          subtitle="System Overview"
        />

        <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto no-scrollbar">
          {/* Main Stat Card - Admin Sales */}
          <div className="bg-gradient-to-br from-primary to-orange-600 rounded-[2rem] p-6 text-white shadow-lg shadow-primary/20">
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                <span className="material-symbols-outlined text-[28px]">payments</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border border-white/10">
                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                <span>+12.5%</span>
              </div>
            </div>
            <div>
              <p className="opacity-80 text-sm font-bold mb-1 tracking-wide uppercase">Gross Revenue</p>
              <h3 className="text-4xl font-black tracking-tight">
                {isLoading ? "---" : `$${stats?.totalSales.toLocaleString()}`}
              </h3>
            </div>
          </div>

          {/* Secondary Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400 w-fit mb-4">
                <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
              </div>
              <h4 className="text-2xl font-black tracking-tight">{isLoading ? "--" : stats?.totalOrders.toLocaleString()}</h4>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">Total Orders</p>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400 w-fit mb-4">
                <span className="material-symbols-outlined text-[24px]">group</span>
              </div>
              <h4 className="text-2xl font-black tracking-tight">35.6k</h4>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">Total Users</p>
            </div>
          </div>

          {/* Simple Recent Orders List for Mobile */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-black tracking-tight uppercase tracking-[0.1em] text-sm opacity-60">Latest Transactions</h3>
              <button className="text-primary text-[10px] font-black uppercase tracking-widest">Manage All</button>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-2 border border-gray-100 dark:border-white/5 shadow-sm space-y-1">
              {isLoading ? (
                [1, 2, 3].map(i => <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-[1.8rem]" />)
              ) : (
                stats?.recentOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-[1.8rem] transition-colors">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">order_approve</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black truncate">{order.customerName}</p>
                      <p className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">{order.vendorName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-foreground">${order.totalAmount.toFixed(2)}</p>
                      <p className="text-[9px] font-black uppercase tracking-tighter opacity-40">SUCCESS</p>
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
    <div className="container mx-auto py-8 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center">
            <BarChartHorizontalBig className="mr-3 h-8 w-8 text-primary" />
            Platform Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Global platform performance and insights.</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
          <Button variant="outline" size="sm"><ListFilter className="mr-2 h-4 w-4" />Filter</Button>
          <Button variant="outline" size="sm"><Settings2 className="mr-2 h-4 w-4" />Customize</Button>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCardsData.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-3 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Platform Sales This Month</CardTitle>
            <CardDescription>Monthly sales performance across the entire platform.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {isLoading ? <Skeleton className="h-[350px] w-full" /> : (
              <ChartContainer config={salesChartConfig} className="h-[350px] w-full">
                <ComposedChart data={stats?.monthlySales}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <YAxis yAxisId="left" tickFormatter={(value) => `$${value / 1000}k`} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <RechartsTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--accent))", stroke: "hsl(var(--background))" }} />
                </ComposedChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Recent Platform Orders</CardTitle>
            <CardDescription>A quick view of the latest customer orders from all vendors.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-[200px] w-full" /> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.recentOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium text-xs">{order.id?.substring(0, 8).toUpperCase()}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.vendorName}</TableCell>
                      <TableCell className="hidden md:table-cell text-sm">{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm">${order.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" size="sm">View All Orders</Button>
          </CardFooter>
        </Card>
      </section>

      <section>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Top Selling Products</CardTitle>
            <CardDescription>The platform's most popular items this month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? <Skeleton className="h-[250px] w-full" /> : (
              stats?.topSellingProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Image src={product.imageUrl} alt={product.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint={product.imageHint || 'product image'} />
                  <div className="flex-grow">
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    <p className="text-xs text-muted-foreground">{product.category} - ${product.price?.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{product.sales} sales</p>
                    <p className="text-xs text-green-600">${product.revenue?.toLocaleString()}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/ecommerce?product=${product.slug}`}>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" size="sm">View All Products</Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
