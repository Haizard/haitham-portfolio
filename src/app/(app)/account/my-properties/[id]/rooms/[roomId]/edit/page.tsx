"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RoomForm, RoomFormValues } from '@/components/hotels/room-form';

export default function EditRoomPage() {
    const router = useRouter();
    const params = useParams();
    const propertyId = params.id as string;
    const roomId = params.roomId as string;
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [roomData, setRoomData] = useState<Partial<RoomFormValues> | null>(null);

    useEffect(() => {
        const fetchRoom = async () => {
            try {
                // The API endpoint for fetching a single room by ID isn't directly exposed as /api/hotels/rooms/[id] based on typical patterns, 
                // but let's check existing routes or assume we might need to use the query param on the list endpoint 
                // or fetch from the single room endpoint if it exists.
                // Looking at the codebase, we only saw POST and GET (list) in /api/hotels/rooms/route.ts.
                // We need to verify if there is a /api/hotels/rooms/[roomId]/route.ts

                // Assuming standard REST pattern:
                const response = await fetch(`/api/hotels/rooms/${roomId}`);
                if (!response.ok) throw new Error('Failed to fetch room details');

                const data = await response.json();
                setRoomData(data.room);
            } catch (error) {
                console.error('Error loading room:', error);
                toast({
                    title: "Error",
                    description: "Failed to load room details",
                    variant: "destructive",
                });
                router.push(`/account/my-properties/${propertyId}/rooms`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoom();
    }, [roomId, propertyId, router, toast]);

    const handleSubmit = async (values: RoomFormValues) => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/hotels/rooms/${roomId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update room');
            }

            toast({ title: "Success", description: "Room updated successfully!" });
            router.push(`/account/my-properties/${propertyId}/rooms`);
        } catch (error: any) {
            console.error(error);
            toast({
                title: "Error",
                description: error.message || "Failed to update room",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold mb-2">Edit Room</h1>
                    <p className="text-muted-foreground">Update room details and pricing.</p>
                </div>
            </div>

            {roomData && (
                <RoomForm
                    defaultValues={roomData}
                    onSubmit={handleSubmit}
                    isLoading={isSaving}
                    propertyId={propertyId}
                />
            )}
        </div>
    );
}
