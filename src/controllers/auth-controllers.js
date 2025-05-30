const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../util/errors/http-error');
const { User } = require('../models/user');
const generateToken = require('../util/generateToken');
const sendRecoveryEmail = require('../emails/sendRecoveryEmail');
const { 
    studentRegisterValidations, 
    userLogInValidations,
    emailValidations,
    passwordValidations
} = require('../util/validators/auth-validators');

const autoRegister = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        studentRegisterValidations(req.body);

        const existingUser = await User.findOne({ email });
        if (existingUser) throw new HttpError('It already exists a user with given email.', 422);

        const createdUser = new User({
            name,
            email,
            password,
            role: 'student'
        });

        if (createdUser.role !== 'student') throw new HttpError('Auto registered user can only be "student".', 400);
        await createdUser.save();

        const createdUserObj = createdUser.toObject({ getters: true });
        delete createdUserObj.password;
        res.status(201).json(createdUserObj);
    } catch (err) {
        return next(err);
    }
};

const logIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        userLogInValidations(req.body);

        const user = await User.findOne({ email });
        if (!user) throw new HttpError('Invalid credentials, could not log you in.', 403);

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) throw new HttpError('Invalid credentials, could not log you in.', 403);

        const token = generateToken({ userId: user.id, name: user.name, email: user.email, role: user.role });

        const expirationDate = new Date(Date.now() + 3600000); // 1h
        res.status(200).json({ 
            token,
            expiration: expirationDate.toISOString(),
            user: {
                userId: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        return next(err);
    }
};

const passwordRecovery = async (req, res, next) => {
    try {
        const { email } = req.body;
        emailValidations(req.body);

        const user = await User.findOne({ email });
        if (!user) throw new HttpError('Invalid email, could not recover your password.', 422);

        const recoveryToken = generateToken({ userId: user.id, email: user.email, role: user.role }, '15m');
        user.recoveryToken = recoveryToken;

        await user.save();
        
        const link = `http://localhost:3000/password-reset/${recoveryToken}`

        await sendRecoveryEmail({
            email: user.email,
            name: user.name,
            link
        });

        res.status(200).json({ message: 'Recovery email sent' });
    } catch (err) {
        return next(err);
    }
};

const passwordReset = async (req, res, next) => {
    try {
        const { recoveryToken, newPassword } = req.body;
        passwordValidations(newPassword);

        const decodedToken = jwt.verify(recoveryToken, process.env.JWT_SIGN);
        if (!decodedToken) throw new HttpError('Invalid or expired token.', 403);
        
        const user = await User.findById(decodedToken.userId);
        if (!user) throw new HttpError('User not found.', 404);
        if (recoveryToken !== user.recoveryToken) throw new HttpError('Invalid or expired token.', 403);

        user.password = newPassword;
        user.recoveryToken = null;

        await user.save();
        res.status(200).json({ message: 'Password has been reset.' });
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    autoRegister,
    logIn,
    passwordRecovery,
    passwordReset
}