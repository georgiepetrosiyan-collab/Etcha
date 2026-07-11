//E/E-backend/models/referral.js

const mongoose = require('mongoose');

const ReferralSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'job',
        required: true
    },
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    referredUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "declined"],
        default: "pending"
    }
}, { timestamps: true });

const referralModel = mongoose.model('referral', ReferralSchema);
module.exports = referralModel;