//E/E-backend/models/job.js

const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    companyLogo: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    type: {
        type: String,
        enum: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
        default: "Full-time"
    },
    salary: {
        type: String,
        default: ""
    },
    description: {
        type: String,
        default: ""
    },
    fullDescription: {
        type: String,
        default: ""
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    applicants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ]
}, { timestamps: true });

const jobModel = mongoose.model('job', JobSchema);
module.exports = jobModel;