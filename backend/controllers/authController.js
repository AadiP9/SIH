const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { sendSmsOtp } = require('../services/otpService');

// Helper to generate a random 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

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
            // Ensure phone number is in E.164 format for Twilio
            const fullPhoneNumber = contact.startsWith('+') ? contact : `+91${contact}`;
            await sendSmsOtp(fullPhoneNumber, otp);
        } else {
            // Placeholder for an email service like SendGrid or Nodemailer
            console.log(`Email OTP for ${contact} is ${otp}`);
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

        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        
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

// @desc    Authenticate an official & get token
// @route   POST /api/auth/login/official
// @access  Public
const loginOfficial = async (req, res) => {
    // For officials, we assume employeeId is their email
    const { employeeId, password } = req.body; 

    try {
        const user = await User.findOne({ email: employeeId, role: 'official' });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
};


module.exports = { sendCitizenOtp, verifyCitizenOtp, loginOfficial };