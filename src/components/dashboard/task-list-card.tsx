import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ListChecks } from "lucide-react";

const tasks = [
  { id: "task1", label: "Record new podcast episode", completed: false },
  { id: "task2", label: "Edit YouTube video for Friday", completed: true },
  { id: "task3", label: "Plan next month's content", completed: false },
  { id: "task4", label: "Engage with comments on Instagram", completed: false },
  { id: "task5", label: "Research new video editing software", completed: true },
];

export function TaskListCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          Task List
        </CardTitle>
        <CardDescription>Your pending and completed tasks.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center space-x-3 p-2 bg-secondary/50 rounded-md">
                <Checkbox id={task.id} checked={task.completed} aria-label={task.label} />
                <label
                  htmlFor={task.id}
                  className={`text-sm font-medium leading-none ${
                    task.completed ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {task.label}
                </label>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
