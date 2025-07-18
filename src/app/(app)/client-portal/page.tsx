
"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, History, Shield, FolderArchive, Loader2 } from "lucide-react";
import Image from "next/image";
import type { ClientProject } from '@/lib/client-projects-data';
import { useToast } from '@/hooks/use-toast';

export default function ClientPortalPage() {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProjects() {
      setIsLoadingProjects(true);
      try {
        const response = await fetch('/api/client-projects');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Failed to fetch projects and parse error.' }));
          throw new Error(errorData.message || 'Failed to fetch projects');
        }
        const data: ClientProject[] = await response.json();
        setProjects(data);
      } catch (error: any) {
        console.error("Error fetching client projects:", error);
        toast({
          title: "Error Loading Projects",
          description: error.message || "Could not load client projects.",
          variant: "destructive",
        });
        setProjects([]); 
      } finally {
        setIsLoadingProjects(false);
      }
    }
    fetchProjects();
  }, [toast]);

  const getStatusColor = (status: ClientProject['status']) => {
    switch (status) {
      case 'Completed': return 'text-green-600 dark:text-green-400';
      case 'In Progress': return 'text-yellow-600 dark:text-yellow-400';
      case 'Planning': return 'text-blue-600 dark:text-blue-400';
      case 'On Hold': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Client Portal</h1>
        <p className="text-xl text-muted-foreground mt-2">
          A secure space for your clients to access project updates, files, and communication.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-lg hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-6 w-6 text-primary" /> Project Status</CardTitle>
            <CardDescription>Overview of active and past client projects.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProjects ? (
              <div className="flex justify-center items-center h-[150px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : projects.length > 0 ? (
              <ul className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                {projects.map(project => (
                  <li key={project.id} className="p-3 bg-secondary/50 rounded-lg shadow-sm">
                    <h4 className="font-semibold">{project.name} <span className="text-xs text-muted-foreground">({project.client})</span></h4>
                    <p className={`text-sm font-medium ${getStatusColor(project.status)}`}>{project.status}</p>
                    {project.description && <p className="text-xs text-muted-foreground mt-1">{project.description}</p>}
                  </li>
                ))}
              </ul>
            ) : (
               <p className="text-muted-foreground text-center py-4">No projects to display. (Or seed data might be running - refresh if stuck)</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><History className="h-6 w-6 text-primary" /> Booking History</CardTitle>
            <CardDescription>Client's past and upcoming service bookings.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[150px] bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-center">Booking history will be displayed here. (Coming Soon)</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FolderArchive className="h-6 w-6 text-primary" /> Shared Files</CardTitle>
            <CardDescription>Access documents, assets, and deliverables.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[150px] bg-muted/30 rounded-lg">
            <p className="text-muted-foreground text-center">Shared files will be accessible here. (Coming Soon)</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2">
            <Shield className="h-7 w-7 text-accent" /> Secure Client Communication
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
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => toast({title: "Coming Soon!", description: "Secure messaging features are under development."})}>
              Explore Communication Features (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
