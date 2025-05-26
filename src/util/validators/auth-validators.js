const HttpError = require('../errors/http-error');

const studentRegisterValidations = function (data) {
    const { name, email, password } = data;
    const errors = [];
    
    // Name
    if (!name) errors.push('Name is a required field.');

    // Email
    if (!email) errors.push('Email is a required field.');

    const emailFormat = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!email.match(emailFormat)) errors.push('Email format is not valid.');

    // Password
    if (!password) errors.push('Password is a required field.');
    if (password.length < 6) errors.push('Password must be at least 6 characters long.');

    if (errors.length > 0) {
        throw new HttpError(errors.join(' '), 400);
    }
};

const userLogInValidations =  function (data) {
    const { email, password } = data;
    const errors = [];

    // Email
    if (!email) errors.push('Email is a required field.');

    const emailFormat = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!email.match(emailFormat)) errors.push('Email format is not valid.');

    // Password
    if (!password) errors.push('Password is a required field.');
    if (password.length < 6) errors.push('Password must be at least 6 characters long.');

    if (errors.length > 0) {
        throw new HttpError(errors.join(' '), 400);
    }
};

const emailValidations = function (data) {
    const { email } = data;
    const errors = [];

    if (!email) errors.push('Email is a required field.');

    const emailFormat = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!email.match(emailFormat)) errors.push('Email format is not valid.');

    if (errors.length > 0) {
        throw new HttpError(errors.join(' '), 400);
    }
};

const passwordValidations = function (data) {
    const { password } = data;
    const errors = [];
    
    if (!password) errors.push('Password is a required field.');
    if (password.length < 6) errors.push('Password must be at least 6 characters long.');

    if (errors.length > 0) {
        throw new HttpError(errors.join(' '), 400);
    }
};

module.exports = {
    studentRegisterValidations,
    userLogInValidations,
    emailValidations,
    passwordValidations
}