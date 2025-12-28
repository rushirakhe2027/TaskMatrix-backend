require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmatrix';

// Create HTTP Server
const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
    }
});

// Socket.IO Event Handlers
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_project', (projectId) => {
        socket.join(`project_${projectId}`);
        console.log(`User join project room: project_${projectId}`);
    });

    socket.on('leave_project', (projectId) => {
        socket.leave(`project_${projectId}`);
    });

    socket.on('task_update', (data) => {
        // Broadcast to others in the project room
        socket.to(`project_${data.projectId}`).emit('task_updated', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Export IO for use in controllers
global.io = io;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
