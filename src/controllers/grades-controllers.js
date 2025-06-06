const mongoose = require('mongoose');

const HttpError = require('../util/errors/http-error');
const Grade = require('../models/grade');
const Enrollment = require('../models/enrollment');
const Course = require('../models/course');
const { User } = require('../models/user');
const gradeScoreValidations = require('../util/validators/grade-validators');

const getStudentGrades = async (req, res, next) => {
    try {
        const { sid } = req.params;
        const { page=1, limit=10, search = '' } = req.query;

        // ID validation
        if (!mongoose.Types.ObjectId.isValid(sid)) throw new HttpError('Invalid user ID format.', 400);

        const student = await User.findById(sid);
        if(!student || student.role !== 'student') throw new HttpError('Student user not found.', 404);

        const professor = await User.findById(req.user.id);
        if(!professor || professor.role !== 'professor') throw new HttpError('Professor user not found.', 404);

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
    
        if (isNaN(pageNumber) || pageNumber <= 0) throw new HttpError('Invalid page number', 400);
        if (isNaN(limitNumber) || limitNumber <= 0) throw new HttpError('Invalid limit number', 400);

        let filter = { professor: req.user.id, student: sid };
        if (search) {
            const normalizedSearch = search.trim();
            const matchingCourses = await Course.find({
                title: new RegExp(normalizedSearch, 'i')
            }).select('_id');

            const courseIds = matchingCourses.map(course => course._id);

            filter.course = { $in: courseIds };
        }

        const totalGrades = await Grade.countDocuments(filter);

        const grades = await Grade.find(filter)
            .populate('course', 'title description professor enrollments maximumCapacity')
            .populate('student', 'name email')
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)

        // if (!grades || grades.length === 0) throw new HttpError('No grades found for this student.', 404);

        res.json({
            grades: grades.map(grade => grade.toObject({ getters: true })),
            totalGrades,
            totalPages: Math.ceil(totalGrades / limitNumber),
            currentPage: pageNumber
        });
    } catch (err) {
        return next(err);
    }
};

const postGrade = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { score, student, course } = req.body
        gradeScoreValidations(score);

        const validCourse = await Course.findById(course).session(session);
        if (!validCourse) throw new HttpError('Course does not exist or has been deleted, try with another one.', 404);

        const professor = await User.findById(req.user.id).session(session);
        if (!professor || professor.role !== 'professor') throw new HttpError('Only professors can put grades.', 400);

        if (validCourse.professor.toString() !== req.user.id) {
            throw new HttpError('You are not the professor of this course.', 403);
        }

        const validStudent = await User.findById(student).session(session);
        if (!validStudent) throw new HttpError('Student not found.', 404);
        if (validStudent.role !== 'student') throw new HttpError('Grades can only be put to students.', 400);

        const checkEnrollment = await Enrollment.findOne({ 
            student: validStudent._id, 
            course: validCourse._id
        }).session(session);
        if (!checkEnrollment) throw new HttpError('Student must be enrolled in the course.', 400);

        const checkGrade = await Grade.findOne({ 
            student: validStudent._id, 
            course: validCourse._id,
            professor: req.user.id
        }).session(session);
        if (checkGrade) throw new HttpError('Student already has a grade for this course.', 400);

        const newGrade = new Grade({
            student: validStudent._id,
            professor: req.user.id,
            course: validCourse._id,
            score
        });

        await newGrade.save({session});
        
        await User.findByIdAndUpdate(
            req.user.id,
            { $push: { 'profile.givenGrades': newGrade._id } },
            { session }
        );

        await User.findByIdAndUpdate(
            student,
            { $push: { 'profile.receivedGrades': newGrade._id } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        const gradeObj = newGrade.toObject({ getters: true });    
        res.status(201).json(gradeObj);
    } catch (err) {
        await session.abortTransaction();
        return next(err);
    }
};

const editGrade = async (req, res, next) => {
    const { id } = req.params;
    const { score } = req.body
    
    
    // ID validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new HttpError('Invalid grade ID format.', 400));
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['score'];

    if (!updates.every(update => allowedUpdates.includes(update))) {
        return next(new HttpError('Invalid updates.', 500));
    }

    try {
        gradeScoreValidations(score);

        const editedGrade = await Grade.findById(id);
        if (!editedGrade) throw new HttpError('Grade not found.', 404);

        editedGrade.score = score;
        await editedGrade.save();

        const gradeObj = editedGrade.toObject({ getters: true });
        res.status(200).json({ message: 'Grade successfully edited.', gradeObj });
    } catch (err) {
        await session.abortTransaction();
        return next(err);
    }
};

module.exports = {
    getStudentGrades,
    postGrade,
    editGrade
}