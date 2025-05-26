const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gradeSchema = new Schema({
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'User' 
    },
    professor: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'User' 
    },
    course: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'Course' 
    },
    score: { type: Number, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('Grade', gradeSchema);