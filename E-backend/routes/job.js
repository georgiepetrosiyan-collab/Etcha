//E/E-backend/routes/job.js

const express = require('express');
const router = express.Router();
const Authentication = require('../authentication/auth');
const JobController = require('../controller/job');

router.get('/', Authentication.auth, JobController.getAllJobs);
router.get('/:id', Authentication.auth, JobController.getJobById);
router.post('/create', Authentication.auth, JobController.createJob);
router.post('/:id/apply', Authentication.auth, JobController.applyToJob);
router.post('/refer', Authentication.auth, JobController.referConnection);

module.exports = router;