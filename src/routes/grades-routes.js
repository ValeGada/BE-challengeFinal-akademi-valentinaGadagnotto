const express = require('express');

const gradesControllers = require('../controllers/grades-controllers');
const { checkAuth, checkRole } = require('../middlewares/check');

const router = express.Router();

router.use(checkAuth, checkRole(['superadmin', 'professor']));

router.post('/', gradesControllers.postGrade);

router.put('/:gid', gradesControllers.editGrade);

router.get('/student/:sid', gradesControllers.getStudentGrades);

module.exports = router;