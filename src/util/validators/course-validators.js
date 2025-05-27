const HttpError = require('../errors/http-error');

const courseCreateValidations = async function (data) {
    const { title, description, maximumCapacity } = data;
    const errors = [];
    
    // Title
    if (!title) errors.push('Title is a required field.');
    if (title.length < 5) errors.push('Title must be at least 5 characters long.');

    // Description
    if (!description) errors.push('Description is a required field.');
    if (description.length < 5) errors.push('Description must be at least 5 characters long.');

    // Maximum capacity
    if (
        maximumCapacity === undefined || 
        maximumCapacity === null || 
        maximumCapacity === ''
    ) errors.push('Maximum capacity is a required field.');
    if (isNaN(maximumCapacity)) errors.push('Maximum capacity must be a number.');
    if (Number(maximumCapacity) < 10) errors.push('Maximum capacity must be at least 10.');
    if (Number(maximumCapacity) > 1000) errors.push('Maximum capacity cannot exceed 1000.');

    if (errors.length > 0) {
        throw new HttpError(errors.join(' '), 400);
    }
};

const courseEditValidations = function (data) {
    const { title, description, maximumCapacity } = data;
    const errors = [];

    // Title
    if (title && title.length < 5) errors.push('Title must be at least 5 characters long.');

    // Description
    if (description && description.length < 5) errors.push('Description must be at least 5 characters long.');

    // Maximum Capacity
    if (maximumCapacity && isNaN(maximumCapacity)) errors.push('Maximum capacity must be a number.');
    if (maximumCapacity && Number(maximumCapacity) < 10) errors.push('Maximum capacity must be at least 10.');
    if (maximumCapacity && Number(maximumCapacity) > 1000) errors.push('Maximum capacity cannot exceed 1000.');

    if (errors.length > 0) {
        throw new HttpError(errors.join(' '), 400);
    }
};

module.exports = {
    courseCreateValidations,
    courseEditValidations
}