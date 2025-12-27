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

            let data;
            try {
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch {
                    // Not JSON, probably HTML error page
                    console.error("Received non-JSON response:", text);
                    throw new Error(`Server returned ${response.status} ${response.statusText}`);
                }
            } catch (e: any) {
                throw new Error(e.message || 'Failed to read response');
            }

            if (!response.ok) {
                console.error("Server validation errors:", data);
                let errorMessage = data.message || 'Failed to create room';
                if (data.errors && Array.isArray(data.errors)) {
                    const details = data.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
                    errorMessage += ` - ${details}`;
                }
                throw new Error(errorMessage);
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
