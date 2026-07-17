//E/E-backend/routes/referral.js

const express = require('express');
const router = express.Router();
const Authentication = require('../authentication/auth');
const ReferralController = require('../controller/referral');

router.get('/mine', Authentication.auth, ReferralController.getMyReferrals);
router.put('/:id/accept', Authentication.auth, ReferralController.acceptReferral);
router.put('/:id/hire', Authentication.auth, ReferralController.hireReferral);
router.post('/:id/regenerate-cv', Authentication.auth, ReferralController.regenerateReferralCV);
router.delete('/:id', Authentication.auth, ReferralController.deleteReferral);

module.exports = router;