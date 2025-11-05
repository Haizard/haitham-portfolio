

"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, X, Banknote, Phone, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Payout, PayoutStatus } from '@/lib/payouts-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { FreelancerProfile } from '@/lib/user-profile-data';

interface EnrichedPayout extends Payout {
  vendorName?: string;
  vendorPhone?: string; 
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export function PayoutListManagement() {
  const [payouts, setPayouts] = useState<EnrichedPayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

  const { toast } = useToast();

  const fetchPayouts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payouts');
      if (!response.ok) throw new Error('Failed to fetch payout requests');
      const data: EnrichedPayout[] = await response.json();
      setPayouts(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const handleInitiatePayout = async (payout: EnrichedPayout) => {
    if (!payout.vendorPhone) {
      toast({ title: "Missing Information", description: "Cannot process payout without a vendor phone number.", variant: "destructive"});
      return;
    }
    setIsUpdating(prev => ({...prev, [payout.id!]: true}));
    try {
        const response = await fetch('/api/payouts/initiate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                payoutId: payout.id,
                phoneNumber: payout.vendorPhone,
                amount: payout.amount,
            }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to initiate payout.');
        
        toast({ title: "Payout Processed", description: data.message || `Payout for ${payout.vendorName} has been processed.` });
        fetchPayouts(); // Refresh the list
    } catch (error: any) {
        toast({ title: "Payout Error", description: error.message, variant: "destructive" });
    } finally {
        setIsUpdating(prev => ({...prev, [payout.id!]: false}));
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
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>All Payout Requests</CardTitle>
        <CardDescription>Review and process vendor withdrawal requests via AzamPay.</CardDescription>
      </CardHeader>
      <CardContent>
        {payouts.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">No payout requests found.</p>
        ) : (
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Payout Phone</TableHead>
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map(payout => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-medium">{payout.vendorName}</TableCell>
                    <TableCell className="text-xs">
                        <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5"/>
                            {payout.vendorPhone || 'Not set'}
                        </div>
                    </TableCell>
                    <TableCell className="text-xs">{format(new Date(payout.requestedAt), "PPP")}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(payout.amount)}</TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(payout.status)} className="capitalize text-xs">{payout.status}</Badge></TableCell>
                    <TableCell className="text-right space-x-1">
                      {isUpdating[payout.id!] ? <Loader2 className="h-5 w-5 animate-spin"/> : (
                         payout.status === 'pending' ? (
                            <>
                                <Button size="sm" onClick={() => handleInitiatePayout(payout)} className="bg-success text-success-foreground hover:bg-success/90"><Send className="mr-1 h-4 w-4" /> Process Payout</Button>
                            </>
                         ) : (
                            <span className="text-xs text-muted-foreground">Processed on {payout.completedAt ? format(new Date(payout.completedAt), "PPP") : 'N/A'}</span>
                         )
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
