//E/E-backend/routes/cv.js

const express = require('express');
const router = express.Router();
const Authentication = require('../authentication/auth');
const CVController = require('../controller/cv');

router.post('/generate', Authentication.auth, CVController.generateCV);

module.exports = router;