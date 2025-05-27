const express = require('express');

const coursesControllers = require('../controllers/courses-controllers');
const { checkAuth, checkRole } = require('../middlewares/check');

const router = express.Router();

router.use(checkAuth);

router.get('/', checkRole(['superadmin', 'student']), coursesControllers.getCourses);

router.get('/:cid', coursesControllers.getCourse);

router.use(checkRole(['superadmin', 'professor']));

router.get('/professor/:pid', coursesControllers.getCoursesByProfId)

router.post('/', coursesControllers.createCourse);

router.put('/:cid', coursesControllers.editCourse);

router.delete('/:cid', coursesControllers.deleteCourse);

module.exports = router;