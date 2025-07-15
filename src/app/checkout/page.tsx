
"use client";

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, ShoppingBag, Phone, Shield } from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { format } from 'date-fns';
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

const checkoutFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("A valid email is required."),
  address: z.string().min(10, "A full shipping address is required."),
});

const phoneFormSchema = z.object({
    phoneNumber: z.string().regex(/^[0-9]{9,12}$/, "Please enter a valid phone number (e.g., 255712345678)."),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
type PhoneFormValues = z.infer<typeof phoneFormSchema>;


export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAwaitingPayment, setIsAwaitingPayment] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const orderType = searchParams.get('orderType');
  const fulfillmentTime = searchParams.get('fulfillmentTime');

  const checkoutForm = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: { name: "", email: "", address: "" },
  });
  
  const phoneForm = useForm<PhoneFormValues>({
      resolver: zodResolver(phoneFormSchema),
      defaultValues: { phoneNumber: "" }
  });


  useEffect(() => {
    if (cartItems.length === 0 && !isProcessing && !isAwaitingPayment) {
      toast({
        title: "Your cart is empty",
        description: "Redirecting you to the store.",
      });
      router.replace('/ecommerce');
    }
  }, [cartItems, isProcessing, isAwaitingPayment, router, toast]);

  const handleOpenPaymentDialog = (values: CheckoutFormValues) => {
    // This function doesn't submit yet, it just opens the payment dialog
    setIsAwaitingPayment(true);
  };

  const handlePlaceOrder = async (phoneValues: PhoneFormValues) => {
    setIsProcessing(true);
    const customerDetails = checkoutForm.getValues();
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerDetails,
          phoneNumber: phoneValues.phoneNumber,
          cart: cartItems.map(item => ({ productId: item.id, quantity: item.quantity, description: item.description })),
          orderType,
          fulfillmentTime,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to place order.");
      
      toast({
          title: "Payment Initiated!",
          description: "Please check your phone to approve the payment and finalize your order."
      });

      // Don't clear cart yet, wait for payment confirmation via callback
      setIsAwaitingPayment(false);
      // Optional: Redirect to an "awaiting payment" page or show a modal
      router.push('/');

    } catch (error: any) {
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-4 text-muted-foreground">Your cart is empty. Redirecting...</p>
        </div>
      );
  }

  const fulfillmentDate = fulfillmentTime ? new Date(fulfillmentTime) : null;
  const isDelivery = orderType === 'delivery';

  return (
    <>
      <div className="container mx-auto py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight font-headline">Checkout</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Finalize your order by providing your details.
          </p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Shipping & Payment Details</CardTitle>
                <CardDescription>
                  Please provide your information to complete the purchase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...checkoutForm}>
                  <form onSubmit={checkoutForm.handleSubmit(handleOpenPaymentDialog)} className="space-y-6">
                    <FormField
                      control={checkoutForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={checkoutForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={checkoutForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{isDelivery ? "Delivery Address" : "Billing Address"}</FormLabel>
                          <FormControl><Input placeholder="123 Main St, Anytown, USA" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                      <Shield className="mr-2 h-5 w-5" /> Proceed to Payment
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                  {orderType && fulfillmentDate ? (
                    `A ${orderType} order for ${format(fulfillmentDate, 'PPP @ p')}`
                  ) : (
                    `You are purchasing ${cartItems.reduce((sum, item) => sum + item.quantity, 0)} item(s).`
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                      <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-contain" />
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      {item.description && <p className="text-xs text-muted-foreground/80 italic">{item.description}</p>}
                    </div>
                    <p className="font-semibold text-sm">${(item.price! * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </CardContent>
              <CardContent>
                  <div className="border-t pt-4 flex justify-between items-center font-bold text-lg">
                      <span>Total</span>
                      <span>${cartTotal.toFixed(2)}</span>
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <AlertDialog open={isAwaitingPayment} onOpenChange={setIsAwaitingPayment}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Payment via AzamPay</AlertDialogTitle>
            <AlertDialogDescription>
              Your order total is <strong>${cartTotal.toFixed(2)}</strong>. Please enter your phone number to receive a payment prompt and finalize your order.
            </AlertDialogDescription>
          </AlertDialogHeader>
           <Form {...phoneForm}>
             <form onSubmit={phoneForm.handleSubmit(handlePlaceOrder)} className="space-y-4">
               <FormField
                control={phoneForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem><FormLabel>Phone Number</FormLabel>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                        <Input placeholder="e.g., 255712345678" className="pl-10" {...field}/>
                    </div>
                    <FormMessage/>
                  </FormItem>
                )}
               />
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setIsAwaitingPayment(false)} disabled={isProcessing}>Cancel</AlertDialogCancel>
                  <Button type="submit" disabled={isProcessing} className="bg-primary hover:bg-primary/90">
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Pay ${cartTotal.toFixed(2)}
                  </Button>
                </AlertDialogFooter>
             </form>
           </Form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
