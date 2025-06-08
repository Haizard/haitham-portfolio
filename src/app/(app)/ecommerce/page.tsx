
"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, XAxis, YAxis, Legend, Area, ComposedChart } from "recharts";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Package, Users, MoreHorizontal, ExternalLink, TrendingUp, ListFilter, Settings2, BarChartHorizontalBig } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useState, useEffect } from "react";

// Placeholder Data
const placeholderStats = [
  { title: "Total Sales", value: "$12,345", trend: "+12.5%", trendDirection: "up" as "up" | "down", icon: DollarSign, color: "bg-green-500" },
  { title: "Total Orders", value: "1,280", trend: "+8.2%", trendDirection: "up" as "up" | "down", icon: ShoppingCart, color: "bg-blue-500" },
  { title: "Products", value: "750", trend: "-1.5%", trendDirection: "down" as "up" | "down", icon: Package, color: "bg-orange-500" },
  { title: "Visitors", value: "35,678", trend: "+20.1%", trendDirection: "up" as "up" | "down", icon: Users, color: "bg-purple-500" },
];

const placeholderSalesChartData = [
  { date: "01 Jun", Sales: 2400, Orders: 120 },
  { date: "02 Jun", Sales: 1398, Orders: 70 },
  { date: "03 Jun", Sales: 9800, Orders: 210 },
  { date: "04 Jun", Sales: 3908, Orders: 90 },
  { date: "05 Jun", Sales: 4800, Orders: 150 },
  { date: "06 Jun", Sales: 3800, Orders: 110 },
  { date: "07 Jun", Sales: 4300, Orders: 130 },
  { date: "Today", Sales: 5200, Orders: 160 },
];

const salesChartConfig = {
  sales: { label: "Sales ($)", color: "hsl(var(--primary))" },
  orders: { label: "Orders", color: "hsl(var(--accent))" },
} satisfies ChartConfig;

const placeholderRecentOrders = [
  { id: "ORD001", customer: "Alice Wonderland", avatar: "AW", date: "2024-07-28", total: "$125.50", status: "Processing" as "Processing" | "Shipped" | "Delivered" | "Cancelled", items: 3 },
  { id: "ORD002", customer: "Bob The Builder", avatar: "BB", date: "2024-07-28", total: "$45.00", status: "Shipped" as "Processing" | "Shipped" | "Delivered" | "Cancelled", items: 1 },
  { id: "ORD003", customer: "Charlie Brown", avatar: "CB", date: "2024-07-27", total: "$210.00", status: "Delivered" as "Processing" | "Shipped" | "Delivered" | "Cancelled", items: 5 },
  { id: "ORD004", customer: "Diana Prince", avatar: "DP", date: "2024-07-26", total: "$75.20", status: "Delivered" as "Processing" | "Shipped" | "Delivered" | "Cancelled", items: 2 },
  { id: "ORD005", customer: "Edward Scissorhands", avatar: "ES", date: "2024-07-25", total: "$99.99", status: "Cancelled" as "Processing" | "Shipped" | "Delivered" | "Cancelled", items: 1 },
];

const placeholderTopProducts = [
  { id: "PROD001", name: "Premium Blend Coffee", category: "Groceries", price: "$18.99", sales: 120, revenue: "$2278.80", imageUrl: "https://placehold.co/80x80.png", imageHint:"coffee beans" },
  { id: "PROD002", name: "Wireless Ergonomic Mouse", category: "Electronics", price: "$49.99", sales: 85, revenue: "$4249.15", imageUrl: "https://placehold.co/80x80.png", imageHint:"computer mouse" },
  { id: "PROD003", name: "Organic Cotton T-Shirt", category: "Apparel", price: "$25.00", sales: 250, revenue: "$6250.00", imageUrl: "https://placehold.co/80x80.png", imageHint:"tshirt fashion" },
  { id: "PROD004", name: "Smart Home Speaker Mini", category: "Electronics", price: "$39.00", sales: 70, revenue: "$2730.00", imageUrl: "https://placehold.co/80x80.png", imageHint:"smart speaker" },
  { id: "PROD005", name: "Yoga Mat Premium", category: "Sports", price: "$30.00", sales: 95, revenue: "$2850.00", imageUrl: "https://placehold.co/80x80.png", imageHint:"yoga mat" },
];

