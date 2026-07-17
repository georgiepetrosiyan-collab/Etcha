// E/E-backend/models/job.js

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
    status: {
        type: String,
        enum: ["open", "closed"],
        default: "open"
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
    ],
    applications: [
        {
            applicant: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
                required: true
            },
            cv: {
                fullName: String,
                targetJobTitle: String,
                location: String,
                professionalSummary: String,
                coreSkills: [String],
                experience: [
                    {
                        title: String,
                        company: String,
                        duration: String,
                        location: String,
                        bullets: [String]
                    }
                ],
                keywordsMatched: [String]
            },
            matchPercentage: {
                type: Number
            },
            // ATS keyword-check score computed automatically at time of application
            atsScore: {
                type: Number
            },
            status: {
                type: String,
                enum: ["pending", "rejected", "accepted"],
                default: "pending"
            },
            appliedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

const jobModel = mongoose.model('job', JobSchema);
module.exports = jobModel;