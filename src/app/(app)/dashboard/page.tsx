
"use client";

import { Briefcase, Store, BarChartHorizontalBig, ArrowRight, Truck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const allFeatures = [
  {
    title: "Freelancer Suite",
    description: "Find projects, manage proposals, and track your freelance work.",
    href: "/find-work",
    icon: Briefcase,
    cta: "Find Work",
    role: "freelancer",
  },
   {
    title: "Client Suite",
    description: "Post jobs and manage your hired freelancers.",
    href: "/my-jobs",
    icon: Briefcase,
    cta: "Manage My Jobs",
    role: "client",
  },
  {
    title: "Vendor Marketplace",
    description: "List products, manage orders, and track your e-commerce sales.",
    href: "/vendor/dashboard",
    icon: Store,
    cta: "Go to Vendor Dashboard",
    role: "vendor",
  },
  {
    title: "Delivery Agent Portal",
    description: "Find and manage your delivery jobs.",
    href: "/delivery/find-work",
    icon: Truck,
    cta: "Find Delivery Jobs",
    role: "delivery_agent",
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
  const { user } = useUser();
  const router = useRouter();

  const userRole = user?.roles?.[0]; // Get the single role of the user

  // Automatically redirect if user has only one specific role (not a creator/client combo)
  useEffect(() => {
    if (userRole && userRole !== 'creator' && userRole !== 'client') {
      const roleFeature = allFeatures.find(f => f.role === userRole);
      if (roleFeature) {
        router.replace(roleFeature.href);
      }
    }
  }, [userRole, router]);


  const features = allFeatures.filter(feature => user?.roles.includes(feature.role));
  
  if (features.length === 0 && userRole) {
      // Handle cases like 'creator' role which might not have a dedicated hub card
      // Or redirect to a default page
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
        <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome to Your CreatorOS Hub</h1>
        <p className="text-muted-foreground">Select a panel to manage your creator activities.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
