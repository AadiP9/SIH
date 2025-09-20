const express = require('express');
const router = express.Router();
const {
  sendCitizenOtp,
  verifyCitizenOtp,
  loginOfficial,
} = require('../controllers/authController');

// @route   POST /api/auth/send-otp
// @desc    Send an OTP to a citizen's phone or email
router.post('/send-otp', sendCitizenOtp);

// @route   POST /api/auth/verify-otp
// @desc    Verify the OTP and log the citizen in, returning a JWT
router.post('/verify-otp', verifyCitizenOtp);

// @route   POST /api/auth/login/official
// @desc    Login for officials with employeeId and password
router.post('/login/official', loginOfficial);

module.exports = router;