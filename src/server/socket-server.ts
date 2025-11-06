
import 'dotenv/config'; // Load environment variables
import http from 'http';
import { Server, type Socket } from 'socket.io';
import { addMessageToConversation } from '../lib/chat-data'; 
import type { Message as MessageType } from '../lib/chat-data'; 
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '../lib/socket-types'; 

const PORT = parseInt(process.env.WEBSOCKET_PORT || process.env.PORT || '3002', 10);

const httpServer = http.createServer(); 

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
  cors: {
    origin: [
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9003",
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3001",
      "https://*.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

console.log(`Socket.IO server initializing on port ${PORT}...`);

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
    socket.emit('conversationJoined', conversationId); // Acknowledge join
  });

  socket.on('sendMessage', async ({ conversationId, senderId, text }) => {
    console.log(`Message received for conversation ${conversationId} from ${senderId}: ${text}`);
    try {
      // Save message to DB (this function already updates conversation's last message)
      const newMessage: MessageType = await addMessageToConversation(conversationId, senderId, text);
      
      // Broadcast the new message to all clients in the room (including sender)
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

httpServer.listen(PORT, () => {
  console.log(`✅ WebSocket Server is listening on port ${PORT}`);
  console.log(`Ensure your Next.js app (NEXT_PUBLIC_WEBSOCKET_URL) points to this address if run separately.`);
  console.log(`CORS is configured for origin: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9003"}`);
});


