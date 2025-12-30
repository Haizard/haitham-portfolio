
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit3, Trash2, Loader2, PlusCircle, UserCheck, CalendarDays, CheckSquare, PlaySquare, Pause, FolderClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ClientProject } from '@/lib/client-projects-data';
import { ClientProjectFormDialog } from './client-project-form-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export function ClientProjectListManagement() {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ClientProject | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<ClientProject | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/client-projects');
      if (!response.ok) throw new Error('Failed to fetch client projects');
      const data: ClientProject[] = await response.json();
      setProjects(data);
    } catch (error: any) {
      console.error("Error fetching client projects:", error);
      toast({ title: "Error", description: error.message || "Could not load client projects.", variant: "destructive" });
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateNewProject = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEditProject = (project: ClientProject) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const confirmDeleteProject = (project: ClientProject) => {
    setProjectToDelete(project);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete || !projectToDelete.id) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/client-projects/${projectToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete project');
      }
      toast({ title: "Project Deleted", description: `"${projectToDelete.name}" has been removed.` });
      fetchProjects();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Could not delete project.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setProjectToDelete(null);
    }
  };

  const handleFormSuccess = (savedProject: ClientProject) => {
    fetchProjects();
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const getStatusInfo = (status: ClientProject['status']) => {
    switch (status) {
      case "Planning": return { variant: "secondary", icon: FolderClock, color: "text-blue-500" };
      case "In Progress": return { variant: "default", icon: PlaySquare, color: "text-yellow-500" };
      case "Completed": return { variant: "outline", icon: CheckSquare, color: "text-green-500" };
      case "On Hold": return { variant: "destructive", icon: Pause, color: "text-red-500" };
      default: return { variant: "outline", icon: UserCheck, color: "text-muted-foreground" };
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card className="shadow-xl mb-8">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-headline flex items-center"><UserCheck className="mr-2 h-6 w-6 text-primary" />All Client Projects</CardTitle>
            <CardDescription>View and manage all client projects.</CardDescription>
          </div>
          <Button onClick={handleCreateNewProject} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Project
          </Button>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No client projects found. Click "Add New Project" to get started.</p>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Project Name</TableHead>
                    <TableHead className="min-w-[150px]">Client</TableHead>
                    <TableHead className="min-w-[150px]">Status</TableHead>
                    <TableHead className="min-w-[150px]">Start Date</TableHead>
                    <TableHead className="min-w-[150px]">End Date</TableHead>
                    <TableHead className="text-right min-w-[180px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map(project => {
                    const statusInfo = getStatusInfo(project.status);
                    return (
                      <TableRow key={project.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>{project.client}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant} className="text-xs flex items-center w-fit">
                            <statusInfo.icon className={cn("h-4 w-4 mr-1.5", statusInfo.color)} />
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {project.startDate ? (
                            <span className="flex items-center text-xs"><CalendarDays className="h-3.5 w-3.5 mr-1" />{format(parseISO(project.startDate), "PPP")}</span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {project.endDate ? (
                            <span className="flex items-center text-xs"><CalendarDays className="h-3.5 w-3.5 mr-1" />{format(parseISO(project.endDate), "PPP")}</span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="outline" size="sm" onClick={() => handleEditProject(project)}>
                            <Edit3 className="h-4 w-4 mr-1 sm:mr-0" /> <span className="hidden sm:inline ml-1">Edit</span>
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => confirmDeleteProject(project)}>
                            <Trash2 className="h-4 w-4 mr-1 sm:mr-0" /> <span className="hidden sm:inline ml-1">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ClientProjectFormDialog
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingProject(null); }}
        project={editingProject}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project "<strong>{projectToDelete?.name}</strong>".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
