const express = require('express');

const usersControllers = require('../controllers/users-controllers');
const { checkAuth, checkRole } = require('../middlewares/check');

const router = express.Router();

router.use(checkAuth, checkRole(['superadmin']));

router.get('/', usersControllers.getUsers);

router.get('/:uid', usersControllers.getUser);

router.post('/', usersControllers.createUser);

router.put('/:uid', usersControllers.editUser);

router.delete('/:uid', usersControllers.deleteUser);

module.exports = router;