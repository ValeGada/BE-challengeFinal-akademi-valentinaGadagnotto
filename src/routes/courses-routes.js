const express = require('express');

const Course = require('../models/course');
const coursesControllers = require('../controllers/courses-controllers');
const { checkAuth, checkRole, checkOwnership } = require('../middlewares/check');

const router = express.Router();

router.use(checkAuth);

router.get('/', checkRole(['superadmin', 'student']), coursesControllers.getCourses);

router.get('/:id', coursesControllers.getCourse);

router.use(checkRole(['superadmin', 'professor']));

router.get('/professor/:id', coursesControllers.getCoursesByProfId);

router.post('/', coursesControllers.createCourse);

router.put('/:id', checkOwnership(Course, 'professor'), coursesControllers.editCourse);

router.delete('/:id', checkOwnership(Course, 'professor'), coursesControllers.deleteCourse);

module.exports = router;