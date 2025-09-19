const Report = require('../models/reportModel');
const User = require('../models/userModel');

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private (Citizen)
const createReport = async (req, res) => {
  const { category, description, longitude, latitude, address } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: 'Image is required' });
  }

  if (!category || !description || !longitude || !latitude) {
    return res.status(400).json({ message: 'Please fill all required fields' });
  }

  try {
    const report = new Report({
      user: req.user._id,
      category,
      description,
      imageUrl: req.file.path, // URL from Cloudinary
      location: {
        coordinates: [longitude, latitude],
        address: address || '',
      },
    });

    const createdReport = await report.save();

    // Award points to user for reporting
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 10 } });

    res.status(201).json(createdReport);
  } catch (error) {
    res.status(500).json({ message: 'Server Error: ' + error.message });
  }
};

// @desc    Get all reports (with filtering)
// @route   GET /api/reports
// @access  Public
const getReports = async (req, res) => {
    try {
        const { status, category } = req.query;
        const filter = {};

        if (status) filter.status = status; // e.g., ?status=Resolved
        if (category) filter.category = category; // e.g., ?category=Pothole

        const reports = await Report.find(filter)
            .populate('user', 'name') // Get user's name
            .sort({ createdAt: -1 }); // Newest first

        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Public
const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate('user', 'name');
    if (report) {
      res.json(report);
    } else {
      res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update report status
// @route   PUT /api/reports/:id
// @access  Private (Official)
const updateReportStatus = async (req, res) => {
  // Add role check: if (req.user.role !== 'official') ...
  const { status } = req.body;
  const validStatuses = ['Acknowledged', 'In Progress', 'Resolved'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    const report = await Report.findById(req.params.id);
    if (report) {
      report.status = status;
      const updatedReport = await report.save();

      // If resolved, award points to original reporter
      if (status === 'Resolved') {
        await User.findByIdAndUpdate(report.user, { $inc: { points: 50 } });
      }

      res.json(updatedReport);
    } else {
      res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Upvote a report
// @route   POST /api/reports/:id/upvote
// @access  Private (Citizen)
const upvoteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        
        // Check if user has already upvoted
        if (report.upvotes.includes(req.user._id)) {
            // Remove upvote
            report.upvotes.pull(req.user._id);
        } else {
            // Add upvote
            report.upvotes.push(req.user._id);
        }

        await report.save();
        res.json({ message: 'Vote registered', upvoteCount: report.upvotes.length });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
  upvoteReport,
};

const axios = require('axios');
// ... (keep existing functions)

// @desc    Transcribe a voice note to text
// @route   POST /api/reports/transcribe
// @access  Private
const transcribeVoiceNote = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Audio file is required.' });
    }

    try {
        // Step 1: Upload the audio file to AssemblyAI
        const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', req.file.buffer, {
            headers: {
                'authorization': process.env.ASSEMBLYAI_API_KEY,
                'Content-Type': 'application/octet-stream'
            }
        });
        const upload_url = uploadResponse.data.upload_url;

        // Step 2: Request transcription
        const transcribeResponse = await axios.post('https://api.assemblyai.com/v2/transcript', {
            audio_url: upload_url
        }, {
            headers: { 'authorization': process.env.ASSEMBLYAI_API_KEY }
        });
        const transcriptId = transcribeResponse.data.id;

        // Step 3: Poll for the transcription result
        const poll = async () => {
            const pollResponse = await axios.get(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
                headers: { 'authorization': process.env.ASSEMBLYAI_API_KEY }
            });

            if (pollResponse.data.status === 'completed') {
                res.json({ text: pollResponse.data.text });
            } else if (pollResponse.data.status === 'failed') {
                res.status(500).json({ message: 'Transcription failed.' });
            } else {
                setTimeout(poll, 3000); // Check again in 3 seconds
            }
        };
        poll();

    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.response.data.error });
    }
};

module.exports = {
  // ... (existing exports)
  transcribeVoiceNote
};