//E/E-backend/controller/conversation.js
const ConversationModel = require('../models/conversation');
const MessageModel = require('../models/message');

exports.addConversation = async (req, res) => {
    try {
        const senderId = req.user._id;
        const receiverId = req.body.receiverId || req.body.recieverId; 
        const { message } = req.body;

        if (!receiverId || !message) {
            return res.status(400).json({ error: "Receiver ID and message are required" });
        }

        let conversationDoc = await ConversationModel.findOne({
            members: { $all: [senderId, receiverId] }
        });

        if (!conversationDoc) {
            conversationDoc = new ConversationModel({
                members: [senderId, receiverId]
            });
            await conversationDoc.save();
        }

        const newMessage = new MessageModel({ 
            sender: senderId, 
            conversation: conversationDoc._id, 
            message 
        });
        await newMessage.save();

        const populatedMessage = await newMessage.populate("sender", "f_name headline profilePic");

        return res.status(201).json({ 
            message: "Message Sent",
            data: populatedMessage 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.getConversation = async (req, res) => {
    try {
        const loggedinId = req.user._id;
        
        const conversations = await ConversationModel.find({
            members: { $in: [loggedinId] }
        }).populate("members", "-password").sort({ createdAt: -1 });
        
        return res.status(200).json({
            message: "Fetched successfully",
            conversations
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};