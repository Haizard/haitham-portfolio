
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, CircleDollarSign, Banknote, History, Wallet, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Payout, VendorFinanceSummary, PayoutStatus } from '@/lib/payouts-data';
import { format } from 'date-fns';
import { useUser } from '@/hooks/use-user';

const payoutRequestSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero."),
});

type PayoutRequestFormValues = z.infer<typeof payoutRequestSchema>;

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export function VendorFinanceDashboard() {
  const [summary, setSummary] = useState<VendorFinanceSummary | null>(null);
  const [history, setHistory] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<PayoutRequestFormValues>({
    resolver: zodResolver(payoutRequestSchema),
    defaultValues: { amount: undefined },
  });

  const fetchFinancialData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/payouts?vendorId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch financial data');
      const data = await response.json();
      setSummary(data.summary);
      setHistory(data.history);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Could not load financial data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  const handleRequestPayout = async (values: PayoutRequestFormValues) => {
    setIsRequesting(true);
    try {
      const response = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: values.amount }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Payout request failed.');
      
      toast({ title: "Payout Requested", description: `Your request for ${formatCurrency(values.amount)} has been submitted.` });
      form.reset();
      fetchFinancialData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusBadgeVariant = (status: PayoutStatus): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "pending": return "secondary";
      case "completed": return "default";
      case "failed": return "destructive";
      default: return "outline";
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
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Earnings</CardTitle><CircleDollarSign className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(summary?.totalEarnings || 0)}</div><p className="text-xs text-muted-foreground">From all delivered orders</p></CardContent></Card>
        <Card className="shadow-lg"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Paid Out</CardTitle><Banknote className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(summary?.totalPaidOut || 0)}</div><p className="text-xs text-muted-foreground">Successfully withdrawn</p></CardContent></Card>
        <Card className="shadow-lg"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pending Payouts</CardTitle><History className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(summary?.pendingPayouts || 0)}</div><p className="text-xs text-muted-foreground">Currently processing</p></CardContent></Card>
        <Card className="shadow-lg bg-primary/10 border-primary"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Available Balance</CardTitle><Wallet className="h-4 w-4 text-primary"/></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{formatCurrency(summary?.availableBalance || 0)}</div><p className="text-xs text-primary/80">Ready for withdrawal</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payout Request Card */}
        <Card className="shadow-xl lg:col-span-1">
            <CardHeader><CardTitle>Request a Payout</CardTitle><CardDescription>Withdraw funds from your available balance.</CardDescription></CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleRequestPayout)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-muted-foreground sm:text-sm">$</span></div>
                                        <Input type="number" step="0.01" placeholder="0.00" className="pl-7" {...field} />
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button 
                            type="submit" 
                            className="w-full bg-primary hover:bg-primary/90"
                            disabled={isRequesting || (summary?.availableBalance || 0) <= 0}
                        >
                            {isRequesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Send className="mr-2 h-4 w-4" />}
                            Request Withdrawal
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        {/* Payout History Table */}
        <Card className="shadow-xl lg:col-span-2">
            <CardHeader><CardTitle>Payout History</CardTitle><CardDescription>A record of your past and pending payouts.</CardDescription></CardHeader>
            <CardContent>
                 {history.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No payout history found.</p>
                ) : (
                    <div className="border rounded-lg overflow-x-auto max-h-96">
                        <Table>
                            <TableHeader className="sticky top-0 bg-card">
                                <TableRow>
                                    <TableHead>Requested Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Completed Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {history.map(payout => (
                                <TableRow key={payout.id}>
                                    <TableCell className="text-xs">{format(new Date(payout.requestedAt), "PPP p")}</TableCell>
                                    <TableCell className="font-medium">{formatCurrency(payout.amount)}</TableCell>
                                    <TableCell><Badge variant={getStatusBadgeVariant(payout.status)} className="capitalize text-xs">{payout.status}</Badge></TableCell>
                                    <TableCell className="text-xs">{payout.completedAt ? format(new Date(payout.completedAt), "PPP") : '-'}</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
