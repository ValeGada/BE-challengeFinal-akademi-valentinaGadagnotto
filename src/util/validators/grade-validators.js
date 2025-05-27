const HttpError = require('../errors/http-error');

const gradeScoreValidations = function (score) {
    const errors = [];

    // Score
    if (
        score === undefined || 
        score === null || 
        score === ''
    ) errors.push('Score is a required field.');
    if (isNaN(score)) errors.push('Score must be a number.');
    if (Number(score) < 0) errors.push('Score cannot be a value below 0.');
    if (Number(score) > 10) errors.push('Score cannot exceed 10.');

    if (errors.length > 0) {
        throw new HttpError(errors.join(' '), 400);
    }
};

module.exports = gradeScoreValidations;