"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Globe, DollarSign, Bell, Mail, Smartphone, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { User, UserPreferences } from '@/lib/auth-data';

const settingsSchema = z.object({
  language: z.string(),
  currency: z.string(),
  notifications: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
  }),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsPageProps {
  user: User;
  onUpdate?: (updatedUser: Partial<User>) => void;
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ar', label: 'العربية' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
];

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'CNY', label: 'Chinese Yuan (CNY)' },
  { value: 'AUD', label: 'Australian Dollar (AUD)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
  { value: 'CHF', label: 'Swiss Franc (CHF)' },
  { value: 'INR', label: 'Indian Rupee (INR)' },
  { value: 'AED', label: 'UAE Dirham (AED)' },
];

export function SettingsPage({ user, onUpdate }: SettingsPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      language: user.preferences.language,
      currency: user.preferences.currency,
      notifications: user.preferences.notifications,
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const result = await response.json();

      toast({
        title: "Settings updated!",
        description: "Your preferences have been saved successfully.",
      });

      if (onUpdate) {
        onUpdate(result.user);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Update failed",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and notification settings
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Regional Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>
                Set your preferred language and currency
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Language */}
              <div className="space-y-2">
                <Label htmlFor="language" className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Language
                </Label>
                <Select
                  value={form.watch('language')}
                  onValueChange={(value) => form.setValue('language', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose your preferred language for the interface
                </p>
              </div>

              <Separator />

              {/* Currency */}
              <div className="space-y-2">
                <Label htmlFor="currency" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Currency
                </Label>
                <Select
                  value={form.watch('currency')}
                  onValueChange={(value) => form.setValue('currency', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.value} value={curr.value}>
                        {curr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  All prices will be displayed in this currency
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive booking confirmations and updates via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={form.watch('notifications.email')}
                  onCheckedChange={(checked) =>
                    form.setValue('notifications.email', checked)
                  }
                  disabled={isLoading}
                />
              </div>

              <Separator />

              {/* SMS Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications" className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive important updates via text message
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={form.watch('notifications.sms')}
                  onCheckedChange={(checked) =>
                    form.setValue('notifications.sms', checked)
                  }
                  disabled={isLoading}
                />
              </div>

              <Separator />

              {/* Push Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive real-time notifications in your browser
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={form.watch('notifications.push')}
                  onCheckedChange={(checked) =>
                    form.setValue('notifications.push', checked)
                  }
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

