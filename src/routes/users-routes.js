const express = require('express');

const usersControllers = require('../controllers/users-controllers');
const auth = require('../middlewares/auth');
const allowed = require('../middlewares/roleCheck');

const router = express.Router();

router.post('/login', usersControllers.logIn);

router.post('/password-recovery', usersControllers.passwordRecovery);

router.patch('/password-reset', usersControllers.passwordReset);

router.use(auth, allowed(['admin']));

router.get('/', usersControllers.getUsers);

router.get('/:uid', usersControllers.getUser);

router.post('/register', usersControllers.registerUser);

router.patch('/:uid', usersControllers.editUser);

router.delete('/:uid', usersControllers.deleteUser);

module.exports = router;