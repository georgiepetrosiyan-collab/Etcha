//E/E-backend/controller/cv.js

const Job = require('../models/job');
const { generateResumeForUser } = require('../utils/generateResume');

exports.generateCV = async (req, res) => {
    try {
        const { jobId } = req.body;

        if (!jobId) {
            return res.status(400).json({ error: "Job ID is required" });
        }

        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        const cv = await generateResumeForUser(req.user, job);

        return res.status(200).json({
            message: "CV generated successfully",
            cv,
            job: { _id: job._id, title: job.title, company: job.company }
        });

    } catch (err) {
        console.error(err);
        res.status(err.status || 500).json({ error: err.message || 'Server error' });
    }
};