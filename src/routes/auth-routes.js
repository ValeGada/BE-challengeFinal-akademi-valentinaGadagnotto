const express = require('express');

const authControllers = require('../controllers/auth-controllers');
const { checkRole } = require('../middlewares/check');

const router = express.Router();

router.post('/login', authControllers.logIn);

router.post('/forgot-password', authControllers.passwordRecovery);

router.patch('/password-reset', authControllers.passwordReset);

router.use(checkRole(['student', 'superadmin']));

router.post('/register', authControllers.autoRegister);

module.exports = router;