require('dotenv').config({ path: "./config.env" });

const express = require('express');
const http = require("http");
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// 1. Route Imports (Moved to top for standard module loading and readability)
const UserRoutes = require('./routes/user');
const PostRoutes = require('./routes/post');
const NotificationRoutes = require('./routes/notification');
const CommentRoutes = require('./routes/comment');
const ConversationRoutes = require('./routes/conversation');
const MessageRoutes = require('./routes/message');
const JobRoutes = require('./routes/job'); // Capitalized for consistency

// 2. Database Connection
require('./connection');

// 3. App & Server Initialization
const app = express();
const server = http.createServer(app);

// 4. Environment Variables
const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// 5. Socket.io Configuration
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// 6. Express Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: CLIENT_URL,
    credentials: true
}));

// 7. Socket.io Event Handling
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);
    
    socket.on("joinConversation", (conversationId) => {
        console.log(`User [${socket.id}] joined Conversation ID: ${conversationId}`);
        socket.join(conversationId);
    });
    
    socket.on("sendMessage", (convId, messageDetail) => {
        console.log(`Message sent to Conversation ID: ${convId} by User [${socket.id}]`);
        io.to(convId).emit("receiveMessage", messageDetail);
    });

    socket.on("disconnect", (reason) => {
        console.log(`User Disconnected: ${socket.id} (Reason: ${reason})`);
    });
});

// 8. Express Routing
app.use('/api/auth', UserRoutes);
app.use('/api/post', PostRoutes);
app.use('/api/notification', NotificationRoutes);
app.use('/api/comment', CommentRoutes);
app.use('/api/conversation', ConversationRoutes);
app.use('/api/message', MessageRoutes);
app.use('/api/job', JobRoutes);

// 9. Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

// 10. Start Server
server.listen(PORT, () => {
    console.log(`Backend Server is running on Port ${PORT}`);
    console.log(`Accepting requests from Origin: ${CLIENT_URL}`);
});