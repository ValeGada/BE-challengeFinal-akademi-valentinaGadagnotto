const mongoose = require('mongoose');

const HttpError = require('../util/errors/http-error');
const Course = require('../models/course');
const { User } = require('../models/user');
const { 
    courseCreateValidations,
    courseEditValidations 
} = require('../util/validators/course-validators');

const getCourses = async (req, res, next) => {
    try {
        const { title, page=1, limit=10, search = '', sortBy = 'title', sortOrder = 'asc' } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
    
        if (isNaN(pageNumber) || pageNumber <= 0) throw new HttpError('Invalid page number', 400);
        if (isNaN(limitNumber) || limitNumber <= 0) throw new HttpError('Invalid limit number', 400);

        let filter = {};
        if (search) {
            const normalizedSearch = search.trim();
            filter.title = new RegExp(normalizedSearch, 'i');
        }

        if (title && !search) {
            const normalizedTitle = title.trim();
            filter.title = new RegExp(normalizedTitle, 'i');
        }

        const totalCourses = await Course.countDocuments(filter);

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const courses = await Course.find(filter)
            .populate('professor', 'name')
            .populate({ path: 'enrollmentsCount' })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort(sortOptions);

        if (!courses || courses.length === 0) throw new HttpError('No courses found', 404);

        res.json({
            courses: courses.map(course => course.toObject({ getters: true })),
            totalCourses,
            totalPages: Math.ceil(totalCourses / limitNumber),
            currentPage: pageNumber
        });
    } catch (err) {
        return next(err);
    }
};

const getCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
    
        // ID validation
        if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError('Invalid course ID format.', 400);

        const course = await Course.findById(id)
            .populate('professor', 'name')
            .populate({ path: 'enrollmentsCount' });
        if(!course) throw new HttpError('Course not found.', 404);

        const courseObject = course.toObject({ getters: true });    
        res.status(200).json(courseObject);
    } catch (err) {
        return next(err);
    }
};

const getCoursesByProfId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, page=1, limit=10, search = '', sortBy = 'title', sortOrder = 'asc' } = req.query;
    
        // ID validation
        if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError('Invalid user ID format.', 400);

        const professor = await User.findById(id);
        if(!professor) throw new HttpError('Professor user not found.', 404);

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
    
        if (isNaN(pageNumber) || pageNumber <= 0) throw new HttpError('Invalid page number', 400);
        if (isNaN(limitNumber) || limitNumber <= 0) throw new HttpError('Invalid limit number', 400);

        let filter = { professor: id };
        if (search) {
            filter.title = new RegExp(search.trim(), 'i');
        }

        const totalCourses = await Course.countDocuments(filter);

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const courses = await Course.find(filter)
            .populate('professor', 'name')
            .populate({
                path: 'professor', 
                select: 'name profile',
                populate: {
                    path: 'profile.givenGrades',
                    model: 'Grade'
                }
            })
            .populate({ path: 'enrollmentsCount' })
            .populate({ 
                path: 'enrollments', 
                populate: { 
                    path: 'student', 
                    select: 'id name email profile',
                    populate: {
                        path: 'profile.receivedGrades',
                        model: 'Grade'
                    } 
                } 
            })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .sort(sortOptions);

        if (!courses || courses.length === 0) throw new HttpError('No courses found', 404);

        res.json({
            courses: courses.map(course => course.toObject({ getters: true })),
            totalCourses,
            totalPages: Math.ceil(totalCourses / limitNumber),
            currentPage: pageNumber
        });
    } catch (err) {
        return next(err);
    }
};

const createCourse = async (req, res, next) => {
    try {
        courseCreateValidations(req.body);
        const { title, description, maximumCapacity, professor } = req.body;

        const existingCourse = await Course.findOne({ title });
        if (existingCourse) throw new HttpError('It already exists a course with that title, try with another one.', 400);

        let assignedProfessor;
        if (req.user.role === 'superadmin') {
            assignedProfessor = await User.findOne({ name: professor, role: 'professor' });
            if (!assignedProfessor) throw new HttpError('Professor not found.', 404);
            if (assignedProfessor.role !== 'professor') throw new HttpError('The specified user is not a professor.', 400);
        };

        if (req.user.role === 'professor') {
            assignedProfessor = req.user;
        };

        const createdCourse = new Course({
            title,
            description,
            maximumCapacity,
            professor: assignedProfessor
        });

        await createdCourse.save();
        await User.findByIdAndUpdate(
            assignedProfessor._id,
            { $push: { 'profile.createdCourses': createdCourse._id } }
        );

        const courseObj = createdCourse.toObject({ getters: true });
        const professorObj = assignedProfessor.toObject({ getters: true });
        delete professorObj.password;
        
        res.status(201).json({
            courseObj,
            professorObj
        });
    } catch (err) {
        return next(err);
    }
};

const editCourse = async (req, res, next) => {
    const { id } = req.params;
    const { title, description, maximumCapacity } = req.body;
    
    // ID validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new HttpError('Invalid course ID format.', 400));
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'maximumCapacity'];

    if (!updates.every(update => allowedUpdates.includes(update))) {
        return next(new HttpError('Invalid updates.', 500));
    }

    try {
        req.body.maximumCapacity = Number(req.body.maximumCapacity);
        courseEditValidations(req.body);

        const course = await Course.findById(id);
        if (!course) throw new HttpError('Course not found.', 404);
    
        updates.forEach(update => course[update] = req.body[update]);
        await course.save();

        const courseObj = course.toObject({ getters: true });
        res.status(200).json({ message: 'Course successfully edited.', courseObj });
    } catch (err) {
        return next(err);
    }
};

const deleteCourse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const course = await Course.findByIdAndDelete(id);
        if (!course) throw new HttpError('User not found.', 404);

        const courseObject = course.toObject({ getters: true });
        res.status(200).json({ message: 'Course successfullly deleted.', courseObject });
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    getCourses,
    getCourse,
    getCoursesByProfId,
    createCourse,
    editCourse,
    deleteCourse
}