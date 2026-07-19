//E/E-backend/controller/user.js
const User = require('../models/user');
const bcryptjs = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const NotificationModel = require('../models/notification'); 

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', 
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.loginThroughGmail = async (req, res) => { 
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: "Google token is required" });

        const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;

        let userExist = await User.findOne({ email });
        if (!userExist) {
            userExist = await User.create({ googleId: sub, email, f_name: name, profilePic: picture });
        }

        const jwttoken = jwt.sign({ userId: userExist._id }, process.env.JWT_PRIVATE_KEY, { expiresIn: '7d' });
        res.cookie('token', jwttoken, cookieOptions);
        userExist.password = undefined; 
        return res.status(200).json({ user: userExist });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.register = async (req, res) => {
    try {
        const { email, password, f_name } = req.body;
        if (!email || !password || !f_name) return res.status(400).json({ error: "All fields are required" });

        const isUserExist = await User.findOne({ email });
        if (isUserExist) return res.status(400).json({ error: "Already have an account with this email. Please try another email" });

        const hashedPassword = await bcryptjs.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, f_name }); 
        await newUser.save();
        newUser.password = undefined; 

        return res.status(201).json({ message: 'User registered successfully', success: true, data: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

        const userExist = await User.findOne({ email });
        if (!userExist) return res.status(400).json({ error: 'Invalid credentials' });
        if (!userExist.password) return res.status(400).json({ error: 'Please login through Google' });

        const isMatch = await bcryptjs.compare(password, userExist.password);
        if (isMatch) {
            const jwttoken = jwt.sign({ userId: userExist._id }, process.env.JWT_PRIVATE_KEY, { expiresIn: '7d' }); 
            res.cookie('token', jwttoken, cookieOptions);
            userExist.password = undefined; 
            return res.status(200).json({ message: "Logged in successfully", success: true, user: userExist });
        } else {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.updateUser = async (req, res) => {
    try {
        const { user } = req.body;
        if (!user) return res.status(400).json({ error: 'User update data is required' });

const allowedUpdates = {
            f_name: user.f_name,
            headline: user.headline,
            curr_company: user.curr_company,
            curr_location: user.curr_location,
            profilePic: user.profilePic,
            cover_pic: user.cover_pic,
            about: user.about,
            skills: user.skills,
            experience: user.experience,
            education: user.education,
            projects: user.projects,
            certifications: user.certifications,
            phone: user.phone,
            payoutEmail: user.payoutEmail,
            payoutCardHolder: user.payoutCardHolder,
        };
        // Never persist a full card number — only keep the last 4 digits.
        if (typeof user.payoutCardNumber === 'string' && user.payoutCardNumber.trim().length > 0) {
            const digitsOnly = user.payoutCardNumber.replace(/\D/g, '');
            allowedUpdates.payoutCardLast4 = digitsOnly.slice(-4);
        }

        Object.keys(allowedUpdates).forEach(key => allowedUpdates[key] === undefined && delete allowedUpdates[key]);

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id, { $set: allowedUpdates }, { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) return res.status(404).json({ error: 'User does not exist' });

        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getProfileById = async (req, res) => {
    try {
        const { id } = req.params;
        const isExist = await User.findById(id).select('-password');
        if (!isExist) return res.status(404).json({ error: "No such user exists" });
        return res.status(200).json({ message: "User fetched successfully", user: isExist });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.logout = async (req, res) => {
    res.clearCookie('token', cookieOptions).json({ message: 'Logged out successfully' });
}

exports.deleteAccount = async (req, res) => {
    try {
        const selfId = req.user._id;

        // Remove this user from everyone else's friends/pending lists
        await User.updateMany(
            { $or: [{ friends: selfId }, { pending_friends: selfId }] },
            { $pull: { friends: selfId, pending_friends: selfId } }
        );

        await User.findByIdAndDelete(selfId);

        res.clearCookie('token', cookieOptions).status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.findUser = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.status(400).json({ error: "Search query is required" });

        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const users = await User.find({
            $and: [
                { _id: { $ne: req.user._id } },
                { $or: [
                    { f_name: { $regex: new RegExp(`^${escapedQuery}`, "i") } },
                    { email: { $regex: new RegExp(`^${escapedQuery}`, "i") } }
                ] }
            ]
        }).select('-password'); 

        return res.status(200).json({ message: "Fetched Members", users: users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.sendFriendRequest = async (req, res) => {
    try {
        const sender = req.user._id;
        const receiverId = req.body.receiver || req.body.reciever; 
        if (!receiverId) return res.status(400).json({ error: "Receiver ID is required" });
        if (sender.toString() === receiverId.toString()) return res.status(400).json({ error: "Cannot send a friend request to yourself" });

        const userExist = await User.findById(receiverId);
        if (!userExist) return res.status(404).json({ error: "No such user exists." });
        
        const isAlreadyFriend = userExist.friends.some(id => id.toString() === sender.toString());
        if (isAlreadyFriend) return res.status(400).json({ error: "Already Friends" });

        const isRequestPending = userExist.pending_friends.some(id => id.toString() === sender.toString());
        if (isRequestPending) return res.status(400).json({ error: "Request Already Sent" });

        await User.findByIdAndUpdate(receiverId, { $addToSet: { pending_friends: sender } });

        const content = `${req.user.f_name} has sent you a friend request`;
        const notification = new NotificationModel({ sender, receiver: receiverId, content, type: "friendRequest" });
        await notification.save();

        res.status(200).json({ message: "Friend Request Sent" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.acceptFriendRequest = async (req, res) => {
    try {
        const { friendId } = req.body;
        const selfId = req.user._id;
        if (!friendId) return res.status(400).json({ error: "Friend ID is required" });

        const friendData = await User.findById(friendId);
        if (!friendData) return res.status(404).json({ error: "No such user exists." });
        
        const hasPendingRequest = req.user.pending_friends.some(id => id.toString() === friendId.toString());
        if (!hasPendingRequest) return res.status(400).json({ error: "No friend request found from this user" });

        const isAlreadyFriend = req.user.friends.some(id => id.toString() === friendId.toString());
        if (isAlreadyFriend) return res.status(400).json({ error: "Already friends with this user" });

        await User.findByIdAndUpdate(selfId, { $pull: { pending_friends: friendId }, $addToSet: { friends: friendId } });
        await User.findByIdAndUpdate(friendId, { $addToSet: { friends: selfId } });

        const content = `${req.user.f_name} has accepted your friend request`;
        const notification = new NotificationModel({ sender: selfId, receiver: friendId, content, type: "friendRequest" });
        await notification.save();

        return res.status(200).json({ message: "You are both connected now." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.ignoreFriendRequest = async (req, res) => {
    try {
        const { friendId } = req.body;
        const selfId = req.user._id;
        if (!friendId) return res.status(400).json({ error: "Friend ID is required" });

        const hasPendingRequest = req.user.pending_friends.some(id => id.toString() === friendId.toString());
        if (!hasPendingRequest) return res.status(400).json({ error: "No friend request found from this user" });

        await User.findByIdAndUpdate(selfId, { $pull: { pending_friends: friendId } });
        return res.status(200).json({ message: "Friend request ignored" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getFriendsList = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('friends', '-password');
        return res.status(200).json({ friends: user.friends });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getPendingFriendList = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('pending_friends', '-password');
        return res.status(200).json({ pendingFriendsList: user.pending_friends });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.removeFromFriend = async (req, res) => {
    try {
        const selfId = req.user._id;
        const { friendId } = req.params;
        if (!friendId) return res.status(400).json({ error: "Friend ID is required" });

        const friendData = await User.findById(friendId);
        if (!friendData) return res.status(404).json({ error: "No such user exists" });

        const isFriend = req.user.friends.some(id => id.toString() === friendId.toString());
        if (!isFriend) return res.status(400).json({ error: "You are not friends with this user" });

        await User.findByIdAndUpdate(selfId, { $pull: { friends: friendId } });
        await User.findByIdAndUpdate(friendId, { $pull: { friends: selfId } });

        return res.status(200).json({ message: "You are both disconnected now." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}