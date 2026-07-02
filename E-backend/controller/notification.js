const NotificationModel = require('../models/notification'); 

exports.getNotification = async (req, res) => {
    try {
        const ownId = req.user._id;
        
        const notifications = await NotificationModel.find({ receiver: ownId })
            .sort({ createdAt: -1 })
            .populate("sender receiver");

        return res.status(200).json({
            message: "Notifications fetched successfully",
            notifications
        });
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.updateRead = async (req, res) => {
    try {
        const { notificationId } = req.body;

        if (!notificationId) {
            return res.status(400).json({ error: "Notification ID is required" });
        }

        const notification = await NotificationModel.findByIdAndUpdate(
            notificationId, 
            { isRead: true },
            { new: true } 
        );

        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }

        return res.status(200).json({
            message: "Notification marked as read",
            notification
        });
    } catch (err) {
        console.error("Error updating notification:", err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.activeNotify = async (req, res) => {
    try {
        const ownId = req.user._id;

        const count = await NotificationModel.countDocuments({ 
            receiver: ownId, 
            isRead: false 
        });

        return res.status(200).json({
            message: "Unread notification count fetched successfully",
            count 
        });
    } catch (err) {
        console.error("Error fetching notification count:", err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};