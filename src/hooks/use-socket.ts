"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents
} from '@/lib/socket-types';

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

export function useSocket() {
  const socketRef = useRef<SocketType | null>(null);

  useEffect(() => {
    // Initialize socket connection
    const initSocket = async () => {
      // First, initialize the Socket.IO server by calling the API route
      await fetch('/api/socket/io');

      // Then connect to the socket
      const socket: SocketType = io({
        path: '/api/socket/io',
        addTrailingSlash: false,
      });

      socket.on('connect', () => {
        console.log('Connected to Socket.IO server:', socket.id);
      });

      socket.on('disconnect', (reason) => {
        console.log('Disconnected from Socket.IO server:', reason);
      });

      socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error);
      });

      socketRef.current = socket;
    };

    initSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return socketRef.current;
}