const express = require('express');
const {
  registerCitizen,
  loginOfficial,
} = require('../controllers/authController');
const router = express.Router();

// NOTE: For a real app, OTP verification would be a separate step.
// This is a simplified version for demonstration.
router.post('/register', registerCitizen);
router.post('/login/official', loginOfficial);
router.post('/send-otp', sendCitizenOtp);
router.post('/verify-otp', verifyCitizenOtp);
router.post('/login/official', loginOfficial);

module.exports = router;