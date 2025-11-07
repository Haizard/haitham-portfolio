"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Mail, Phone, Calendar, Award, Shield, Edit2, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AvatarUpload } from './avatar-upload';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/auth-data';

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfilePageProps {
  user: User;
  onUpdate?: (updatedUser: Partial<User>) => void;
}

export function ProfilePage({ user, onUpdate }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState(user.avatar);
  const { toast } = useToast();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          avatar: currentAvatar,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const result = await response.json();

      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      });

      setIsEditing(false);

      if (onUpdate) {
        onUpdate(result.user);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (url: string) => {
    setCurrentAvatar(url);

    // Auto-save avatar
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          avatar: url,
        }),
      });

      if (response.ok && onUpdate) {
        const result = await response.json();
        onUpdate(result.user);
      }
    } catch (error) {
      console.error('Avatar update error:', error);
    }
  };

  const getMembershipColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return 'bg-gradient-to-r from-slate-400 to-slate-600 text-white';
      case 'gold':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 'silver':
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      default:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="gap-2">
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex justify-center">
              <AvatarUpload
                currentAvatar={currentAvatar}
                userName={user.name}
                onUploadComplete={handleAvatarUpload}
              />
            </div>

            <Separator />

            {/* Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      {...form.register('name')}
                      disabled={isLoading}
                    />
                  ) : (
                    <p className="text-sm font-medium py-2">{user.name}</p>
                  )}
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">{user.email}</p>
                    {user.emailVerified ? (
                      <Badge variant="default" className="text-xs">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Not Verified
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      {...form.register('phone')}
                      disabled={isLoading}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {user.phone || 'Not provided'}
                      </p>
                      {user.phone && user.phoneVerified && (
                        <Badge variant="default" className="text-xs">
                          Verified
                        </Badge>
                      )}
                    </div>
                  )}
                </div>

                {/* Member Since */}
                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      form.reset();
                    }}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Membership Tier */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Membership Tier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-muted-foreground" />
                <Badge className={cn("text-sm font-semibold", getMembershipColor(user.membershipTier))}>
                  {user.membershipTier.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Loyalty Points */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Loyalty Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.loyaltyPoints.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Earn points with every booking
              </p>
            </CardContent>
          </Card>

          {/* User Roles */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Account Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <Badge key={role} variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    {role.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

