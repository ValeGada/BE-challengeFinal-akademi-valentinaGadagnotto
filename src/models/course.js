const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    professor: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true,
        ref: 'User' 
    },
    maximumCapacity: { type: Number, required: true }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

courseSchema.virtual(
    'enrollments', 
    {
        ref: 'Enrollment',
        localField: '_id',
        foreignField: 'course'
    }
);

module.exports = mongoose.model('Course', CourseSchema);