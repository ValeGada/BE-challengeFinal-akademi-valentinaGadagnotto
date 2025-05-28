const express = require('express');

const usersControllers = require('../controllers/users-controllers');
const { checkAuth } = require('../middlewares/check');

const router = express.Router();

router.use(checkAuth);

router.get('/', usersControllers.getUsers);

router.get('/:id', usersControllers.getUser);

router.post('/', usersControllers.createUser);

router.put('/:id', usersControllers.editUser);

router.delete('/:id', usersControllers.deleteUser);

module.exports = router;