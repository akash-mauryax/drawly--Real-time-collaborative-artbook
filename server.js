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

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', ({ roomId, userId }) => {
        socket.join(roomId);
        console.log(`User ${userId} joined room ${roomId}`);

        if (!rooms[roomId]) {
            rooms[roomId] = [];
        }

        socket.emit('initialData', rooms[roomId]);
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

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
