"use client";

import { Hotel, Car, Compass, PlaneLanding, ShoppingBag, UserCheck, Calendar, DollarSign, Users, TrendingUp, Package, Star, ShieldCheck, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileManagementHeader } from '../layout/mobile-management-header';
import { MobileManagementNav } from '../layout/mobile-management-nav';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/lib/auth-data';

interface RoleDashboardProps {
  roles: UserRole[];
  userName: string;
}

export function RoleDashboard({ roles, userName }: RoleDashboardProps) {
  const isMobile = useIsMobile();
  const isCustomer = roles.includes('customer');
  const isClient = roles.includes('client');
  const isPropertyOwner = roles.includes('property_owner');
  const isCarOwner = roles.includes('car_owner');
  const isTourOperator = roles.includes('tour_operator');
  const isFreelancer = roles.includes('freelancer');
  const isCreator = roles.includes('creator');
  const isTransferProvider = roles.includes('transfer_provider') || roles.includes('transport_partner');
  const isAdmin = roles.includes('admin');

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24">
        <MobileManagementHeader
          title="Dashboard"
          subtitle={`Welcome back, ${userName}`}
        />

        <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto no-scrollbar">
          {/* Main Stat Card - Gradient */}
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
              <p className="opacity-80 text-sm font-bold mb-1 font-display tracking-wide uppercase">Performance</p>
              <h3 className="text-4xl font-black font-display tracking-tight">$24,592.80</h3>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600 dark:text-blue-400">
                  <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
                </div>
              </div>
              <h4 className="text-2xl font-black mb-1 font-display tracking-tight">148</h4>
              <p className="text-xs text-muted-foreground font-black uppercase tracking-widest opacity-70">New Orders</p>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-2xl text-green-600 dark:text-green-400">
                  <span className="material-symbols-outlined text-[24px]">storefront</span>
                </div>
              </div>
              <h4 className="text-2xl font-black mb-1 font-display tracking-tight">42</h4>
              <p className="text-xs text-muted-foreground font-black uppercase tracking-widest opacity-70">Active Vendors</p>
            </div>
          </div>

          {/* Quick Actions Scroll */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-black font-display tracking-tight">Quick Actions</h3>
              <span className="text-[10px] items-center font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full flex gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                LIVE
              </span>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2 -mx-5 px-5">
              {[
                { label: 'Add Vendor', icon: 'add_business', href: '/become-a-vendor' },
                { label: 'Inventory', icon: 'inventory_2', href: '/account/my-properties' },
                { label: 'Coupons', icon: 'confirmation_number', href: '/admin/dashboard' },
                { label: 'Reports', icon: 'bar_chart', href: '/admin/dashboard' },
                { label: 'Settings', icon: 'settings', href: '/account/settings' }
              ].map((action) => (
                <Link key={action.label} href={action.href} className="flex flex-col items-center gap-2 min-w-[90px] group">
                  <div className="h-16 w-16 rounded-[1.5rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-center shadow-sm group-active:scale-95 transition-all group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/5">
                    <span className="material-symbols-outlined text-primary text-[28px]">{action.icon}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-center opacity-80 whitespace-nowrap">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-lg font-black font-display tracking-tight">Recent Activity</h3>
              <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline hover:opacity-80 transition-all">View All</button>
            </div>
            <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-2 border border-gray-100 dark:border-white/5 shadow-sm space-y-1">
              {[
                { title: 'New Vendor', desc: 'Sushi Master needs review', time: '2m ago', icon: 'restaurant', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
                { title: 'Order #8291', desc: '$340.00 from Burger Joint', time: '15m ago', icon: 'shopping_cart', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
                { title: 'Stock Alert', desc: 'Low inventory: Spicy Tuna', time: '1h ago', icon: 'warning', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' }
              ].map((activity, idx) => (
                <div key={idx} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-white/5 rounded-[1.8rem] transition-colors">
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", activity.color)}>
                    <span className="material-symbols-outlined text-[22px]">{activity.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black font-display truncate text-foreground">{activity.title}</p>
                    <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">{activity.desc}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Reviews Section */}
          <div className="pb-4">
            <h3 className="text-lg font-black font-display tracking-tight mb-4 px-1">Critical Tasks</h3>
            <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-5 border border-gray-100 dark:border-white/5 shadow-sm flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gray-200 dark:bg-gray-700 bg-cover bg-center shrink-0 shadow-inner border border-white/10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=100&q=80')" }}></div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-black font-display tracking-tight truncate">Spicy Tuna Roll</h4>
                  <div className="flex text-yellow-500 gap-0.5 scale-90 -mr-2">
                    {[1, 2, 3, 4, 5].map(s => <span key={s} className="material-symbols-outlined text-[16px] filled">star</span>)}
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground font-medium line-clamp-2 leading-relaxed italic border-l-2 border-primary/20 pl-2">
                  "Absolutely delicious! The fish was fresh and the spice level was perfect."
                </p>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 h-9 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all">Approve</button>
                  <button className="flex-1 h-9 rounded-xl bg-secondary text-foreground text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Reject</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <MobileManagementNav />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {userName}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your account
          </p>
        </div>

        {/* Admin Dashboard */}
        {isAdmin && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-red-600">
              <ShieldCheck className="h-6 w-6" />
              Admin Dashboard
            </h2>
            <Card className="border-red-200 bg-red-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Platform Administration
                </CardTitle>
                <CardDescription>
                  Manage users, bookings, and system settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="destructive" className="w-full" asChild>
                    <Link href="/account/admin">Open Admin Panel</Link>
                  </Button>
                  <Button variant="outline" className="w-full border-red-200 hover:bg-red-100" asChild>
                    <Link href="/account/settings">System Settings</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Customer Dashboard */}
        {isCustomer && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Users className="h-6 w-6" />
              Customer Dashboard
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Active Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No active bookings
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                    <Link href="/hotels">Browse Hotels</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Past Trips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No completed trips
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                    <Link href="/tours">Explore Tours</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Saved Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No saved properties
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                    <Link href="/cars">Rent a Car</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Flight Referrals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Track your flight bookings
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                    <Link href="/flights">Search Flights</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    My Bookings
                  </CardTitle>
                  <CardDescription>View and manage all your bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="default" className="w-full" asChild>
                    <Link href="/account/bookings">View Bookings</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PlaneLanding className="h-5 w-5 text-primary" />
                    Flight Referrals
                  </CardTitle>
                  <CardDescription>Track your flight referrals and earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="default" className="w-full" asChild>
                    <Link href="/account/my-flights">View Referrals</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    My Reviews
                  </CardTitle>
                  <CardDescription>Read and write reviews</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="default" className="w-full" asChild>
                    <Link href="/account/bookings">Leave Reviews</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
        {/* Client Dashboard */}
        {isClient && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-indigo-600">
              <Briefcase className="h-6 w-6" />
              Client Dashboard
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Jobs Posted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage your active projects
                  </p>
                  <Button variant="default" size="sm" className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700" asChild>
                    <Link href="/my-jobs">Manage Jobs</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Active Contracts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Freelancers currently working
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Post a Project
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">New</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Find talent for your needs
                  </p>
                  <Button variant="outline" size="sm" className="mt-3 w-full border-indigo-200 hover:bg-indigo-50" asChild>
                    <Link href="/post-job">Create Posting</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Property Owner Dashboard */}
        {isPropertyOwner && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Hotel className="h-6 w-6" />
              Property Owner Dashboard
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Total Properties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No properties listed
                  </p>
                  <Button variant="default" size="sm" className="mt-3 w-full" asChild>
                    <Link href="/account/my-properties">Manage Properties</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Active Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No active bookings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Monthly Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Average Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-1">
                    0.0 <Star className="h-5 w-5 text-yellow-400" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No reviews yet
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Car Owner Dashboard */}
        {isCarOwner && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Car className="h-6 w-6" />
              Car Rental Dashboard
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Total Vehicles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No vehicles listed
                  </p>
                  <Button variant="default" size="sm" className="mt-3 w-full" asChild>
                    <Link href="/account/my-vehicles">Manage Vehicles</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Active Rentals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No active rentals
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Monthly Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Fleet Utilization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0%</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Average utilization
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tour Operator Dashboard */}
        {isTourOperator && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Compass className="h-6 w-6" />
              Tour Operator Dashboard
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Active Tours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No tours listed
                  </p>
                  <Button variant="default" size="sm" className="mt-3 w-full" asChild>
                    <Link href="/account/my-tours">Manage Tours</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Upcoming Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No upcoming tours
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Total Participants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    This month
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Transfer Provider Dashboard */}
        {isTransferProvider && (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <PlaneLanding className="h-6 w-6" />
              Transfer Provider Dashboard
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Active Transfers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No active transfers
                  </p>
                  <Button variant="default" size="sm" className="mt-3 w-full" asChild>
                    <Link href="/account/my-transfers">Manage Transfers</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Completed Today
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No transfers today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Daily Earnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Customer Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center gap-1">
                    0.0 <Star className="h-5 w-5 text-yellow-400" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    No ratings yet
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/account/profile">
                  <Users className="mr-2 h-4 w-4" />
                  Edit Profile
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/account/settings">
                  <Package className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" disabled>
                <Calendar className="mr-2 h-4 w-4" />
                My Bookings
              </Button>
              <Button variant="outline" className="justify-start" disabled>
                <DollarSign className="mr-2 h-4 w-4" />
                Payment Methods
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fallback Dashboard for users without specific roles */}
        {!isCustomer && !isPropertyOwner && !isCarOwner && !isTourOperator && !isTransferProvider && (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Your Dashboard</CardTitle>
              <CardDescription>
                Your account is currently set up. To access role-specific features, please contact support to configure your account type.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Current roles: {roles.join(', ')}
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  <Button variant="outline" asChild>
                    <Link href="/account/profile">
                      <Users className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/account/settings">
                      <Package className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div >
  );
}

