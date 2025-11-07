import { NextRequest } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { Socket } from 'socket.io';
import { addMessageToConversation } from '@/lib/chat-data';
import type { Message as MessageType } from '@/lib/chat-data';
import type { 
  ClientToServerEvents, 
  ServerToClientEvents, 
  InterServerEvents, 
  SocketData 
} from '@/lib/socket-types';

type NextApiResponseServerIO = {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

const SocketHandler = (req: NextRequest, res: any) => {
  if (res.socket.server.io) {
    console.log('Socket.IO server already running');
    res.end();
    return;
  }

  console.log('Initializing Socket.IO server...');
  
  const io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(res.socket.server, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: [
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "http://localhost:3000",
        "http://localhost:9003",
        ...(process.env.NODE_ENV === 'production' ? ["https://*.onrender.com"] : [])
      ],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  res.socket.server.io = io;

  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
    console.log(`Client connected: ${socket.id}`);
    
    socket.on('joinConversation', (conversationId) => {
      if (socket.data.currentConversationId) {
        socket.leave(socket.data.currentConversationId);
        console.log(`Socket ${socket.id} left room ${socket.data.currentConversationId}`);
      }
      socket.join(conversationId);
      socket.data.currentConversationId = conversationId;
      console.log(`Socket ${socket.id} joined room ${conversationId}`);
      socket.emit('conversationJoined', conversationId);
    });

    socket.on('sendMessage', async ({ conversationId, senderId, text }) => {
      console.log(`Message received for conversation ${conversationId} from ${senderId}: ${text}`);
      try {
        const newMessage: MessageType = await addMessageToConversation(conversationId, senderId, text);
        io.to(conversationId).emit('newMessage', newMessage);
        console.log(`Message broadcasted to room ${conversationId}`);
      } catch (error: any) {
        console.error('Error saving or broadcasting message:', error);
        socket.emit('error', { message: `Failed to send message: ${error.message || 'Server error'}` });
      }
    });

    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
      if (socket.data.currentConversationId === conversationId) {
        socket.data.currentConversationId = undefined;
      }
      console.log(`Socket ${socket.id} left room ${conversationId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Client disconnected: ${socket.id}. Reason: ${reason}`);
      if (socket.data.currentConversationId) {
        socket.leave(socket.data.currentConversationId);
        console.log(`Socket ${socket.id} auto-left room ${socket.data.currentConversationId} on disconnect.`);
      }
    });

    socket.on('connect_error', (err) => {
      console.error(`Client connection error on socket ${socket.id}: ${err.message}`);
    });
  });

  console.log('✅ Socket.IO server initialized');
  res.end();
};

export { SocketHandler as GET, SocketHandler as POST };