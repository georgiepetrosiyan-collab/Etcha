//E/E-backend/controller/job.js

const Job = require('../models/job');
const User = require('../models/user');
const Referral = require('../models/referral');
const NotificationModel = require('../models/notification');

exports.getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Jobs fetched successfully",
            jobs
        });
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

        return res.status(200).json({
            message: "Job fetched successfully",
            job
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
            title,
            company,
            companyLogo,
            location,
            type,
            salary,
            description,
            fullDescription,
            postedBy: req.user._id
        });

        await newJob.save();

        return res.status(201).json({
            message: "Job created successfully",
            job: newJob
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}

exports.applyToJob = async (req, res) => {
    try {
        const { id } = req.params;
        const selfId = req.user._id;

        const job = await Job.findById(id);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        const alreadyApplied = job.applicants.some(a => a.toString() === selfId.toString());
        if (alreadyApplied) {
            return res.status(400).json({ error: "You already applied to this job" });
        }

        job.applicants.push(selfId);
        await job.save();

        await User.findByIdAndUpdate(selfId, {
            $addToSet: { applied_jobs: job._id }
        });

        return res.status(200).json({
            message: "Applied to job successfully"
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

        const referral = new Referral({
            job: jobId,
            referrer: selfId,
            referredUser: connectionId
        });
        await referral.save();

        const content = `${req.user.f_name} referred you for a job: ${job.title} at ${job.company}`;
        const notification = new NotificationModel({
            sender: selfId,
            receiver: connectionId,
            content,
            type: "jobReferral",
            jobId: job._id
        });
        await notification.save();

        return res.status(200).json({
            message: "Referral sent successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error', message: err.message });
    }
}