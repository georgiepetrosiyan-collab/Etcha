//E/E-backend/routes/job.js

const express = require('express');
const router = express.Router();
const Authentication = require('../authentication/auth');
const JobController = require('../controller/job');
const ReferralController = require('../controller/referral');

router.get('/', Authentication.auth, JobController.getAllJobs);
router.get('/:id/friend-matches', Authentication.auth, JobController.getFriendMatchesForJob);
router.get('/:id/applicants', Authentication.auth, JobController.getJobApplicants);
router.get('/:id/referrals', Authentication.auth, ReferralController.getReferralsForJob);
router.get('/:id', Authentication.auth, JobController.getJobById);
router.post('/create', Authentication.auth, JobController.createJob);
router.post('/:id/apply', Authentication.auth, JobController.applyToJob);
router.post('/refer', Authentication.auth, JobController.referConnection);
router.put('/:id/status', Authentication.auth, JobController.updateJobStatus);
router.delete('/:id', Authentication.auth, JobController.deleteJob);
router.post('/ats-check', Authentication.auth, JobController.checkATS);
module.exports = router;