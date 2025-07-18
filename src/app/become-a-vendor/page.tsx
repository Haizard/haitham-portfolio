
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, DollarSign, Store, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function BecomeAVendorPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight font-headline mb-6">
          Sell with <span className="text-primary">CreatorOS</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          Join our curated marketplace and start selling your products to a dedicated community of creators and enthusiasts.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-16">
        <Card className="shadow-lg hover:shadow-xl transition-shadow text-center">
          <CardHeader>
            <Store className="h-10 w-10 text-accent mx-auto mb-3" />
            <CardTitle className="text-2xl">Reach a New Audience</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Tap into our growing community of creators who are actively looking for quality products and tools.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow text-center">
          <CardHeader>
             <DollarSign className="h-10 w-10 text-accent mx-auto mb-3" />
            <CardTitle className="text-2xl">Low Commission Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Keep more of what you earn with our competitive, transparent commission structure. No hidden fees.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow text-center sm:col-span-2 md:col-span-1">
          <CardHeader>
            <TrendingUp className="h-10 w-10 text-accent mx-auto mb-3" />
            <CardTitle className="text-2xl">Powerful Vendor Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              From product management to order tracking, our dashboard gives you the tools you need to succeed.
            </p>
          </CardContent>
        </Card>
      </section>
      
      <Card className="shadow-xl bg-secondary/30 border-primary/20">
        <div className="grid md:grid-cols-2 items-center gap-8">
            <div className="p-8 md:p-12">
                <h2 className="text-3xl font-bold font-headline mb-4">How It Works</h2>
                <ul className="space-y-4 text-muted-foreground">
                    <li className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-primary mt-1 shrink-0"/>
                        <div><strong className="text-foreground">1. Apply to Become a Vendor</strong><br/>Submit a simple application to get started. We review all applications to maintain a high-quality marketplace.</div>
                    </li>
                     <li className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-primary mt-1 shrink-0"/>
                        <div><strong className="text-foreground">2. List Your Products</strong><br/>Use our easy-to-use vendor dashboard to add your products, set prices, and manage inventory.</div>
                    </li>
                     <li className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-primary mt-1 shrink-0"/>
                        <div><strong className="text-foreground">3. Start Selling & Fulfilling Orders</strong><br/>Once your products are live, customers can purchase them. You'll get notified to ship the order.</div>
                    </li>
                     <li className="flex items-start gap-3">
                        <CheckCircle className="h-6 w-6 text-primary mt-1 shrink-0"/>
                        <div><strong className="text-foreground">4. Get Paid Securely</strong><br/>We handle the payment processing. You get paid for your sales on a regular schedule.</div>
                    </li>
                </ul>
            </div>
            <div className="relative h-64 md:h-full w-full overflow-hidden md:rounded-r-lg">
                <Image 
                  src="https://placehold.co/600x600.png" 
                  alt="Vendor Dashboard Illustration" 
                  fill
                  className="object-cover"
                  data-ai-hint="vendor dashboard"
                />
            </div>
        </div>
      </Card>

      <section className="text-center mt-16">
        <h2 className="text-3xl font-bold mb-4 font-headline">Ready to Start Selling?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          The application is quick and easy. Let's get your products in front of the right people.
        </p>
        <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6">
          <Link href="/vendor/products">
            Start Your Application Now
          </Link>
        </Button>
      </section>

    </div>
  );
}
