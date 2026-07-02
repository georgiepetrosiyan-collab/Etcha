const jobModel = require('../models/job');
const userModel = require('../models/user');

exports.postJob = async (req, res) => {
    try {
        const job = new jobModel({
            ...req.body,
            posted_by: req.user._id
        });
        await job.save();
        res.status(201).json({ message: "Job posted successfully", job });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await jobModel.find()
            .populate('posted_by', 'f_name headline profilePic')
            .sort({ createdAt: -1 });
        res.status(200).json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getJobById = async (req, res) => {
    try {
        const job = await jobModel.findById(req.params.id)
            .populate('posted_by', 'f_name headline profilePic')
            .populate('applicants.user', 'f_name headline profilePic')
            .populate('referrals.referred_by', 'f_name headline profilePic')
            .populate('referrals.referred_to', 'f_name headline profilePic');
        if (!job) return res.status(404).json({ message: "Job not found" });
        res.status(200).json(job);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.applyJob = async (req, res) => {
    try {
        const userId = req.user._id;
        const job = await jobModel.findById(req.params.jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });

        const alreadyApplied = job.applicants.find(a => a.user.toString() === userId.toString());
        if (alreadyApplied) return res.status(400).json({ message: "Already applied" });

        job.applicants.push({ user: userId });
        await job.save();

        await userModel.findByIdAndUpdate(userId, {
            $push: { applied_jobs: job._id }
        });

        res.status(200).json({ message: "Applied successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const job = await jobModel.findById(req.params.id);
        if (!job) return res.status(404).json({ message: "Job not found" });

        if (job.posted_by.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this job" });
        }

        await jobModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Job deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.referUser = async (req, res) => {
    try {
        const referredBy = req.user._id;
        const { referred_to, message } = req.body;
        const { jobId } = req.params;

        const isFriend = req.user.friends.find(id => id.toString() === referred_to);
        if (!isFriend) {
            return res.status(400).json({ error: "You can only refer your connections" });
        }

        const job = await jobModel.findById(jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });

        const alreadyReferred = job.referrals.find(
            r => r.referred_to.toString() === referred_to &&
                 r.referred_by.toString() === referredBy.toString()
        );
        if (alreadyReferred) {
            return res.status(400).json({ error: "You already referred this person for this job" });
        }

        job.referrals.push({ referred_by: referredBy, referred_to, message });
        await job.save();

        res.status(200).json({ message: "Referral sent successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMyReferrals = async (req, res) => {
    try {
        const userId = req.user._id;
        const jobs = await jobModel.find({ 'referrals.referred_to': userId })
            .populate('posted_by', 'f_name headline profilePic')
            .populate('referrals.referred_by', 'f_name headline profilePic');

        const myReferrals = jobs.map(job => ({
            job: {
                _id: job._id,
                title: job.title,
                company: job.company,
                location: job.location,
                job_type: job.job_type,
            },
            referrals: job.referrals.filter(r => r.referred_to.toString() === userId.toString())
        }));

        res.status(200).json(myReferrals);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateReferralStatus = async (req, res) => {
    try {
        const { jobId, referralId } = req.params;
        const { status } = req.body;

        const job = await jobModel.findById(jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });

        const referral = job.referrals.id(referralId);
        if (!referral) return res.status(404).json({ message: "Referral not found" });

        if (referral.referred_to.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Not authorized" });
        }

        referral.status = status;
        await job.save();

        if (status === 'accepted') {
            const alreadyApplied = job.applicants.find(a => a.user.toString() === req.user._id.toString());
            if (!alreadyApplied) {
                job.applicants.push({ user: req.user._id });
                await job.save();
                await userModel.findByIdAndUpdate(req.user._id, {
                    $push: { applied_jobs: job._id }
                });
            }
        }

        res.status(200).json({ message: `Referral ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};