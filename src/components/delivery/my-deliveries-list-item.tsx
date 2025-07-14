
"use client";

import { useState } from 'react';
import type { Delivery, DeliveryStatus } from '@/lib/deliveries-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pin, Flag, DollarSign, User, CheckCircle, Loader2, Truck, PackageCheck, Ban } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

interface MyDeliveryListItemProps {
  delivery: Delivery;
  onDeliveryUpdate: () => void;
}

const statusUpdateMap: Partial<Record<DeliveryStatus, { nextStatus: DeliveryStatus; buttonText: string; icon: React.ElementType }>> = {
    'accepted': { nextStatus: 'in_transit', buttonText: 'Mark as Picked Up', icon: Truck },
    'in_transit': { nextStatus: 'delivered', buttonText: 'Mark as Delivered', icon: PackageCheck },
};

const getStatusInfo = (status: DeliveryStatus): { variant: "default" | "secondary" | "outline" | "destructive"; text: string } => {
    switch(status) {
        case 'accepted': return { variant: 'default', text: 'Accepted' };
        case 'in_transit': return { variant: 'default', text: 'In Transit' };
        case 'delivered': return { variant: 'outline', text: 'Delivered' };
        case 'cancelled': return { variant: 'destructive', text: 'Cancelled' };
        default: return { variant: 'secondary', text: 'Pending' };
    }
}

export function MyDeliveryListItem({ delivery, onDeliveryUpdate }: MyDeliveryListItemProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const { toast } = useToast();

    const updateAction = statusUpdateMap[delivery.status];

    const handleUpdateStatus = async () => {
        if (!updateAction) return;

        setIsUpdating(true);
        try {
            const response = await fetch(`/api/deliveries/${delivery.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: updateAction.nextStatus }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update delivery status.');
            }
            toast({
                title: "Status Updated!",
                description: `Delivery is now marked as ${updateAction.nextStatus}.`,
            });
            onDeliveryUpdate();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = async () => {
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/deliveries/${delivery.id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'cancelled' }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to cancel delivery.');
            toast({ title: "Delivery Cancelled", description: "The delivery task has been cancelled.", variant: "destructive" });
            onDeliveryUpdate();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsUpdating(false);
        }
    }
    
    const statusInfo = getStatusInfo(delivery.status);

  return (
    <Card className="shadow-sm flex flex-col group">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">
            Delivery to {delivery.customerName}
            </CardTitle>
            <Badge variant={statusInfo.variant} className="capitalize text-xs">{statusInfo.text}</Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
            Order #{delivery.orderId.substring(0, 8).toUpperCase()}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm">
        <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
            <Pin className="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0"/>
            <div>
                <p className="font-semibold text-xs">PICKUP</p>
                <p className="text-muted-foreground">{delivery.pickupAddress}</p>
            </div>
        </div>
         <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
            <Flag className="h-5 w-5 mt-0.5 text-green-600 flex-shrink-0"/>
            <div>
                <p className="font-semibold text-xs">DELIVER TO</p>
                <p className="text-muted-foreground">{delivery.deliveryAddress}</p>
            </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center border-t pt-4 gap-2">
        <div className="flex items-center gap-1.5 font-bold text-lg text-green-600">
            <DollarSign className="h-5 w-5"/>
            <span>${delivery.agentPayout.toFixed(2)}</span>
            <span className="text-xs text-muted-foreground font-normal">(Payout)</span>
        </div>
        <div className="flex gap-2">
        {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
            <Button variant="destructive" size="sm" onClick={handleCancel} disabled={isUpdating}>
                <Ban className="mr-2 h-4 w-4"/> Cancel
            </Button>
        )}
        {updateAction && (
             <Button onClick={handleUpdateStatus} disabled={isUpdating} size="sm">
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <updateAction.icon className="mr-2 h-4 w-4"/>}
                {updateAction.buttonText}
            </Button>
        )}
        {delivery.status === 'delivered' && <Badge variant="outline" className="text-green-600 border-green-600">Completed</Badge>}
        </div>
      </CardFooter>
    </Card>
  );
}
