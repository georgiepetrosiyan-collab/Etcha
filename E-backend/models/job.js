const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    location: {
        type: String,
        default: ""
    },
    job_type: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
        default: 'full-time'
    },
    description: {
        type: String,
        default: ""
    },
    requirements: {
        type: [String],
        default: []
    },
    salary: {
        type: String,
        default: ""
    },
    posted_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    applicants: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
            },
            applied_at: {
                type: Date,
                default: Date.now,
            },
            status: {
                type: String,
                enum: ['pending', 'reviewed', 'rejected', 'accepted'],
                default: 'pending',
            }
        }
    ],
    referrals: [
        {
            referred_by: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
            },
            referred_to: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user',
            },
            message: {
                type: String,
                default: ""
            },
            status: {
                type: String,
                enum: ['pending', 'accepted', 'rejected'],
                default: 'pending'
            },
            created_at: {
                type: Date,
                default: Date.now
            }
        }
    ],
}, { timestamps: true });

const jobModel = mongoose.model('job', JobSchema);
module.exports = jobModel;