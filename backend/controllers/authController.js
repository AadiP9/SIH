const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { sendSmsOtp } = require('../services/otpService'); // Import the service

// Helper to generate a random 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Send OTP to a citizen for login/registration
// @route   POST /api/auth/send-otp
// @access  Public
const sendCitizenOtp = async (req, res) => {
    const { contact } = req.body;
    if (!contact) return res.status(400).json({ message: 'Contact is required' });

    const isEmail = contact.includes('@');
    const query = isEmail ? { email: contact } : { phone: contact };
    
    try {
        let user = await User.findOne(query);
        if (!user) {
            user = await User.create({ ...query, role: 'citizen' });
        }

        const otp = generateOtp();
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
        await user.save();

        // Send the OTP
        if (!isEmail) {
            // IMPORTANT: Add country code if missing. This example assumes Indian numbers.
            const fullPhoneNumber = contact.startsWith('+') ? contact : `+91${contact}`;
            await sendSmsOtp(fullPhoneNumber, otp);
        } else {
            // TODO: Implement sendEmailOtp using Nodemailer here
            console.log(`Email OTP for ${contact} is ${otp}`); // Placeholder
        }

        res.status(200).json({ message: 'OTP sent successfully.' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Verify OTP and return JWT token
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyCitizenOtp = async (req, res) => {
    const { contact, otp } = req.body;
    if (!contact || !otp) return res.status(400).json({ message: 'Contact and OTP are required' });

    const isEmail = contact.includes('@');
    const query = isEmail ? { email: contact } : { phone: contact };

    try {
        const user = await User.findOne({
            ...query,
            otp: otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid OTP or OTP has expired.' });
        }

        // Clear OTP fields after successful verification
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        
        const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

        res.status(200).json({
            _id: user._id,
            contact: isEmail ? user.email : user.phone,
            role: user.role,
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// Keep loginOfficial the same
// ...
module.exports = { sendCitizenOtp, verifyCitizenOtp, loginOfficial /*, etc */ };