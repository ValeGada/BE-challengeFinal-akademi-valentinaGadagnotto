const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const HttpError = require('../util/errors/http-error');

const checkAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if(!token){
            throw new Error('Authentication failed.');
        }
        const decoded = jwt.verify(token, process.env.JWT_SIGN);
        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new Error('User not found.');
        }

        req.user = user;
        next();
    } catch (err) {
        return next(new HttpError(err.message || 'Authentication failed.', 403));
    }
};

const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            return next(new HttpError('User not found or not authenticated.', 403));
        }

        if (!allowedRoles.includes(user.role)) {
            return next(new HttpError('Access denied.', 403));
        }

        next();
    }
};

const checkOwnership = (Model, ownerField = 'professor') => {
    return async (req, res, next) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new HttpError('Invalid resourse ID format.', 400);
            }

            const resource = await Model.findById(id);
            if (!resource) throw new HttpError('Resource not found', 404);

            const owner = resource[ownerField];

            if (!owner || owner.toString() !== userId && owner.role !== 'superadmin') {
                throw new HttpError('You are not allowed to perform this action.', 403);
            }

            next()
        } catch (err) {
            return next(new HttpError(err.message || 'Something went wrong.', 500));
        }
    }
}

module.exports = {
    checkAuth,
    checkRole,
    checkOwnership
};