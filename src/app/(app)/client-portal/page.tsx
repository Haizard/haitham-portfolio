import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, History, MessageSquare, ShieldLock, FolderArchive } from "lucide-react";
import Image from "next/image";

const mockProjects = [
    { id: 1, name: "Website Redesign Q3", status: "In Progress", client: "Acme Corp" },
    { id: 2, name: "Social Media Campaign", status: "Completed", client: "Beta LLC" },
    { id: 3, name: "Video Production Series", status: "Planning", client: "Gamma Inc" },
];

export default function ClientPortalPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Client Portal</h1>
        <p className="text-xl text-muted-foreground mt-2">
          A secure space for your clients to access project updates, files, and communication.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-6 w-6 text-primary" /> Project Status</CardTitle>
            <CardDescription>Overview of active and past client projects.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
            {mockProjects.slice(0,2).map(project => (
                <li key={project.id} className="p-3 bg-secondary/50 rounded-lg">
                    <h4 className="font-semibold">{project.name} <span className="text-xs text-muted-foreground">({project.client})</span></h4>
                    <p className={`text-sm ${project.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>{project.status}</p>
                </li>
            ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-6 w-6 text-primary" /> Booking History</CardTitle>
            <CardDescription>Client's past and upcoming service bookings.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[150px] bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-center">Booking history will be displayed here.</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FolderArchive className="h-6 w-6 text-primary" /> Shared Files</CardTitle>
            <CardDescription>Access documents, assets, and deliverables.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[150px] bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-center">Shared files will be accessible here.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <ShieldLock className="h-7 w-7 text-accent" /> Secure Client Communication
          </CardTitle>
          <CardDescription>A dedicated channel for client discussions and feedback.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-8 p-8">
          <Image src="https://placehold.co/400x300.png" alt="Secure Communication Illustration" width={400} height={300} className="rounded-lg" data-ai-hint="communication chat" />
          <div className="space-y-4">
            <p className="text-muted-foreground">
              CreatorOS aims to provide a secure and centralized messaging system within the client portal. 
              This will help streamline communication, keep all project-related discussions in one place, and ensure privacy.
            </p>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              Explore Communication Features (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
