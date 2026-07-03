//E/E-backend/controller/message.js
const MessageModel = require('../models/message');

exports.getMessages = async (req, res) => {
    try {
        const { convId } = req.params;

        if (!convId) {
            return res.status(400).json({ error: "Conversation ID is required" });
        }

        const messages = await MessageModel.find({ conversation: convId })
            .populate("sender", "f_name headline profilePic")
            .sort({ createdAt: 1 }); 

        return res.status(200).json({
            message: "Messages fetched successfully",
            messages
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { conversation, message, picture } = req.body;
        const senderId = req.user._id;

        if (!conversation) {
            return res.status(400).json({ error: "Conversation ID is required" });
        }

        if (!message && !picture) {
            return res.status(400).json({ error: "Cannot send an empty message" });
        }

        const newMessage = new MessageModel({
            conversation,
            sender: senderId,
            message,
            picture
        });

        await newMessage.save();

        const populatedMessage = await newMessage.populate("sender", "f_name headline profilePic");

        return res.status(201).json({
            message: "Message sent successfully",
            data: populatedMessage
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};