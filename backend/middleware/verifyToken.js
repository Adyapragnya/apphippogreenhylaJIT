import jwt from 'jsonwebtoken';

// Middleware to extract and verify the token
const verifyToken = (req, res, next) => {
    // Get the token from the Authorization header (format: Bearer <token>)
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach the decoded token to the request object
        next(); // Call next() to continue to the next middleware/route handler
    } catch (err) {
        return res.status(400).json({ message: 'Invalid token' });
    }
};

export default verifyToken;
