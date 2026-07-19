//E/E-backend/controller/referral.js

const Job = require('../models/job');
const User = require('../models/user');
const Referral = require('../models/referral');
const NotificationModel = require('../models/notification');
const { computeMatchScore } = require('../utils/matchScore');
const { generateResumeForUser } = require('../utils/generateResume');

exports.getReferralsForJob = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        if (!job.postedBy || job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only the job poster can view referrals" });
        }

const referrals = await Referral.find({ job: id })
            .populate('referredUser', 'f_name headline profilePic curr_company curr_location')
            .populate('referrer', 'f_name profilePic')
            .sort({ createdAt: -1 });

        const referralsForResponse = referrals.map(r => {
            const obj = r.toObject();
            delete obj.matchPercentage;
            return obj;
        });

        return res.status(200).json({
            message: "Referrals fetched successfully",
            referrals: referralsForResponse
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.getMyReferrals = async (req, res) => {
    try {
        const referrals = await Referral.find({ referrer: req.user._id })
            .populate('job', 'title company companyLogo status')
            .populate('referredUser', 'f_name headline profilePic')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Your referrals fetched successfully",
            referrals
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.acceptReferral = async (req, res) => {
    try {
        const { id } = req.params;

        const referral = await Referral.findById(id).populate('job').populate('referredUser', 'f_name');
        if (!referral) {
            return res.status(404).json({ error: "Referral not found" });
        }

        if (!referral.job?.postedBy || referral.job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only the job poster can accept this referral" });
        }

        if (referral.status !== 'pending') {
            return res.status(400).json({ error: "This referral has already been reviewed" });
        }

        referral.status = 'interviewing';
        await referral.save();

        const candidateContent = `Good news! ${req.user.f_name} would like to interview you for ${referral.job.title} at ${referral.job.company}.`;
        await new NotificationModel({
            sender: req.user._id,
            receiver: referral.referredUser._id,
            content: candidateContent,
            type: "jobInterview",
            jobId: referral.job._id,
            referralId: referral._id
        }).save();

        if (referral.referrer.toString() !== req.user._id.toString()) {
            const referrerContent = `Your referral of ${referral.referredUser?.f_name || 'your connection'} for ${referral.job.title} at ${referral.job.company} was accepted — they're being invited to interview.`;
            await new NotificationModel({
                sender: req.user._id,
                receiver: referral.referrer,
                content: referrerContent,
                type: "jobInterview",
                jobId: referral.job._id,
                referralId: referral._id
            }).save();
        }

        return res.status(200).json({
            message: "Referral accepted — candidate and referrer notified",
            referral
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.hireReferral = async (req, res) => {
    try {
        const { id } = req.params;

        const referral = await Referral.findById(id).populate('job').populate('referredUser', 'f_name');
        if (!referral) {
            return res.status(404).json({ error: "Referral not found" });
        }

        if (!referral.job?.postedBy || referral.job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only the job poster can mark this as hired" });
        }

        if (referral.status !== 'interviewing') {
            return res.status(400).json({ error: "Candidate must be in the interview stage before being marked as hired" });
        }

        referral.status = 'hired';
        await referral.save();

        const referrer = await User.findById(referral.referrer);
        const hasPayoutInfo = !!(referrer?.payoutCardLast4);

        const content = hasPayoutInfo
            ? `${referral.referredUser?.f_name} was hired for ${referral.job.title} at ${referral.job.company}! Your referral payout will be sent to your saved payout details.`
            : `${referral.referredUser?.f_name} was hired for ${referral.job.title} at ${referral.job.company}! Add your payout details on your profile to receive your referral reward.`;

        await new NotificationModel({
            sender: req.user._id,
            receiver: referral.referrer,
            content,
            type: "referralHired",
            jobId: referral.job._id,
            referralId: referral._id
        }).save();

        return res.status(200).json({
            message: "Candidate marked as hired",
            referral
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.deleteReferral = async (req, res) => {
    try {
        const { id } = req.params;

        const referral = await Referral.findById(id).populate('job');
        if (!referral) {
            return res.status(404).json({ error: "Referral not found" });
        }

        const isPoster = referral.job?.postedBy?.toString() === req.user._id.toString();
        const isReferrer = referral.referrer.toString() === req.user._id.toString();

        if (!isPoster && !isReferrer) {
            return res.status(403).json({ error: "Not authorized to delete this referral" });
        }

        await Referral.findByIdAndDelete(id);

        return res.status(200).json({ message: "Referral deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};

exports.regenerateReferralCV = async (req, res) => {
    try {
        const { id } = req.params;

        const referral = await Referral.findById(id).populate('job').populate('referredUser');
        if (!referral) {
            return res.status(404).json({ error: "Referral not found" });
        }

        const isPoster = referral.job?.postedBy?.toString() === req.user._id.toString();
        const isReferrer = referral.referrer.toString() === req.user._id.toString();
        if (!isPoster && !isReferrer) {
            return res.status(403).json({ error: "Not authorized to regenerate this CV" });
        }

        const cv = await generateResumeForUser(referral.referredUser, referral.job);
        const { matchPercentage } = computeMatchScore(referral.referredUser, referral.job);

        referral.cv = cv;
        referral.matchPercentage = matchPercentage;
        await referral.save();

        return res.status(200).json({
            message: "CV regenerated successfully",
            referral
        });
    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ error: err.message || 'Server error' });
    }
};