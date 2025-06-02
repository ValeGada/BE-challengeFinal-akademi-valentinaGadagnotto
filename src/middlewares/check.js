const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');
const HttpError = require('../util/errors/http-error');

const checkAuth = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if(!token){
            throw new HttpError('Authentication failed.', 403);
        }
        const decoded = jwt.verify(token, process.env.JWT_SIGN);
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new HttpError('User not found.', 404);
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

const checkOwnership = (Model, ownerField) => {
    return async (req, res, next) => {
        try {
            const { id } = req.params;
            const user = req.user;

            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new HttpError('Invalid resourse ID format.', 400);
            }
            
            const resource = await Model.findById(id);
            if (!resource) throw new HttpError('Resource not found', 404);
            
            const owner = resource[ownerField];
            const ownerUser = await User.findById(owner);
            if (!ownerUser) throw new HttpError('Resource has no owner defined.', 403);
            
            if (user.role === 'superadmin') return next();

            if (ownerUser.id !== user.id) throw new HttpError('You are not allowed to perform this action.', 403);

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