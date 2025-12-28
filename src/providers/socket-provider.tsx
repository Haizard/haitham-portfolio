"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@/hooks/use-user';
import type {
    ClientToServerEvents,
    ServerToClientEvents
} from '@/lib/socket-types';

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextType {
    socket: SocketType | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<SocketType | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useUser();
    const socketRef = useRef<SocketType | null>(null);

    useEffect(() => {
        // We only connect if a user is logged in
        if (!user) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        const initSocket = async () => {
            // First, initialize the Socket.IO server by calling the API route
            try {
                await fetch('/api/socket/io');
            } catch (err) {
                console.error("Failed to init socket server", err);
            }

            const socketInstance: SocketType = io({
                path: '/api/socket/io',
                addTrailingSlash: false,
            });

            socketInstance.on('connect', () => {
                console.log('Socket.IO Connected (Global):', socketInstance.id);
                setIsConnected(true);
            });

            socketInstance.on('disconnect', () => {
                console.log('Socket.IO Disconnected (Global)');
                setIsConnected(false);
            });

            socketRef.current = socketInstance;
            setSocket(socketInstance);
        };

        if (!socketRef.current) {
            initSocket();
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
