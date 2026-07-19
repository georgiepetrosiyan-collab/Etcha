//E/E-backend/utils/autoMessage.js

const ConversationModel = require('../models/conversation');
const MessageModel = require('../models/message');

/**
 * Sends an automated message from `senderId` (the job poster) to `receiverId`
 * (the applicant/referred candidate), creating the conversation if it doesn't
 * already exist — same mechanism as a normal user-sent message, so it shows up
 * in the Messages tab exactly like a real message from the poster.
 */
async function sendAutoMessage(senderId, receiverId, content) {
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
        message: content
    });
    await newMessage.save();

    return { conversation: conversationDoc, message: newMessage };
}

module.exports = { sendAutoMessage };