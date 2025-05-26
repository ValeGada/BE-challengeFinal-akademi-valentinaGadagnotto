const HttpError = require('../errors/http-error');
const { usersRoles } = require('../../models/user');

const userCreateValidations = function (data) {
    const { name, email, password, role } = data;
    const errors = [];
    
    // Name
    if (!name) errors.push('Name is a required field.');

    // Email
    if (!email) errors.push('Email is a required field.');

    const emailFormat = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!email.match(emailFormat)) errors.push('Email is not valid.');

    // Password
    if (!password) errors.push('Password is a required field.');
    if (password.length < 6) errors.push('Password must be at least 6 characters long.');

    // Role
    if (!role) errors.push('Role is required.');
    if (!usersRoles.includes(role)) errors.push('Role must be "admin" or "emp".');

    if (errors.length > 0) {
        throw new HttpError(errors.join(' '), 400);
    }
};

const userEditValidations = function (data) {
    const { email, role } = data;
    const errors = [];

    // Email
    const emailFormat = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (email && !email.match(emailFormat)) errors.push('Email is not valid.');

    // Role
    if (role && !usersRoles.includes(role)) errors.push('Role must be "admin" or "emp".');
    console.log(errors)
    if (errors.length > 0) {
        throw new HttpError(errors.join(' '), 400);
    }
};

module.exports = {
    userCreateValidations,
    userEditValidations
}