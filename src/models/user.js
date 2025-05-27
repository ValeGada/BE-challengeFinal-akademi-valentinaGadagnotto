const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const usersRoles = [
    'superadmin', 
    'professor',
    'student'
]

const professorProfileSchema = new Schema({
    givenGrades: [{ type: Schema.Types.ObjectId, ref: 'Grade' }],
    createdCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
}, { _id: false }); // Que el profile no tenga ID propio

const studentProfileSchema = new Schema({
    receivedGrades: [{ type: Schema.Types.ObjectId, ref: 'Grade' }],
    enrollments: [{ type: Schema.Types.ObjectId, ref: 'Enrollment' }]
}, { _id: false });

const userSchema = new Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true, 
        lowercase: true, 
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('El email ingresado no es válido')
            }
        }
    },
    password: { 
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value) {
            if (value.toLowerCase().includes('contraseña' || 'password')) {
                throw new Error('La contraseña no puede contener "contraseña" o "password"')
            }
        }
    },
    role: {
        type: String,
        enum: usersRoles,
        required: true
    },
    recoveryToken: { 
        type: String, 
        default: null 
    },
    profile: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.pre('save', async function(next) {
    const user = this;
    
    if (user.isModified('password')){
        try { 
            user.password = await bcrypt.hash(user.password, 8);
        } catch (e) {
            return next(e);
        }
        next();
    }
});

userSchema.pre('save', async function (next) {
    if (this.role === 'professor') {
        const professorProfile = new mongoose.Document(this.profile, professorProfileSchema);
        if (!professorProfile.validateSync()) {
            return next(new Error('Invalid professor profile structure.'));
        }
        this.profile = professorProfile.toObject();
    }

    if (this.role === 'student') {
        const studentProfile = new mongoose.Document(this.profile, studentProfileSchema);
        if (!satisfiestudentProfile.validateSync()) {
            return next(new Error('Invalid student profile structure.'));
        }
        this.profile = studentProfile.toObject();
    }

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = {
    User,
    usersRoles
};