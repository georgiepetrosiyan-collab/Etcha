const User = require('../models/user');
const bcryptjs = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const NotificationModel = require('../models/notification'); // Renamed from Modal

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Dynamically sets to true only in prod
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.loginThroughGmail = async (req, res) => { // Fixed typo: Throgh -> Through
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ error: "Google token is required" });
        }

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();

        const { sub, email, name, picture } = payload;

        let userExist = await User.findOne({ email });

        if (!userExist) {
            userExist = await User.create({
                googleId: sub, 
                email,
                f_name: name,
                profilePic: picture,
            });
        }

        // Added expiration to JWT
        const jwttoken = jwt.sign({ userId: userExist._id }, process.env.JWT_PRIVATE_KEY, { expiresIn: '7d' });
        
        res.cookie('token', jwttoken, cookieOptions);
        
        // Ensure we don't send the password back if it's a previously registered user
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

        if (!email || !password || !f_name) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const isUserExist = await User.findOne({ email });
        if (isUserExist) {
            return res.status(400).json({ error: "Already have an account with this email. Please try another email" });
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const newUser = new User({ email, password: hashedPassword, f_name }); 
        await newUser.save();

        newUser.password = undefined; // Prevent sending password back

        return res.status(201).json({ 
            message: 'User registered successfully', 
            success: true, 
            data: newUser 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        const userExist = await User.findOne({ email });

        if (!userExist) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        if (!userExist.password) {
            return res.status(400).json({ error: 'Please login through Google' });
        }

        const isMatch = await bcryptjs.compare(password, userExist.password);
        
        if (isMatch) {
            const jwttoken = jwt.sign({ userId: userExist._id }, process.env.JWT_PRIVATE_KEY, { expiresIn: '7d' }); 
            res.cookie('token', jwttoken, cookieOptions);
            
            userExist.password = undefined; 
            return res.status(200).json({ 
                message: "Logged in successfully", 
                success: true, 
                user: userExist 
            });
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
        
        if (!user) {
            return res.status(400).json({ error: 'User update data is required' });
        }

        // SECURITY FIX: Prevent updating sensitive fields via this route
        if (user.password || user.email || user.googleId) {
            return res.status(403).json({ error: 'Cannot update sensitive fields via this route' });
        }

        // Used { new: true } to get the updated document, avoiding a secondary findById query
        const updatedUser = await User.findByIdAndUpdate(req.user._id, user, { new: true }).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ error: 'User does not exist' });
        }

        res.status(200).json({
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getProfileById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Prevent password leakage
        const isExist = await User.findById(id).select('-password');

        if (!isExist) {
            return res.status(404).json({ error: "No such user exists" }); // Fixed to 404
        }

        return res.status(200).json({
            message: "User fetched successfully",
            user: isExist
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.logout = async (req, res) => {
    res.clearCookie('token', cookieOptions).json({ message: 'Logged out successfully' });
}

exports.findUser = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: "Search query is required" });
        }

        const users = await User.find({
            $and: [
                { _id: { $ne: req.user._id } },
                {
                    $or: [
                        { f_name: { $regex: new RegExp(`^${query}`, "i") } }, // Fixed from 'name' to 'f_name'
                        { email: { $regex: new RegExp(`^${query}`, "i") } }
                    ]
                }
            ]
        }).select('-password'); // Prevent password leakage

        return res.status(200).json({ // Changed to 200 (GET request)
            message: "Fetched Members",
            users: users
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.sendFriendRequest = async (req, res) => {
    try {
        const sender = req.user._id;
        // Accept both to prevent breaking current frontend while fixing the typo
        const receiverId = req.body.receiver || req.body.reciever; 

        if (!receiverId) {
            return res.status(400).json({ error: "Receiver ID is required" });
        }

        const userExist = await User.findById(receiverId);
        if (!userExist) {
            return res.status(404).json({ error: "No such user exists." });
        }
        
        // Fast checks to prevent duplicate requests
        if (userExist.friends.includes(sender)) {
            return res.status(400).json({ error: "Already Friends" });
        }

        if (userExist.pending_friends.includes(sender)) {
            return res.status(400).json({ error: "Request Already Sent" });
        }

        // Atomic update to prevent race conditions
        await User.findByIdAndUpdate(receiverId, {
            $addToSet: { pending_friends: sender }
        });

        const content = `${req.user.f_name} has sent you a friend request`;
        const notification = new NotificationModel({ 
            sender, 
            receiver: receiverId, 
            content, 
            type: "friendRequest" 
        });
        await notification.save();

        res.status(200).json({
            message: "Friend Request Sent",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.acceptFriendRequest = async (req, res) => {
    try {
        const { friendId } = req.body;
        const selfId = req.user._id;

        if (!friendId) {
            return res.status(400).json({ error: "Friend ID is required" });
        }

        const friendData = await User.findById(friendId);
        if (!friendData) {
            return res.status(404).json({ error: "No such user exists." });
        }
        
        // Ensure a pending request actually exists before processing
        if (!req.user.pending_friends.includes(friendId)) {
            return res.status(400).json({ error: "No friend request found from this user" });
        }

        // Atomic updates to prevent array race conditions
        await User.findByIdAndUpdate(selfId, {
            $pull: { pending_friends: friendId },
            $addToSet: { friends: friendId }
        });

        await User.findByIdAndUpdate(friendId, {
            $addToSet: { friends: selfId }
        });

        const content = `${req.user.f_name} has accepted your friend request`;
        const notification = new NotificationModel({ 
            sender: selfId, 
            receiver: friendId, 
            content, 
            type: "friendRequest" 
        });
        await notification.save();

        return res.status(200).json({
            message: "You are both connected now."
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getFriendsList = async (req, res) => {
    try {
        // Exclude passwords from populated objects
        const user = await User.findById(req.user._id).populate('friends', '-password');

        return res.status(200).json({
            friends: user.friends
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getPendingFriendList = async (req, res) => {
    try {
        // Exclude passwords from populated objects
        const user = await User.findById(req.user._id).populate('pending_friends', '-password');

        return res.status(200).json({
            pendingFriendsList: user.pending_friends
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.removeFromFriend = async (req, res) => {
    try {
        const selfId = req.user._id;
        const { friendId } = req.params;

        if (!friendId) {
            return res.status(400).json({ error: "Friend ID is required" });
        }

        const friendData = await User.findById(friendId);
        if (!friendData) {
            return res.status(404).json({ error: "No such user exists" });
        }

        if (!req.user.friends.includes(friendId)) {
            return res.status(400).json({ error: "You are not friends with this user" });
        }

        // Atomic update to safely remove from both arrays
        await User.findByIdAndUpdate(selfId, {
            $pull: { friends: friendId }
        });

        await User.findByIdAndUpdate(friendId, {
            $pull: { friends: selfId }
        });

        return res.status(200).json({
            message: "You are both disconnected now."
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}