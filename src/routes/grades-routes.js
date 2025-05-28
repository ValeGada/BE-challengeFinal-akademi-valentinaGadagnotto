const express = require('express');

const Grade = require('../models/grade');
const gradesControllers = require('../controllers/grades-controllers');
const { checkAuth, checkRole, checkOwnership } = require('../middlewares/check');

const router = express.Router();

router.use(checkAuth, checkRole(['superadmin', 'professor']));

router.post('/', gradesControllers.postGrade);

router.put('/:id', checkOwnership(Grade, 'professor'), gradesControllers.editGrade);

router.get('/student/:sid', gradesControllers.getStudentGrades);

module.exports = router;