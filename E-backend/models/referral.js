//E/E-backend/models/referral.js

const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'job', required: true },
    referrer: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    referredUser: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    status: {
        type: String,
        enum: ["pending", "interviewing", "hired", "declined"],
        default: "pending"
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
    matchPercentage: { type: Number }
}, { timestamps: true });

const referralModel = mongoose.model('referral', ReferralSchema);
module.exports = referralModel;