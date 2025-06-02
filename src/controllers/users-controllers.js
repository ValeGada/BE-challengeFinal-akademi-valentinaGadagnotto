const mongoose = require('mongoose');

const HttpError = require('../util/errors/http-error');
const { User, usersRoles } = require('../models/user');
const { 
    userCreateValidations,
    userEditValidations 
} = require('../util/validators/user-validators');

const getUsers = async (req, res, next) => {
    try {
        const { name, role, page=1, limit=10, search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
    
        if (isNaN(pageNumber) || pageNumber <= 0) throw new HttpError('Invalid page number', 400);
        if (isNaN(limitNumber) || limitNumber <= 0) throw new HttpError('Invalid limit number', 400);

        let filter = {};
        if (search) { // filtro por búsqueda (sólo de nombre) si existe
            const normalizedSearch = search.trim();
            filter.name = new RegExp(normalizedSearch, 'i'); // búsqueda insensible a mayúsculas
        }

        if (name && !search) { // filtrar por nombre sin sobreescribir la búsqueda manual
            const normalizedName = name.trim();
            filter.name = new RegExp(normalizedName, 'i');
        }
        
        if (role && usersRoles.includes(role)) {
            filter.role = role;
        }

        const totalUsers = await User.countDocuments(filter);

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const users = await User.find(filter, "-password")
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort(sortOptions);

        if (!users || users.length === 0) throw new HttpError('No users found', 404);

        res.json({
            users: users.map(user => user.toObject({ getters: true })),
            totalUsers,
            totalPages: Math.ceil(totalUsers / limitNumber),
            currentPage: pageNumber
        });
    } catch (err) {
        return next(err);
    }
};

const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;
    
        // ID validation
        if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError('Invalid user ID format.', 400);

        const user = await User.findById(id);
        if(!user) throw new HttpError('User not found.', 404);

        const userObject = user.toObject({ getters: true });
        delete userObject.password; // No mostrar la contraseña en la respuesta
    
        res.status(200).json(userObject);
    } catch (err) {
        return next(err);
    }
};

const createUser = async (req, res, next) => {
    try {
        userCreateValidations(req.body);
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) throw new HttpError('It already exists a user with given email.', 422);

        const createdUser = new User(req.body);
        await createdUser.save();

        res.status(201).json({
            id: createdUser.id, 
            email: createdUser.email,
            role: createdUser.role
        });
    } catch (err) {
        return next(err);
    }
};

const editUser = async (req, res, next) => {
    const { id } = req.params;
    const { name, email, role } = req.body;
    
    // ID validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new HttpError('Invalid user ID format.', 400));
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'role'];

    if (!updates.every(update => allowedUpdates.includes(update))) {
        return next(new HttpError('Invalid updates.', 500));
    }

    try {
        userEditValidations(req.body);

        const user = await User.findById(id);
        if (!user) throw new HttpError('User not found.', 404);
    
        updates.forEach(update => user[update] = req.body[update]);
        await user.save();

        const userObject = user.toObject({ getters: true });
        delete userObject.password; // No mostrar la contraseña en la respuesta
        res.status(200).json({ message: 'User successfully edited.', userObject });
    } catch (err) {
        return next(err);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) throw new HttpError('User not found.', 404);

        const userObject = user.toObject({ getters: true });
        delete userObject.password; // No mostrar la contraseña en la respuesta
        res.status(200).json({ message: 'USer successfully deleted.', userObject });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    getUsers,
    getUser,
    createUser,
    editUser,
    deleteUser
}