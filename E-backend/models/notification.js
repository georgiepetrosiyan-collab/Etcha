//E/E-backend/models/notification.js

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['friendRequest', 'comment', 'jobReferral']
    },
    isRead: {
        type: Boolean,
        default: false
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'job'
    }
}, { timestamps: true });

const NotificationModel = mongoose.model('notification', NotificationSchema);
module.exports = NotificationModel;