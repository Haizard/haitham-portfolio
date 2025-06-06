
"use client";

import { useState } from 'react';
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Link2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const socialPlatformOptions = ["Instagram", "Twitter", "Facebook", "LinkedIn", "TikTok", "YouTube"] as const;
export type SocialPlatformType = (typeof socialPlatformOptions)[number];

const addAccountFormSchema = z.object({
  platform: z.enum(socialPlatformOptions, {
    required_error: "Please select a social media platform.",
  }),
  name: z.string().min(1, "Profile name/handle cannot be empty.").max(100, "Profile name is too long."),
});

type AddAccountFormValues = z.infer<typeof addAccountFormSchema>;

interface AddAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountAdd: (platform: SocialPlatformType, name: string) => void;
}

export function AddAccountDialog({ isOpen, onClose, onAccountAdd }: AddAccountDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<AddAccountFormValues>({
    resolver: zodResolver(addAccountFormSchema),
    defaultValues: {
      name: "",
      platform: undefined,
    },
  });

  const handleSubmit = async (values: AddAccountFormValues) => {
    setIsSaving(true);
    // Simulate API call for linking account
    await new Promise(resolve => setTimeout(resolve, 700));
    onAccountAdd(values.platform, values.name);
    setIsSaving(false);
    onClose();
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); form.reset(); } }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" /> Add Social Media Account
          </DialogTitle>
          <DialogDescription>
            Select a platform and enter your profile name or handle. (This is a mock integration).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {socialPlatformOptions.map(platform => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Name / Handle</FormLabel>
                  <Input placeholder="e.g., @yourhandle or Your Page Name" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { onClose(); form.reset(); }} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Linking...
                  </>
                ) : (
                  "Link Account"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
