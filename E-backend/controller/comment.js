const mongoose = require('mongoose');
const CommentModel = require('../models/comment');
const PostModel = require('../models/post');
const NotificationModel = require('../models/notification');

exports.commentPost = async (req, res) => {
    try {
        const { postId, comment } = req.body;
        const userId = req.user._id;

        if (!comment || comment.trim().length === 0) {
            return res.status(400).json({ error: "Comment text is required" });
        }

        // Validate ObjectId to prevent Mongoose CastErrors
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ error: "Invalid post ID format" });
        }

        // Use $inc for atomic updates to prevent race conditions when multiple users comment at once
        const postExist = await PostModel.findByIdAndUpdate(
            postId,
            { $inc: { comments: 1 } },
            { new: true }
        ).populate("user");

        if (!postExist) {
            return res.status(404).json({ error: "No such post found" });
        }

        const newComment = new CommentModel({ user: userId, post: postId, comment });
        await newComment.save();

        const populatedComment = await CommentModel.findById(newComment._id)
            .populate('user', 'f_name headline profilePic');

        // Prevent sending a notification if a user comments on their own post
        if (postExist.user._id.toString() !== userId.toString()) {
            const content = `${req.user.f_name} has commented on your Post`;
            
            const notification = new NotificationModel({
                sender: userId,
                receiver: postExist.user._id,
                content,
                type: 'comment',
                postId: postId.toString()
            });
            await notification.save();
        }

        return res.status(201).json({
            message: "Commented Successfully",
            comment: populatedComment
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.getCommentByPostId = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ error: "Invalid post ID format" });
        }

        const isPostExist = await PostModel.findById(postId);

        if (!isPostExist) {
            return res.status(404).json({ error: "No such post found" });
        }

        const comments = await CommentModel.find({ post: postId })
            .sort({ createdAt: -1 })
            .populate("user", "f_name headline profilePic");

        return res.status(200).json({
            message: "Comments fetched successfully",
            comments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};