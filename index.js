require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    maxHttpBufferSize: 5e6 // 🔥 Increased limit to 5MB so large images can pass through sockets!
});

app.use(express.static(__dirname));

// ---------------- MONGOOSE DATABASE SETUP ----------------
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log('🍃 Connected to live MongoDB Atlas production cluster!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, 
    text: { type: String, default: '' }, // Optional if sending just an image
    imageUrl: { type: String, default: null }, // 🔥 NEW: Stores the Base64 image
    time: { type: String, required: true },
    deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Message = mongoose.model('Message', MessageSchema);

// ---------------- REALTIME SOCKET CONTROLLER ----------------
const onlineUsers = {};

io.on('connection', (socket) => {
    console.log(`⚡ Connected socket block instance: ${socket.id}`);

    socket.on('auth-signup', async (data) => {
        try {
            const { username, email, password } = data;
            const existingUser = await User.findOne({ $or: [{ email }, { username }] });
            if (existingUser) return socket.emit('auth-error', 'Username or Email already registered.');

            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new User({ username, email, password: hashedPassword });
            await newUser.save();

            onlineUsers[socket.id] = {
                dbId: newUser._id.toString(),
                username: newUser.username,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.username}`
            };

            socket.emit('auth-success', { _id: newUser._id, username: newUser.username, email: newUser.email });
            io.emit('update-user-list', Object.values(onlineUsers));
        } catch (err) {
            socket.emit('auth-error', 'Server error during signup compilation step.');
        }
    });

    socket.on('auth-login', async (data) => {
        try {
            const { email, password } = data;
            const user = await User.findOne({ email });
            if (!user) return socket.emit('auth-error', 'Account email variant not found.');

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return socket.emit('auth-error', 'Invalid security credentials.');

            onlineUsers[socket.id] = {
                dbId: user._id.toString(),
                username: user.username,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
            };

            socket.emit('auth-success', { _id: user._id, username: user.username, email: user.email });
            io.emit('update-user-list', Object.values(onlineUsers));
        } catch (err) {
            socket.emit('auth-error', 'Server error encountered during authentication phase.');
        }
    });

    socket.on('get-chat-history', async (data) => {
        const currentUser = onlineUsers[socket.id];
        if (!currentUser) return;

        try {
            if (data.chatType === 'group') {
                const history = await Message.find({ 
                    recipient: null,
                    deletedFor: { $ne: currentUser.dbId }
                }).sort({ createdAt: 1 }).limit(100);
                socket.emit('load-history', history);
            } else {
                const history = await Message.find({
                    $or: [
                        { sender: currentUser.dbId, recipient: data.targetDbId },
                        { sender: data.targetDbId, recipient: currentUser.dbId }
                    ],
                    deletedFor: { $ne: currentUser.dbId }
                }).sort({ createdAt: 1 }).limit(100);
                socket.emit('load-history', history);
            }
        } catch (err) {
            console.error('Error fetching chat history logs:', err);
        }
    });

    socket.on('send-group-msg', async (data) => {
        const sender = onlineUsers[socket.id];
        if (!sender) return;
        try {
            const newMsg = new Message({
                sender: sender.dbId,
                senderName: sender.username,
                recipient: null,
                text: data.text,
                imageUrl: data.imageUrl, // 🔥 NEW
                time: data.time
            });
            const savedMsg = await newMsg.save();
            io.emit('receive-group-msg', savedMsg);
        } catch (err) { console.error(err); }
    });

    socket.on('send-private-msg', async (data) => {
        const sender = onlineUsers[socket.id];
        if (!sender) return;
        try {
            const newMsg = new Message({
                sender: sender.dbId,
                senderName: sender.username,
                recipient: data.targetDbId,
                text: data.text,
                imageUrl: data.imageUrl, // 🔥 NEW
                time: data.time
            });
            const savedMsg = await newMsg.save();

            const targetSocketId = Object.keys(onlineUsers).find(key => onlineUsers[key].dbId === data.targetDbId);
            socket.emit('receive-private-msg', savedMsg);
            if (targetSocketId) {
                socket.to(targetSocketId).emit('receive-private-msg', savedMsg);
            }
        } catch (err) { console.error(err); }
    });

    socket.on('delete-msg-everyone', async (msgId) => {
        const sender = onlineUsers[socket.id];
        if (!sender) return;
        try {
            const msg = await Message.findById(msgId);
            if (msg && msg.sender.toString() === sender.dbId) {
                await Message.findByIdAndDelete(msgId);
                io.emit('message-deleted', msgId);
            }
        } catch (err) {
            console.error("Error deleting message for everyone:", err);
        }
    });

    socket.on('delete-msg-for-me', async (msgId) => {
        const user = onlineUsers[socket.id];
        if (!user) return;
        try {
            await Message.findByIdAndUpdate(msgId, {
                $addToSet: { deletedFor: user.dbId }
            });
            socket.emit('message-deleted', msgId);
        } catch (err) {
            console.error("Error deleting message for me:", err);
        }
    });

    socket.on('disconnect', () => {
        delete onlineUsers[socket.id];
        io.emit('update-user-list', Object.values(onlineUsers));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Live Atlas Secure WhatsApp Server online at http://localhost:${PORT}`);
});