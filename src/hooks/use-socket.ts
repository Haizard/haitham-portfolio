"use client";

import { useSocket as useSocketFromProvider } from '@/providers/socket-provider';

/**
 * Proxy hook that uses the global Socket context.
 * This replaces the previous implementation that created a new socket per component.
 */
export function useSocket() {
  const { socket } = useSocketFromProvider();
  return socket;
}