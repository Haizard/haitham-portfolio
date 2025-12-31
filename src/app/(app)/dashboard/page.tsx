"use client";

import { Briefcase, Store, BarChartHorizontalBig, ArrowRight, Truck, PenSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CreatorDashboardPage from "@/components/dashboard/page"; // Import the creator dashboard
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileManagementHeader } from "@/components/layout/mobile-management-header";
import { MobileManagementNav } from "@/components/layout/mobile-management-nav";
import { cn } from "@/lib/utils";

const allFeatures = [
  {
    title: "Freelancer Suite",
    description: "Find projects, manage proposals, and track your freelance work.",
    cta: "Find Work",
    href: "/find-work",
    icon: Briefcase,
    role: "freelancer",
  },
  {
    title: "Client Suite",
    description: "Find talent, post new jobs, and manage your hired freelancers.",
    cta: "Post a Job / Manage",
    href: "/post-job",
    icon: Briefcase,
    role: "client",
  },
  {
    title: "Vendor Marketplace",
    description: "List products, manage orders, and track your e-commerce sales.",
    cta: "Go to Vendor Dashboard",
    href: "/vendor/dashboard",
    icon: Store,
    role: "vendor",
  },
  {
    title: "Transport Partner Portal",
    description: "Find and manage your delivery & transport jobs.",
    href: "/transport/find-work",
    icon: Truck,
    cta: "Find Transport Jobs",
    role: "transport_partner",
  },
  {
    title: "Creator Suite",
    description: "Access AI content tools, manage your blog, and grow your audience.",
    cta: "Open Content Studio",
    href: "/content-studio",
    icon: PenSquare,
    role: "creator",
  },
  {
    title: "Admin Control Panel",
    description: "Oversee the entire platform, manage users, and view global analytics.",
    href: "/admin/dashboard",
    icon: BarChartHorizontalBig,
    cta: "Access Admin Panel",
    role: "admin",
  },
];

export default function DashboardHubPage() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { user, isLoading: isUserLoading } = useUser();

  const userRoles = user?.roles || [];

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is ONLY a creator, show the dedicated creator dashboard directly.
  if (userRoles.length === 1 && userRoles[0] === 'creator') {
    return <CreatorDashboardPage />;
  }

  if (isMobile) {
    const features = allFeatures.filter(feature => userRoles.includes(feature.role as any));
    return (
      <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark pb-24 font-display">
        <MobileManagementHeader
          title="Ajira Online"
          subtitle="Management Console"
        />

        <div className="flex-1 px-5 py-6 space-y-6 overflow-y-auto no-scrollbar">
          <div className="bg-white dark:bg-white/5 rounded-[2.5rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm text-center mb-8">
            <div className="h-20 w-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-primary text-[40px]">person</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{user.name}</h2>
            <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1 opacity-60">Suite Access Control</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="bg-white dark:bg-white/5 rounded-[2rem] p-6 border border-gray-100 dark:border-white/5 shadow-sm flex items-center gap-5 active:scale-[0.98] transition-all hover:border-primary/30"
              >
                <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <feature.icon className="h-8 w-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-black tracking-tight truncate">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground font-medium line-clamp-1">{feature.cta}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-50 dark:bg-white/10 flex items-center justify-center">
                  <ArrowRight className="h-5 w-5 opacity-40" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <MobileManagementNav />
      </div>
    );
  }

  const features = allFeatures.filter(feature => userRoles.includes(feature.role as any));

  // This case will now primarily handle users with multiple roles.
  if (features.length === 0 && user) {
    return (
      <div className="flex flex-col gap-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground">Use the sidebar to navigate to your tools.</p>
        </header>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome to Your Ajira Online Hub</h1>
        <p className="text-muted-foreground">Select a panel to manage your creator activities.</p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <div className="bg-primary/10 p-3 rounded-full">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <div>
                <CardTitle>{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={feature.href}>
                  {feature.cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
}
