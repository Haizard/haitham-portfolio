
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Users, AtSign, Link2, PlusCircle, Instagram, Twitter, Facebook, Linkedin, Youtube, Share2, Activity, Mail, MessageSquare as MessageSquareIcon } from "lucide-react";
import Image from "next/image";
import { AddAccountDialog, type SocialPlatformType } from "@/components/social-media/add-account-dialog";
import { useToast } from "@/hooks/use-toast";
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
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface LinkedAccount {
  id: string;
  platform: SocialPlatformType;
  name: string;
  // iconUrl is no longer needed as we use Lucide icons
}

const platformIcons: Record<SocialPlatformType, React.ElementType> = {
  Instagram: Instagram,
  Twitter: Twitter,
  Facebook: Facebook,
  LinkedIn: Linkedin,
  TikTok: Share2, // Using Share2 as a placeholder for TikTok
  YouTube: Youtube,
};

const initialLinkedAccounts: LinkedAccount[] = [
  { id: "1", platform: "Instagram", name: "@yourprofile" },
  { id: "2", platform: "Facebook", name: "YourPage" },
];

export default function SocialMediaPage() {
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>(initialLinkedAccounts);
  const [isAddAccountDialogOpen, setIsAddAccountDialogOpen] = useState(false);
  const [accountToDisconnect, setAccountToDisconnect] = useState<LinkedAccount | null>(null);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { toast } = useToast();

  const handleAddAccount = (platform: SocialPlatformType, name: string) => {
    const newAccount: LinkedAccount = {
      id: `${platform.toLowerCase()}-${name.replace(/\s+/g, '-')}-${Date.now()}`, // Simple unique ID
      platform,
      name,
    };
    setLinkedAccounts(prev => [...prev, newAccount]);
    toast({ title: "Account Added", description: `${platform} account "${name}" has been (mock) linked.` });
  };

  const confirmDisconnect = (account: LinkedAccount) => {
    setAccountToDisconnect(account);
  };

  const handleDisconnectAccount = () => {
    if (!accountToDisconnect) return;
    setIsDisconnecting(true);
    // Simulate API call
    setTimeout(() => {
      setLinkedAccounts(prev => prev.filter(acc => acc.id !== accountToDisconnect.id));
      toast({ title: "Account Disconnected", description: `${accountToDisconnect.platform} account "${accountToDisconnect.name}" has been disconnected.` });
      setAccountToDisconnect(null);
      setIsDisconnecting(false);
    }, 500);
  };

  const PlatformIconComponent = ({ platform, className }: { platform: SocialPlatformType, className?: string }) => {
    const Icon = platformIcons[platform] || Share2; // Fallback icon
    return <Icon className={cn("h-6 w-6", className)} />;
  };


  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline">Social Media Management</h1>
        <p className="text-xl text-muted-foreground mt-2">
          Connect your accounts, manage interactions, and analyze performance all in one place.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-6 w-6 text-primary" />
              Linked Accounts
            </CardTitle>
            <CardDescription>Manage your connected social media profiles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {linkedAccounts.length > 0 ? (
               <ScrollArea className="h-[200px] pr-3">
                <div className="space-y-3">
                  {linkedAccounts.map(account => (
                    <div key={account.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-3">
                        <PlatformIconComponent platform={account.platform} className="text-primary" />
                        <div className="text-sm">
                            <span className="font-medium">{account.name}</span>
                            <span className="block text-xs text-muted-foreground">{account.platform}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => confirmDisconnect(account)}>Disconnect</Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No accounts linked yet.</p>
            )}
            <Button 
              className="w-full mt-2 bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => setIsAddAccountDialogOpen(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Account
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow md:col-span-2 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" />
              Unified Inbox
            </CardTitle>
            <CardDescription>DMs, comments, and mentions in one stream. (Coming Soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
                <TabsTrigger value="all" className="text-xs sm:text-sm"><Activity className="mr-1 h-4 w-4" />All</TabsTrigger>
                <TabsTrigger value="mentions" className="text-xs sm:text-sm"><AtSign className="mr-1 h-4 w-4" />Mentions</TabsTrigger>
                <TabsTrigger value="dms" className="text-xs sm:text-sm"><Mail className="mr-1 h-4 w-4" />DMs</TabsTrigger>
                <TabsTrigger value="comments" className="text-xs sm:text-sm"><MessageSquareIcon className="mr-1 h-4 w-4" />Comments</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <div className="border rounded-lg p-4 h-[220px] flex flex-col items-center justify-center text-center bg-muted/30 mt-2">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-md font-semibold">All Interactions</h3>
                  <p className="text-xs text-muted-foreground">
                    View all your social interactions here. (Feature coming soon)
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="mentions">
                 <div className="border rounded-lg p-4 h-[220px] flex flex-col items-center justify-center text-center bg-muted/30 mt-2">
                  <AtSign className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-md font-semibold">No new mentions</h3>
                  <p className="text-xs text-muted-foreground">
                    Mentions from connected accounts will appear here.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="dms">
                <div className="border rounded-lg p-4 h-[220px] flex flex-col items-center justify-center text-center bg-muted/30 mt-2">
                  <Mail className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-md font-semibold">Direct Messages Inbox</h3>
                  <p className="text-xs text-muted-foreground">
                    Unified DMs are planned for a future update.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="comments">
                <div className="border rounded-lg p-4 h-[220px] flex flex-col items-center justify-center text-center bg-muted/30 mt-2">
                  <MessageSquareIcon className="h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="text-md font-semibold">No new comments</h3>
                  <p className="text-xs text-muted-foreground">
                    Comments on your posts will be shown here.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
            <CardTitle className="text-2xl font-headline">Analytics Overview</CardTitle>
            <CardDescription>Track your social media performance.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-8">
            <Image src="https://placehold.co/600x300.png" alt="Social Analytics Illustration" width={600} height={300} className="rounded-lg mb-6" data-ai-hint="analytics chart" />
            <h3 className="text-xl font-semibold mb-2">Detailed Analytics Are On The Way!</h3>
            <p className="text-muted-foreground max-w-md">
                Soon you&apos;ll be able to dive deep into your engagement rates, follower growth, content reach, and more, all powered by CreatorOS.
            </p>
        </CardContent>
      </Card>

      <AddAccountDialog
        isOpen={isAddAccountDialogOpen}
        onClose={() => setIsAddAccountDialogOpen(false)}
        onAccountAdd={handleAddAccount}
      />

      <AlertDialog open={!!accountToDisconnect} onOpenChange={(open) => !open && setAccountToDisconnect(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Disconnect</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect the {accountToDisconnect?.platform} account "{accountToDisconnect?.name}"? This is a mock action and won't affect your actual social media account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAccountToDisconnect(null)} disabled={isDisconnecting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnectAccount} disabled={isDisconnecting} className="bg-destructive hover:bg-destructive/90">
              {isDisconnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
