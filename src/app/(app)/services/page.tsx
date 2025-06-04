import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarPlus, DollarSign, Edit3, Eye, PlusCircle, Trash2 } from "lucide-react";
import Image from "next/image";

const mockServices = [
  { id: 1, name: "1-on-1 Coaching Session", price: "150", duration: "60 min", description: "Personalized coaching to help you achieve your goals." },
  { id: 2, name: "Content Strategy Blueprint", price: "499", duration: "Project", description: "A comprehensive content strategy tailored to your brand." },
  { id: 3, name: "Video Editing Package", price: "250", duration: "Per Video", description: "Professional video editing for up to 10 mins of footage." },
];

export default function ServicesPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-headline">Service Management</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Create, manage, and book your services seamlessly.
          </p>
        </div>
        <Button size="lg" className="mt-4 md:mt-0 bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Service
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {mockServices.map(service => (
            <Card key={service.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                <CardHeader>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 pt-1">
                        <DollarSign className="h-4 w-4 text-green-600" /> ${service.price}
                        <span className="text-muted-foreground/50">|</span>
                        <CalendarPlus className="h-4 w-4 text-blue-600" /> {service.duration}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" size="sm"><Eye className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">View</span></Button>
                    <Button variant="outline" size="sm"><Edit3 className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Edit</span></Button>
                    <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Delete</span></Button>
                </CardFooter>
            </Card>
        ))}
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Integrate Your Calendar</CardTitle>
          <CardDescription>Connect your calendar to manage bookings and availability effortlessly.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-8 p-8">
          <Image src="https://placehold.co/400x300.png" alt="Calendar Integration Illustration" width={400} height={300} className="rounded-lg" data-ai-hint="calendar schedule" />
          <div className="space-y-4">
            <p className="text-muted-foreground">
              CreatorOS will soon allow you to link Google Calendar, Outlook Calendar, and other popular calendar apps. 
              This will enable automated booking confirmations, availability checks, and reminders for you and your clients.
            </p>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              Learn More About Integrations (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
