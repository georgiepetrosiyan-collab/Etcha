//E/E-backend/controller/job.js

const Job = require('../models/job');
const User = require('../models/user');
const Referral = require('../models/referral');
const NotificationModel = require('../models/notification');
const { computeMatchScore } = require('../utils/matchScore');
const { generateResumeForUser } = require('../utils/generateResume');

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        const selfId = req.user._id.toString();

        const availableJobs = [];
        const myJobs = [];

        jobs.forEach(job => {
            const jobObj = job.toObject();
            const isOwner = job.postedBy?.toString() === selfId;

            if (isOwner) {
                myJobs.push({
                    ...jobObj,
                    applicantCount: jobObj.applications?.length || jobObj.applicants?.length || 0,
                    applications: undefined
                });
            } else {
                if (jobObj.status === 'closed') return;
                const { matchPercentage } = computeMatchScore(req.user, job);
                const cleanJobObj = { ...jobObj };
                delete cleanJobObj.applications;
                availableJobs.push({ ...cleanJobObj, matchPercentage });
            }
        });

        availableJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
        myJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return res.status(200).json({
            message: "Jobs fetched successfully",
            availableJobs,
            myJobs
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.referConnection = async (req, res) => {
    try {
        const { jobId, connectionId } = req.body;
        const selfId = req.user._id;

        if (!jobId || !connectionId) {
            return res.status(400).json({ error: "Job ID and connection ID are required" });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        const isFriend = req.user.friends.some(id => id.toString() === connectionId.toString());
        if (!isFriend) {
            return res.status(400).json({ error: "You can only refer your connections" });
        }

        const alreadyReferred = await Referral.findOne({ job: jobId, referrer: selfId, referredUser: connectionId });
        if (alreadyReferred) {
            return res.status(400).json({ error: "You already referred this connection to this job" });
        }

        const referredUserDoc = await User.findById(connectionId);
        if (!referredUserDoc) {
            return res.status(404).json({ error: "Connection not found" });
        }

        let cv = undefined;
        const { matchPercentage } = computeMatchScore(referredUserDoc, job);
        try {
            cv = await generateResumeForUser(referredUserDoc, job);
        } catch (genErr) {
            console.error("Auto-CV generation for referral failed:", genErr.message);
        }

        const referral = new Referral({
            job: jobId,
            referrer: selfId,
            referredUser: connectionId,
            cv,
            matchPercentage
        });
        await referral.save();

        const content = `${req.user.f_name} referred you for a job: ${job.title} at ${job.company}`;
        await new NotificationModel({
            sender: selfId, receiver: connectionId, content, type: "jobReferral", jobId: job._id
        }).save();

        return res.status(200).json({ message: "Referral sent successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getJobById = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        const { matchPercentage } = computeMatchScore(req.user, job);
        const jobObj = job.toObject();
        const isOwner = job.postedBy?.toString() === req.user._id.toString();

        if (!isOwner) {
            delete jobObj.applications;
        }

        return res.status(200).json({
            message: "Job fetched successfully",
            job: { ...jobObj, matchPercentage },
            isOwner
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.createJob = async (req, res) => {
    try {
        const { title, company, companyLogo, location, type, salary, description, fullDescription } = req.body;

        if (!title || !company) {
            return res.status(400).json({ error: "Title and company are required" });
        }

        const newJob = new Job({
            title, company, companyLogo, location, type, salary, description, fullDescription,
            postedBy: req.user._id
        });

        await newJob.save();

        return res.status(201).json({ message: "Job created successfully", job: newJob });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.applyToJob = async (req, res) => {
    try {
        const { id } = req.params;
        const { cv, matchPercentage } = req.body;
        const selfId = req.user._id;

        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        if (job.status === 'closed') {
            return res.status(400).json({ error: "This position is no longer accepting applications" });
        }

        const alreadyApplied = job.applications.some(a => a.applicant.toString() === selfId.toString());
        if (alreadyApplied) {
            return res.status(400).json({ error: "You already applied to this job" });
        }

        job.applications.push({
            applicant: selfId,
            cv: cv || undefined,
            matchPercentage: typeof matchPercentage === 'number' ? matchPercentage : undefined,
            appliedAt: new Date()
        });

        if (!job.applicants.some(a => a.toString() === selfId.toString())) {
            job.applicants.push(selfId);
        }

        await job.save();

        await User.findByIdAndUpdate(selfId, { $addToSet: { applied_jobs: job._id } });

        if (job.postedBy && job.postedBy.toString() !== selfId.toString()) {
            const content = `${req.user.f_name} applied to your job: ${job.title}`;
            const notification = new NotificationModel({
                sender: selfId, receiver: job.postedBy, content, type: "jobApplication", jobId: job._id
            });
            await notification.save();
        }

        return res.status(200).json({ message: "Applied to job successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getJobApplicants = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id)
            .populate('applications.applicant', 'f_name headline profilePic curr_company curr_location');

        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        if (!job.postedBy || job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only the job poster can view applicants" });
        }

        const sortedApplications = [...job.applications].sort(
            (a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0)
        );

        return res.status(200).json({
            message: "Applicants fetched successfully",
            job: { _id: job._id, title: job.title, company: job.company },
            applications: sortedApplications
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.updateJobStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['open', 'closed'].includes(status)) {
            return res.status(400).json({ error: "Status must be 'open' or 'closed'" });
        }

        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        if (!job.postedBy || job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only the job poster can update this job" });
        }

        job.status = status;
        await job.save();

        return res.status(200).json({
            message: status === 'closed' ? "Vacancy closed" : "Vacancy reopened",
            job
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.deleteJob = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        if (!job.postedBy || job.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: "Only the job poster can delete this job" });
        }

        await Job.findByIdAndDelete(id);

        return res.status(200).json({ message: "Job deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.referConnection = async (req, res) => {
    try {
        const { jobId, connectionId } = req.body;
        const selfId = req.user._id;

        if (!jobId || !connectionId) {
            return res.status(400).json({ error: "Job ID and connection ID are required" });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        const isFriend = req.user.friends.some(id => id.toString() === connectionId.toString());
        if (!isFriend) {
            return res.status(400).json({ error: "You can only refer your connections" });
        }

        const alreadyReferred = await Referral.findOne({ job: jobId, referrer: selfId, referredUser: connectionId });
        if (alreadyReferred) {
            return res.status(400).json({ error: "You already referred this connection to this job" });
        }

        const referredUserDoc = await User.findById(connectionId);
        if (!referredUserDoc) {
            return res.status(404).json({ error: "Connection not found" });
        }

        // Best-effort: auto-generate a tailored CV for the referred person.
        // If AI generation fails, the referral still goes through — the poster
        // can retry generating the CV later from the Referrals view.
        let cv = undefined;
        const { matchPercentage } = computeMatchScore(referredUserDoc, job);
        try {
            cv = await generateResumeForUser(referredUserDoc, job);
        } catch (genErr) {
            console.error("Auto-CV generation for referral failed:", genErr.message);
        }

        const referral = new Referral({
            job: jobId,
            referrer: selfId,
            referredUser: connectionId,
            cv,
            matchPercentage
        });
        await referral.save();

        const content = `${req.user.f_name} referred you for a job: ${job.title} at ${job.company}`;
        const notification = new NotificationModel({
            sender: selfId, receiver: connectionId, content, type: "jobReferral", jobId: job._id
        });
        await notification.save();

        return res.status(200).json({ message: "Referral sent successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.getFriendMatchesForJob = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        const selfWithFriends = await User.findById(req.user._id).populate('friends', '-password');
        const friends = selfWithFriends?.friends || [];

        const friendsWithMatch = friends.map(friend => {
            const { matchPercentage } = computeMatchScore(friend, job);
            return {
                _id: friend._id, f_name: friend.f_name, headline: friend.headline,
                profilePic: friend.profilePic, matchPercentage
            };
        });

        friendsWithMatch.sort((a, b) => b.matchPercentage - a.matchPercentage);

        return res.status(200).json({ message: "Friend matches fetched successfully", friends: friendsWithMatch });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}