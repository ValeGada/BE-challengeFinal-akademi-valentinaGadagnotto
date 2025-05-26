const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const usersRoles = [
    'superadmin', 
    'professor',
    'student'
]

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

// Cursos creados
userSchema.virtual('createdCourses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'professor'
});

// Suscripciones
userSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'student'
});

// Notas puestas
userSchema.virtual('givenGrade', {
  ref: 'Grade',
  localField: '_id',
  foreignField: 'professor'
});

// Notas recibidas
userSchema.virtual('recievedGrade', {
  ref: 'Grade',
  localField: '_id',
  foreignField: 'student'
});

const User = mongoose.model('User', userSchema);

module.exports = {
    User,
    usersRoles
};