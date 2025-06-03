const express = require('express');

const usersControllers = require('../controllers/users-controllers');
const { checkAuth, checkRole } = require('../middlewares/check');

const router = express.Router();

router.use(checkAuth);

router.get('/', checkRole(['superadmin']), usersControllers.getUsers);

router.get('/:id', usersControllers.getUser);

router.post('/',  checkRole(['superadmin']), usersControllers.createUser);

router.put('/:id', usersControllers.editUser);

router.delete('/:id', usersControllers.deleteUser);

module.exports = router;