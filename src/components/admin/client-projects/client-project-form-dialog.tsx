
"use client";

import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, UserCheck, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ClientProject } from '@/lib/client-projects-data';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const projectStatusOptions = ["Planning", "In Progress", "On Hold", "Completed"] as const;

const clientProjectFormSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters.").max(150),
  client: z.string().min(1, "Client name is required.").max(100),
  status: z.enum(projectStatusOptions),
  description: z.string().max(5000, "Description cannot exceed 5000 characters.").optional().nullable(),
  startDate: z.date().optional().nullable(),
  endDate: z.date().optional().nullable(),
}).refine(data => {
  if (data.startDate && data.endDate && data.startDate > data.endDate) {
    return false;
  }
  return true;
}, {
  message: "End date cannot be earlier than start date.",
  path: ["endDate"],
});

export type ClientProjectFormValues = z.infer<typeof clientProjectFormSchema>;

interface ClientProjectFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  project?: ClientProject | null;
  onSuccess: (project: ClientProject) => void;
}

export function ClientProjectFormDialog({ isOpen, onClose, project, onSuccess }: ClientProjectFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ClientProjectFormValues>({
    resolver: zodResolver(clientProjectFormSchema),
    defaultValues: {
      name: "",
      client: "",
      status: "Planning",
      description: "",
      startDate: null,
      endDate: null,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (project) {
        form.reset({
          name: project.name,
          client: project.client,
          status: project.status,
          description: project.description || "",
          startDate: project.startDate ? parseISO(project.startDate) : null,
          endDate: project.endDate ? parseISO(project.endDate) : null,
        });
      } else {
        form.reset({
          name: "", client: "", status: "Planning", description: "",
          startDate: null, endDate: null,
        });
      }
    }
  }, [project, form, isOpen]);

  const handleSubmit = async (values: ClientProjectFormValues) => {
    setIsSaving(true);
    const apiUrl = project && project.id ? `/api/client-projects/${project.id}` : '/api/client-projects';
    const method = project ? 'PUT' : 'POST';

    const payload = {
      ...values,
      startDate: values.startDate ? format(values.startDate, "yyyy-MM-dd") : null,
      endDate: values.endDate ? format(values.endDate, "yyyy-MM-dd") : null,
    };

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${project ? 'update' : 'create'} project`);
      }
      const savedProject: ClientProject = await response.json();
      toast({
        title: `Project ${project ? 'Updated' : 'Created'}!`,
        description: `"${savedProject.name}" has been successfully ${project ? 'updated' : 'created'}.`,
      });
      onSuccess(savedProject);
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || `Could not ${project ? 'update' : 'create'} project.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" />
            {project ? "Edit Client Project" : "Add New Client Project"}
          </DialogTitle>
          <DialogDescription>
            {project ? "Update the details of this client project." : "Fill in the details for the new client project."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-2">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><Label>Project Name</Label><Input placeholder="e.g., New Website Launch" {...field} /><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="client" render={({ field }) => (
              <FormItem><Label>Client Name</Label><Input placeholder="e.g., Acme Innovations Inc." {...field} /><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <Label>Status</Label>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select project status" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {projectStatusOptions.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><Label>Description (Optional)</Label><Textarea placeholder="Detailed project description..." {...field} value={field.value ?? ""} className="min-h-[100px]" /><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Label>Start Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Label>End Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} disabled={(date) => field.value && field.value > date && form.getValues("startDate") ? date < form.getValues("startDate")! : false} initialFocus />
                    </PopoverContent>
                  </Popover><FormMessage />
                </FormItem>
              )} />
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline" disabled={isSaving}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90">
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : (project ? "Save Changes" : "Create Project")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
