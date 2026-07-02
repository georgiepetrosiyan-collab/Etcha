const PostModel = require('../models/post');

exports.addPost = async (req, res) => {
    try {
        const { desc, imageLink } = req.body;
        const userId = req.user._id;

        if (!desc && !imageLink) {
            return res.status(400).json({ error: "Post must contain either a description or an image" });
        }

        const newPost = new PostModel({ user: userId, desc, imageLink });
        
        // Removed redundant 'if (!newPost)' check since 'new' always returns an object
        await newPost.save();

        return res.status(201).json({ // 201 Created
            message: "Post created successfully",
            post: newPost
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.likeDislikePost = async (req, res) => {
    try {
        const selfId = req.user._id;
        const { postId } = req.body;

        if (!postId) {
            return res.status(400).json({ error: "Post ID is required" });
        }

        // Fetch just the likes array to determine action
        const post = await PostModel.findById(postId).select('likes');

        if (!post) {
            return res.status(404).json({ error: "No such post found" });
        }

        const isLiked = post.likes.some(id => id.equals(selfId));
        
        // Atomic update to prevent race conditions
        const updatedPost = await PostModel.findByIdAndUpdate(
            postId,
            isLiked ? { $pull: { likes: selfId } } : { $addToSet: { likes: selfId } },
            { new: true }
        );

        res.status(200).json({
            message: isLiked ? 'Post unliked' : 'Post liked',
            likes: updatedPost.likes
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getAllPost = async (req, res) => {
    try {
        const posts = await PostModel.find()
            .sort({ createdAt: -1 })
            .populate("user", "-password");

        res.status(200).json({
            message: "Posts fetched successfully",
            post: posts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getPostByPostId = async (req, res) => {
    try {
        const { postId } = req.params;
        const post = await PostModel.findById(postId).populate("user", "-password");

        if (!post) {
            return res.status(404).json({ error: "No such post found" });
        }

        return res.status(200).json({
            message: "Post fetched successfully",
            post: post
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getTop5PostForUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const posts = await PostModel.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate("user", "-password")
            .limit(5);

        return res.status(200).json({
            message: 'Top posts fetched successfully',
            post: posts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getAllPostForUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const posts = await PostModel.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate("user", "-password");

        return res.status(200).json({
            message: 'User posts fetched successfully',
            post: posts
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}