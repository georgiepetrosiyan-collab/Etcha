//E/E-backend/index.js

require('dotenv').config({ path: "./config.env" });

const express = require('express');
const http = require("http");
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const UserRoutes = require('./routes/user');
const PostRoutes = require('./routes/post');
const NotificationRoutes = require('./routes/notification');
const CommentRoutes = require('./routes/comment');
const ConversationRoutes = require('./routes/conversation');
const MessageRoutes = require('./routes/message');
const JobRoutes = require('./routes/job');
const CVRoutes = require('./routes/cv');
const ReferralRoutes = require('./routes/referral');

require('./connection');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
    cors: { origin: CLIENT_URL, methods: ['GET', 'POST'], credentials: true }
});

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: CLIENT_URL, credentials: true }));

io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);
    socket.on("joinConversation", (conversationId) => {
        socket.join(conversationId);
    });
    socket.on("sendMessage", (convId, messageDetail) => {
        io.to(convId).emit("receiveMessage", messageDetail);
    });
    socket.on("disconnect", (reason) => {
        console.log(`User Disconnected: ${socket.id} (Reason: ${reason})`);
    });
});

app.use('/api/auth', UserRoutes);
app.use('/api/post', PostRoutes);
app.use('/api/notification', NotificationRoutes);
app.use('/api/comment', CommentRoutes);
app.use('/api/conversation', ConversationRoutes);
app.use('/api/message', MessageRoutes);
app.use('/api/job', JobRoutes);
app.use('/api/cv', CVRoutes);
app.use('/api/referral', ReferralRoutes);

app.use((err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    res.status(err.status || 500).json({ success: false, message: err.message || "Internal Server Error" });
});

server.listen(PORT, () => {
    console.log(`Backend Server is running on Port ${PORT}`);
    console.log(`Accepting requests from Origin: ${CLIENT_URL}`);
});