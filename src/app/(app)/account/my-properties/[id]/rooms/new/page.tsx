"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RoomForm, RoomFormValues } from '@/components/hotels/room-form';

export default function AddRoomPage() {
    const router = useRouter();
    const params = useParams();
    const propertyId = params.id as string;
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (values: RoomFormValues) => {
        setIsSaving(true);
        try {
            const payload = {
                ...values,
                propertyId,
            };

            const response = await fetch('/api/hotels/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create room');
            }

            toast({ title: "Success", description: "Room created successfully!" });
            router.push(`/account/my-properties/${propertyId}/rooms`);
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.message || "Failed to create room",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold mb-2">Add New Room</h1>
                    <p className="text-muted-foreground">Define a new room type for your property.</p>
                </div>
            </div>

            <RoomForm
                onSubmit={handleSubmit}
                isLoading={isSaving}
                propertyId={propertyId}
            />
        </div>
    );
}
