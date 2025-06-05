const mongoose = require('mongoose');

const HttpError = require('../util/errors/http-error');
const Enrollment = require('../models/enrollment');
const Course = require('../models/course');
const { User } = require('../models/user');

const getEnrollments = async (req, res, next) => {
    try {
        const { sid } = req.params;
        const { page=1, limit=10, search = '', sortBy = 'title', sortOrder = 'asc' } = req.query;

        // ID validation
        if (!mongoose.Types.ObjectId.isValid(sid)) throw new HttpError('Invalid user ID format.', 400);

        const student = await User.findById(sid);
        if(!student) throw new HttpError('Student user not found.', 404);

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
    
        if (isNaN(pageNumber) || pageNumber <= 0) throw new HttpError('Invalid page number', 400);
        if (isNaN(limitNumber) || limitNumber <= 0) throw new HttpError('Invalid limit number', 400);

        let filter = { student: sid };
        if (search) {
            const normalizedSearch = search.trim();
            const matchingCourses = await Course.find({
                title: new RegExp(normalizedSearch, 'i')
            }).select('_id');

            const courseIds = matchingCourses.map(course => course._id);

            filter.course = { $in: courseIds };
        }

        const totalEnrollments = await Enrollment.countDocuments(filter);

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const enrollments = await Enrollment.find(filter)
            .populate({ 
                path: 'course', 
                select: 'title description professor maximumCapacity', 
                populate: {
                    path: 'professor', 
                    select: 'name' 
                }
            })
            .populate({
                path: 'student', 
                select: 'id name email profile',
                populate: {
                    path: 'profile.receivedGrades',
                    model: 'Grade'
                }
            })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort(sortOptions);

        if (!enrollments || enrollments.length === 0) throw new HttpError('No enrollments found', 404);

        res.json({
            enrollments: enrollments.map(enrollment => enrollment.toObject({ getters: true })),
            totalEnrollments,
            totalPages: Math.ceil(totalEnrollments / limitNumber),
            currentPage: pageNumber
        });
    } catch (err) {
        return next(err);
    }
};

const getEnrollmentsPerCourse = async (req, res, next) => {
    try {
        const { cid } = req.params;
        const { page=1, limit=10, search = '', sortBy = 'name', sortOrder = 'asc' } = req.query;
    
        // ID validation
        if (!mongoose.Types.ObjectId.isValid(cid)) throw new HttpError('Invalid course ID format.', 400);

        const course = await Course.findById(cid);
        if(!course) throw new HttpError('Course not found.', 404);

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
    
        if (isNaN(pageNumber) || pageNumber <= 0) throw new HttpError('Invalid page number', 400);
        if (isNaN(limitNumber) || limitNumber <= 0) throw new HttpError('Invalid limit number', 400);

        let filter = { course: cid };
        
        if (search) {
            const normalizedSearch = search.trim();
            const matchingStudents = await User.find({
                name: new RegExp(normalizedSearch, 'i')
            }).select('_id');
            
            const studentIds = matchingStudents.map(student => student._id);
            
            filter.student = { $in: studentIds };
        }

        const totalEnrollments = await Enrollment.countDocuments(filter);

        const sortOptions = {};
        if (sortBy === 'name') {
            sortOptions['student.name'] = sortOrder === 'asc' ? 1 : -1;
        } else {
            sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
        }

        const enrollments = await Enrollment.find(filter)
            .populate({ 
                path: 'course', 
                select: 'id title description professor maximumCapacity', 
                populate: {
                    path: 'professor', 
                    select: 'name' 
                }
            })
            .populate({
                path: 'student', 
                select: 'id name email profile',
                populate: {
                    path: 'profile.receivedGrades',
                    model: 'Grade'
                }
            })            
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort(sortOptions);

        if (!enrollments || enrollments.length === 0) throw new HttpError('No enrollments found', 404);

        res.json({
            enrollments: enrollments.map(enrollment => enrollment.toObject({ getters: true })),
            totalEnrollments,
            totalPages: Math.ceil(totalEnrollments / limitNumber),
            currentPage: pageNumber
        });
    } catch (err) {
        return next(err);
    }
};

const enroll = async (req, res, next) => {
    try {
        const { id } = req.body;

        const existingCourse = await Course.findById(id);
        if (!existingCourse) throw new HttpError('Course does not exist or has been deleted, try with another one.', 404);

        const user = await User.findById(req.user.id);
        if (!user) throw new HttpError('No user found.', 404);
        if (user.role === 'professor') throw new HttpError('Only students can enroll to a course.', 400);
        
        const currentEnrollments = await Enrollment.countDocuments({ course: existingCourse });
        if (currentEnrollments >= existingCourse.maximumCapacity) {
            throw new HttpError('Maximum course capacity reached.', 400);
        }

        const alreadyEnrolled = await Enrollment.findOne({ student: user, course: existingCourse });
        if (alreadyEnrolled) throw new HttpError('Student already enrolled in this course.', 400);

        const newEnrollment = new Enrollment({
            student: user,
            course: existingCourse
        });

        await newEnrollment.save();
        await User.findByIdAndUpdate(
            user._id,
            { $push: { 'profile.enrollments': newEnrollment._id } }
        );

        const studentObj = user.toObject({ getters: true});
        delete studentObj.password;

        res.status(201).json({ 
            enrollment: {
                student: studentObj,
                course: newEnrollment.course
        }});
    } catch (err) {
        return next(err);
    }
};

const cancelEnrollment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const enrollment = await Enrollment.findByIdAndDelete(id);
        if (!enrollment) throw new HttpError('Enrollment not found.', 404);
        if ((enrollment.student.toString() !== req.user.id) && req.user.role !== 'superadmin') { 
            throw new HttpError('You cannot cancel enrollments that are not your own.', 403)
        };

        const enrollmentObj = enrollment.toObject({ getters: true });
        res.status(200).json({ message: 'Enrollment successfully canceled.', enrollmentObj });
    } catch (err) {
        return next(err);
    }
};

module.exports = {
    getEnrollments,
    getEnrollmentsPerCourse,
    enroll,
    cancelEnrollment
}