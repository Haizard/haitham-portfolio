
"use client";

import { RevenueOverviewCard } from "./revenue-overview-card";
import { TaskListCard } from "./task-list-card";
import { UpcomingContentCard } from "./upcoming-content-card";

export default function CreatorDashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline">Creator Dashboard</h1>
        <p className="text-muted-foreground">An overview of your creative projects and performance.</p>
      </header>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <RevenueOverviewCard />
        <TaskListCard />
      </section>
      
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <UpcomingContentCard />
        {/* You can add more cards here */}
      </section>
    </div>
  );
}
