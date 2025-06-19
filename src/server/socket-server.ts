
// src/server/socket-server.ts
// IMPORTANT: This is a TEMPLATE for a basic Socket.IO server.
// You will need to set this up to run MANUALLY.
// This can be done by:
// 1. Creating a custom Next.js server (recommended for better integration).
// 2. Running this as a separate Node.js process.
//
// If running separately, you might need to adjust path aliases or use relative paths
// for imports like '@/lib/chat-data'. For now, using relative paths.

import http from 'http';
import { Server, type Socket } from 'socket.io';
import { addMessageToConversation } from '../lib/chat-data'; // Adjusted path
import type { Message as MessageType } from '../lib/chat-data'; // Adjusted path
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData } from '../lib/socket-types'; // Adjusted path

const PORT = process.env.WEBSOCKET_PORT || 3001;

const httpServer = http.createServer(); // Can be an Express app too

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002", // Your Next.js app URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

console.log(`Socket.IO server initializing on port ${PORT}...`);

io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  console.log(`Client connected: ${socket.id}`);
  // TODO: Authenticate socket connection here and associate with a userId
  // For now, let's assume userId is passed or known, or default
  // socket.data.userId = getUserIdFromAuth(socket.handshake.auth);

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
      
      // Broadcast the new message to all clients in the room (including sender for simplicity here)
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
  console.log(`CORS is configured for origin: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002"}`);
});

// --- How to Run This (Example for separate process) ---
// 1. Save this file as e.g., `socket-server.ts` in a `src/server/` directory.
// 2. You might need `ts-node` or to compile it to JS first: `tsc src/server/socket-server.ts --outDir dist/server`
// 3. Then run: `node dist/server/socket-server.js`
// 4. Ensure your .env has NEXT_PUBLIC_APP_URL set correctly if your Next.js app runs on a different port than 9002 for CORS.
// For custom Next.js server:
// You would typically modify your main server file (e.g. server.js at root)
// to integrate this Socket.IO setup with Next.js's request handler.
// Example:
// const { createServer } = require('http')
// const { parse } = require('url')
// const next = require('next')
// const { Server } = require("socket.io")
//
// const dev = process.env.NODE_ENV !== 'production'
// const app = next({ dev })
// const handle = app.getRequestHandler()
//
// app.prepare().then(() => {
//   const httpServer = createServer((req, res) => {
//     const parsedUrl = parse(req.url, true)
//     handle(req, res, parsedUrl)
//   })
//   const io = new Server(httpServer, { /* options */ })
//   // Your socket.io logic from above goes here, attached to 'io'
//   httpServer.listen(3000, () => { console.log('> Ready on http://localhost:3000') })
// })
// Remember to update your `npm run dev` script to use this custom server.
