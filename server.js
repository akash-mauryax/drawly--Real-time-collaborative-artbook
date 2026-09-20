import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const rooms = {};
const chatMessages = {};
const nextGuestNumbers = {};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', ({ roomId, userId }) => {
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);

        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }
        if (!chatMessages[roomId]) {
            chatMessages[roomId] = [];
        }
        if (!nextGuestNumbers[roomId]) {
            nextGuestNumbers[roomId] = 1;
        }

        const userName = `guest${nextGuestNumbers[roomId]}`;
        nextGuestNumbers[roomId] += 1;
        socket.data.userName = userName;

        socket.emit('initialData', rooms[roomId]);
        socket.emit('chatHistory', chatMessages[roomId]);
        socket.emit('assignedUserName', userName);
    });

    socket.on('draw', (data) => {
        const { roomId } = data;
        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }
        rooms[roomId].push(data);
        socket.to(roomId).emit('draw', data);
    });

    socket.on('clearCanvas', (roomId) => {
        if (rooms[roomId]) {
            rooms[roomId] = [];
        }
        io.to(roomId).emit('clearCanvas');
    });

    socket.on('undoCanvas', (roomId) => {
        if (rooms[roomId] && rooms[roomId].length > 0) {
            rooms[roomId].pop();
            // Send updated data to everyone in the room so they can redraw
            io.to(roomId).emit('initialData', rooms[roomId]);
        }
    });

    socket.on('toolChange', ({ roomId, tool, value }) => {
        socket.to(roomId).emit('toolChange', { tool, value });
    });

    socket.on('sendChatMessage', ({ roomId, userId, message }) => {
        const trimmedMessage = typeof message === 'string' ? message.trim() : '';
        if (!roomId || !trimmedMessage || trimmedMessage.length > 500) {
            return;
        }

        if (!chatMessages[roomId]) {
            chatMessages[roomId] = [];
        }

        const chatMessage = {
            id: `${socket.id}-${Date.now()}`,
            userId,
            userName: socket.data.userName || 'guest',
            message: trimmedMessage,
            timestamp: Date.now()
        };

        chatMessages[roomId].push(chatMessage);
        chatMessages[roomId] = chatMessages[roomId].slice(-100);
        io.to(roomId).emit('chatMessage', chatMessage);
    });

    socket.on('clearChat', (roomId) => {
        if (!roomId) {
            return;
        }

        chatMessages[roomId] = [];
        io.to(roomId).emit('chatCleared');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
