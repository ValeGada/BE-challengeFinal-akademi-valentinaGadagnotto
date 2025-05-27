const express = require('express');

const authControllers = require('../controllers/auth-controllers');

const router = express.Router();

router.post('/login', authControllers.logIn);

router.post('/forgot-password', authControllers.passwordRecovery);

router.post('/password-reset', authControllers.passwordReset);

router.post('/register', authControllers.autoRegister);

module.exports = router;