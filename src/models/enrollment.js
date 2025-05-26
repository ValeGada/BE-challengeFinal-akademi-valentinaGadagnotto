const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const enrollmentSchema = new Schema({
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'User' 
    },
    course: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'Course' 
    }
}, {
    timestamps: true
});

// Para evitar inscripciones duplicadas podría ser un índice compuesto:
// enrollmentSchema.index({ alumno: 1, curso: 1 }, { unique: true }); 

module.exports = mongoose.model('Enrollment', enrollmentSchema);