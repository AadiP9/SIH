const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  upvoteReport,
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware'); // You'll create this next
const { transcribeVoiceNote } = require('../controllers/reportController');
// ...
router.post('/transcribe', protect, upload.single('audio'), transcribeVoiceNote);
router.route('/')
  .post(protect, upload.single('image'), createReport) // 'image' should match the form field name
  .get(getReports);

router.route('/:id')
  .get(getReportById)
  .put(protect, updateReportStatus); // Add official role check here later

router.route('/:id/upvote').post(protect, upvoteReport);

module.exports = router;