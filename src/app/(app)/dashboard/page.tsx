
import { DollarSign, ListChecks, CalendarClock, Users } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { UpcomingContentCard } from "@/components/dashboard/upcoming-content-card";
import { TaskListCard } from "@/components/dashboard/task-list-card";
import { RevenueOverviewCard } from "@/components/dashboard/revenue-overview-card";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Welcome back, Creator!</h1>
        <p className="text-muted-foreground">Here&apos;s your CreatorOS dashboard overview.</p>
      </header>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Monthly Revenue"
          value="$4,805"
          icon={DollarSign}
          description="+12.5% from last month"
          className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        />
        <MetricCard
          title="Active Tasks"
          value="12"
          icon={ListChecks}
          description="3 overdue"
          className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        />
        <MetricCard
          title="Scheduled Content"
          value="8"
          icon={CalendarClock}
          description="Next post: Tomorrow"
          className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        />
        <MetricCard
          title="New Subscribers"
          value="+250"
          icon={Users}
          description="This week"
          className="shadow-lg hover:shadow-xl transition-shadow duration-300"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <UpcomingContentCard />
        <TaskListCard />
      </section>
      
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RevenueOverviewCard />
        <Card className="col-span-1 lg:col-span-1">
            <CardHeader>
                <CardTitle>Grow Your Audience</CardTitle>
                <CardDescription>Tips and tools to expand your reach.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
                <Image src="https://placehold.co/300x200.png" alt="Audience Growth illustration" width={300} height={200} className="rounded-lg mb-4" data-ai-hint="growth chart"/>
                <p className="text-sm text-muted-foreground mb-4">
                    Leverage CreatorOS tools to understand your audience and create engaging content that converts.
                </p>
                <button className="bg-accent text-accent-foreground hover:bg-accent/90 px-6 py-2 rounded-md text-sm font-medium">
                    Learn More
                </button>
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
