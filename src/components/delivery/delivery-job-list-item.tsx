
"use client";

import { useState } from 'react';
import type { Delivery } from '@/lib/deliveries-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pin, Flag, DollarSign, User, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';

interface DeliveryJobListItemProps {
  delivery: Delivery;
  onJobAccepted: () => void;
}

export function DeliveryJobListItem({ delivery, onJobAccepted }: DeliveryJobListItemProps) {
    const [isAccepting, setIsAccepting] = useState(false);
    const { toast } = useToast();
    const { user } = useUser();
    
    const handleAccept = async () => {
        if (!user) {
            toast({ title: "Error", description: "You must be logged in to accept a job.", variant: "destructive" });
            return;
        }
        setIsAccepting(true);
        try {
            const response = await fetch(`/api/deliveries/${delivery.id}/accept`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId: user.id }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to accept delivery job.');
            }
            toast({
                title: "Job Accepted!",
                description: "The delivery task has been assigned to you. See 'My Deliveries' for details.",
            });
            onJobAccepted(); // Refresh the list of available jobs
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsAccepting(false);
        }
    };

  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow flex flex-col group">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Delivery for Order #{delivery.orderId.substring(0, 8).toUpperCase()}
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-sm">
            <User className="h-4 w-4"/> To: {delivery.customerName}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm">
        <div className="flex items-start gap-3">
            <Pin className="h-5 w-5 mt-0.5 text-blue-500"/>
            <div>
                <p className="font-semibold">Pickup From</p>
                <p className="text-muted-foreground">{delivery.pickupAddress}</p>
            </div>
        </div>
         <div className="flex items-start gap-3">
            <Flag className="h-5 w-5 mt-0.5 text-green-600"/>
            <div>
                <p className="font-semibold">Deliver To</p>
                <p className="text-muted-foreground">{delivery.deliveryAddress}</p>
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-4">
        <div className="flex items-center gap-1.5 font-bold text-lg text-green-600">
            <DollarSign className="h-5 w-5"/>
            <span>${delivery.agentPayout.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground font-normal">(Payout)</span>
        </div>
        <Button onClick={handleAccept} disabled={isAccepting}>
            {isAccepting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <CheckCircle className="mr-2 h-4 w-4"/>}
            {isAccepting ? "Accepting..." : "Accept Job"}
        </Button>
      </CardFooter>
    </Card>
  );
}
