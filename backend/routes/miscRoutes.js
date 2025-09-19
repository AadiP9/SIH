const express = require('express');
const router = express.Router();
const Question = require('../models/questionModel');

// @desc    Submit a question from the contact form
// @route   POST /api/misc/submit-question
// @access  Public
router.post('/submit-question', async (req, res) => {
    const { name, email, question } = req.body;
    try {
        await Question.create({ name, email, question });
        res.status(201).json({ message: 'Your question has been submitted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error, please try again.' });
    }
});

module.exports = router;