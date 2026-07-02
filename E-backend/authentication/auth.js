const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.auth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }
        
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
        
        // Look up the user
        const user = await User.findById(decoded.userId).select('-password');
        
        // Prevent ghost logins: Check if the user still exists in the database
        if (!user) {
            // Optional: You might want to clear the defunct cookie here too
            res.clearCookie('token'); 
            return res.status(401).json({ error: 'User no longer exists, authorization denied' });
        }
        
        // Attach user to request and proceed
        req.user = user;
        next();

    } catch (err) {
        // Log the actual error for your own debugging
        console.error("Auth Middleware Error:", err.message);
        
        // Differentiate between a bad JWT and a database/server failure
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token is not valid or has expired' });
        }
        
        return res.status(500).json({ error: 'Internal server error during authentication' });
    }
}