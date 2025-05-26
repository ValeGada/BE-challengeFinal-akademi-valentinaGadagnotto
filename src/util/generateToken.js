const jwt = require('jsonwebtoken');

const generateToken = (payload, expiresIn = '1h') => {
    return jwt.sign(payload, process.env.JWT_SIGN, { expiresIn });
};

module.exports = generateToken;