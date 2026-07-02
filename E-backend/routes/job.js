const express = require('express');
const router = express.Router();
const JobController = require('../controller/job');
// Standardized to match your other files, adjust path if needed
const Authentication = require('../authentication/auth'); 

router.post('/post', Authentication.auth, JobController.postJob);
router.get('/all', JobController.getAllJobs);
router.get('/my-referrals', Authentication.auth, JobController.getMyReferrals);
router.get('/:id', JobController.getJobById);
router.post('/apply/:jobId', Authentication.auth, JobController.applyJob);
router.post('/refer/:jobId', Authentication.auth, JobController.referUser);
router.patch('/referral/:jobId/:referralId', Authentication.auth, JobController.updateReferralStatus);
router.delete('/:id', Authentication.auth, JobController.deleteJob);

module.exports = router;