const StatCard: React.FC<{ title: string; value: string; trend: string; trendDirection: "up" | "down"; icon: React.ElementType; color: string }> = ({ title, value, trend, trendDirection, icon: Icon, color }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`p-2 rounded-full ${color} text-white`}>
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className={`text-xs ${trendDirection === "up" ? "text-green-600" : "text-red-600"} flex items-center`}>
        {trendDirection === "up" ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
        {trend} vs last month
      </p>
    </CardContent>
  </Card>
);

export default function EcommerceDashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // To prevent hydration mismatch with charts that rely on window size
    return <div className="flex justify-center items-center h-screen"><Package className="h-12 w-12 animate-pulse text-primary"/></div>;
  }
  
  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "Processing": return "default"; // Primary color
      case "Shipped": return "secondary"; // Accent color
      case "Delivered": return "outline"; // Green (custom style or rely on theme)
      case "Cancelled": return "destructive";
      default: return "outline";
    }
  };


  return (
    <div className="container mx-auto py-8 space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center">
            <BarChartHorizontalBig className="mr-3 h-8 w-8 text-primary" />
            E-commerce Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Overview of your store's performance.</p>
        </div>
        <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Button variant="outline" size="sm"><ListFilter className="mr-2 h-4 w-4"/>Filter</Button>
            <Button variant="outline" size="sm"><Settings2 className="mr-2 h-4 w-4"/>Customize</Button>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {placeholderStats.map((stat) => (
          <StatCard key={stat.title} {...stat} icon={stat.icon} />
        ))}
      </section>

      {/* Sales Chart & Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Sales This Month</CardTitle>
            <CardDescription>Comparison of sales and orders for June 2024 (Placeholder)</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={salesChartConfig} className="h-[350px] w-full">
              <ComposedChart data={placeholderSalesChartData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(value) => `$${value / 1000}k`}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <RechartsTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Area yAxisId="left" type="monotone" dataKey="Sales" fill="hsl(var(--primary)/0.2)" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="Orders" stroke="hsl(var(--accent))" strokeWidth={2} dot={{r: 4, fill: "hsl(var(--accent))", stroke: "hsl(var(--background))"}}/>
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-xl">
            <CardHeader>
                <CardTitle className="text-xl font-semibold">Recent Activity</CardTitle>
                <CardDescription>Latest updates from your store.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[350px] overflow-y-auto">
                {[
                    { user: "Olivia Martin", action: "placed a new order #ORD006", time: "5m ago", icon: ShoppingCart, avatar: "OM" },
                    { user: "Product Update", action: "Stock for 'Yoga Mat' low", time: "30m ago", icon: Package, avatar: "PU" },
                    { user: "Liam Smith", action: "left a 5-star review", time: "1h ago", icon: TrendingUp, avatar: "LS"},
                    { user: "System Alert", action: "Payment gateway connection stable", time: "2h ago", icon: DollarSign, avatar: "SA"},
                ].map(activity => (
                    <div key={activity.action} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50">
                        <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                {activity.avatar}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium">{activity.user} <span className="text-muted-foreground font-normal">{activity.action}</span></p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
      </section>
      
      {/* Recent Orders Table */}
      <section>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Recent Orders</CardTitle>
            <CardDescription>A quick view of the latest customer orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden sm:table-cell">Items</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {placeholderRecentOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-xs">{order.id}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                                <AvatarFallback className="text-xs">{order.avatar}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{order.customer}</span>
                        </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm">{order.items}</TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{new Date(order.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-sm">{order.total}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">{order.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
           <CardFooter className="justify-end">
                <Button variant="outline" size="sm">View All Orders</Button>
            </CardFooter>
        </Card>
      </section>

      {/* Top Selling Products */}
      <section>
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Top Selling Products</CardTitle>
            <CardDescription>Your most popular items this month.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {placeholderTopProducts.map((product, index) => (
              <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Image src={product.imageUrl} alt={product.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint={product.imageHint}/>
                <div className="flex-grow">
                  <h4 className="font-medium text-sm">{product.name}</h4>
                  <p className="text-xs text-muted-foreground">{product.category} - {product.price}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold">{product.sales} sales</p>
                    <p className="text-xs text-green-600">{product.revenue}</p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`#product/${product.id}`}>
                        <ExternalLink className="h-4 w-4 text-muted-foreground"/>
                    </Link>
                </Button>
              </div>
            ))}
          </CardContent>
            <CardFooter className="justify-end">
                <Button variant="outline" size="sm">View All Products</Button>
            </CardFooter>
        </Card>
      </section>
    </div>
  );
}
