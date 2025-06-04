import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { CalendarClock } from "lucide-react";

const upcomingContent = [
  { id: 1, title: "New Blog Post: AI in 2024", type: "Blog", date: "2024-08-15", platform: "Website" },
  { id: 2, title: "Instagram Reel: Quick Tips", type: "Video", date: "2024-08-16", platform: "Instagram" },
  { id: 3, title: "Twitter Thread: Content Strategy", type: "Thread", date: "2024-08-17", platform: "Twitter" },
  { id: 4, title: "LinkedIn Article: Future of Work", type: "Article", date: "2024-08-18", platform: "LinkedIn" },
];

export function UpcomingContentCard() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-6 w-6 text-primary" />
          Upcoming Content
        </CardTitle>
        <CardDescription>Your scheduled content for the upcoming days.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <ul className="space-y-4">
            {upcomingContent.map((item) => (
              <li key={item.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg shadow-sm">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {item.platform} - Due: {new Date(item.date).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline" className="text-primary border-primary">{item.type}</Badge>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
