import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Users, AtSign, Link2, PlusCircle } from "lucide-react";
import Image from "next/image";

export default function SocialMediaPage() {
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
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Image src="https://placehold.co/40x40.png" alt="Social Platform Icon" width={40} height={40} className="rounded-full" data-ai-hint="social logo" />
                <span>@yourprofile (Instagram)</span>
              </div>
              <Button variant="outline" size="sm">Disconnect</Button>
            </div>
             <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Image src="https://placehold.co/40x40.png" alt="Social Platform Icon" width={40} height={40} className="rounded-full" data-ai-hint="social logo" />
                <span>YourPage (Facebook)</span>
              </div>
              <Button variant="outline" size="sm">Disconnect</Button>
            </div>
            <Button className="w-full mt-2 bg-accent text-accent-foreground hover:bg-accent/90">
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
            <CardDescription>DMs, comments, and mentions in one stream.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 h-[300px] flex flex-col items-center justify-center text-center bg-muted/30">
              <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Inbox Coming Soon</h3>
              <p className="text-sm text-muted-foreground">
                Connect your accounts to start managing all your social interactions here.
              </p>
            </div>
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
    </div>
  );
}
