const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  upvoteReport,
  transcribeVoiceNote,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// @route   GET /api/reports
// @desc    Get all reports (publicly accessible)
router.get('/', getReports);

// @route   POST /api/reports
// @desc    Create a new report (requires login, handles image upload)
router.post('/', protect, upload.single('image'), createReport);

// @route   POST /api/reports/transcribe
// @desc    Transcribe a voice note (requires login, handles audio upload)
router.post('/transcribe', protect, upload.single('audio'), transcribeVoiceNote);

// @route   GET /api/reports/:id
// @desc    Get a single report by its ID (publicly accessible)
router.get('/:id', getReportById);

// @route   PUT /api/reports/:id
// @desc    Update a report's status (restricted to logged-in officials)
router.put('/:id', protect, updateReportStatus);

// @route   POST /api/reports/:id/upvote
// @desc    Upvote or remove upvote from a report (requires login)
router.post('/:id/upvote', protect, upvoteReport);

module.exports = router;