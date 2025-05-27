const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const HttpError = require('../util/errors/http-error');

const checkAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if(!token){
            throw new Error('Authentication failed');
        }
        const decoded = jwt.verify(token, process.env.JWT_SIGN);
        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new Error('User not found');
        }

        req.user = user;
        next();
    } catch (err) {
        return next(new HttpError(err.message || 'Authentication failed', 403));
    }
};

const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            return next(new HttpError('User not found or not authenticated', 403));
        }

        if (!allowedRoles.includes(user.role)) {
            return next(new HttpError('Access denied', 403));
        }

        next();
    }
};

module.exports = {
    checkAuth,
    checkRole
};