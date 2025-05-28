const express = require('express');

const enrollmentsControllers = require('../controllers/enrollments-controllers');
const { checkAuth, checkRole, checkOwnership } = require('../middlewares/check');
const Enrollment = require('../models/enrollment');

const router = express.Router();

router.use(checkAuth);

router.get('/course/:cid', checkRole(['superadmin', 'professor']), enrollmentsControllers.getEnrollmentsPerCourse)

router.use(checkRole(['superadmin', 'student']));

router.get('/student/:sid', enrollmentsControllers.getEnrollments);

router.post('/', enrollmentsControllers.enroll);

router.delete('/:id', checkOwnership(Enrollment, 'student'), enrollmentsControllers.cancelEnrollment);

module.exports = router;