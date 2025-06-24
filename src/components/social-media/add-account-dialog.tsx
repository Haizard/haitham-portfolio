
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
import { Loader2, Link2, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const socialPlatformOptions = ["Instagram", "Twitter", "Facebook", "LinkedIn", "TikTok", "YouTube"] as const;
export type SocialPlatformType = (typeof socialPlatformOptions)[number];

const addAccountFormSchema = z.object({
  platform: z.enum(socialPlatformOptions, {
    required_error: "Please select a social media platform.",
  }),
  name: z.string().max(100, "Profile name is too long.").optional(), // Optional now, as TikTok uses OAuth
}).refine(data => {
  // Name is required if platform is not TikTok
  if (data.platform !== "TikTok" && (!data.name || data.name.trim() === "")) {
    return false;
  }
  return true;
}, {
  message: "Profile name/handle cannot be empty for this platform.",
  path: ["name"], // path of error
});

type AddAccountFormValues = z.infer<typeof addAccountFormSchema>;

interface AddAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountAdd: (platform: SocialPlatformType, name: string) => void; // For non-OAuth platforms
  isProcessingAuth: boolean;
  setIsProcessingAuth: (value: boolean) => void;
}

export function AddAccountDialog({ isOpen, onClose, onAccountAdd, isProcessingAuth, setIsProcessingAuth }: AddAccountDialogProps) {
  const { toast } = useToast();

  const form = useForm<AddAccountFormValues>({
    resolver: zodResolver(addAccountFormSchema),
    defaultValues: {
      name: "",
      platform: undefined,
    },
  });

  const selectedPlatform = form.watch("platform");

  const handleSubmit = async (values: AddAccountFormValues) => {
    if (values.platform === "TikTok") {
      // This case should ideally not be hit if button is used, but as a fallback
      handleTikTokConnect();
      return;
    }

    setIsProcessingAuth(true); // Use for mock saving too
    // Simulate API call for linking account for non-TikTok platforms
    await new Promise(resolve => setTimeout(resolve, 700));
    onAccountAdd(values.platform!, values.name!); // platform and name are asserted as they are required by schema for non-TikTok
    setIsProcessingAuth(false);
    onCloseDialog();
  };

  const handleTikTokConnect = () => {
    setIsProcessingAuth(true);
    // Redirect to our backend route that will initiate TikTok OAuth
    // This will cause a full page navigation, which is standard for OAuth external redirects.
    window.location.href = '/api/auth/tiktok/connect';
    // No need to call onCloseDialog() here immediately, 
    // page will reload or redirect; dialog state will be reset by parent or subsequent navigation.
  };

  const onCloseDialog = () => {
    form.reset();
    onClose();
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCloseDialog(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" /> Add Social Media Account
          </DialogTitle>
          <DialogDescription>
            {selectedPlatform === "TikTok" 
              ? "Click below to connect your TikTok account securely."
              : "Select a platform and enter your profile name or handle. (Mock integration for non-TikTok platforms)"}
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
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("name", ""); // Reset name when platform changes
                      form.clearErrors("name");
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger disabled={isProcessingAuth}>
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

            {selectedPlatform !== "TikTok" && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Name / Handle</FormLabel>
                    <Input placeholder="e.g., @yourhandle or Your Page Name" {...field} disabled={isProcessingAuth} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCloseDialog} disabled={isProcessingAuth}>
                Cancel
              </Button>
              {selectedPlatform === "TikTok" ? (
                <Button 
                  type="button" 
                  onClick={handleTikTokConnect} 
                  disabled={isProcessingAuth} 
                  className="bg-[#FF2D55] text-white hover:bg-[#FF2D55]/90" // TikTok-like color
                >
                  {isProcessingAuth ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
                  Connect with TikTok
                </Button>
              ) : (
                <Button type="submit" disabled={!selectedPlatform || isProcessingAuth} className="bg-primary hover:bg-primary/90">
                  {isProcessingAuth ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Linking...
                    </>
                  ) : (
                    "Link Account (Mock)"
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
