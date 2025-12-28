import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponseServerIO } from '@/lib/socket-types';
import { addMessageToConversation, Message as MessageType } from '@/lib/chat-data';

export const config = {
    api: {
        bodyParser: false,
    },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
    if (!res.socket.server.io) {
        const path = '/api/socket/io';
        const httpServer: NetServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false,
            cors: {
                origin: "*", // Adjust for production
                methods: ["GET", "POST"],
                credentials: true
            }
        });
        res.socket.server.io = io;

        io.on('connection', (socket) => {
            console.log(`Client connected: ${socket.id}`);

            socket.on('joinConversation', (conversationId) => {
                socket.join(conversationId);
                console.log(`Socket ${socket.id} joined room ${conversationId}`);
                socket.emit('conversationJoined', conversationId);
            });

            socket.on('sendMessage', async ({ conversationId, senderId, text }) => {
                console.log(`Message received for conversation ${conversationId} from ${senderId}: ${text}`);
                try {
                    // We need to fetch the conversation to verify logic or just save it
                    // For now, we assume success and broadcast. 
                    // Ideally, we replicate the logic from the route.ts handler here.
                    const newMessage: MessageType = await addMessageToConversation(conversationId, senderId, text);
                    io.to(conversationId).emit('newMessage', newMessage);
                } catch (error: any) {
                    console.error('Error in socket sendMessage:', error);
                    socket.emit('error', { message: 'Failed to send message' });
                }
            });

            socket.on('leaveConversation', (conversationId) => {
                socket.leave(conversationId);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });
    }

    res.end();
};

export default ioHandler;
