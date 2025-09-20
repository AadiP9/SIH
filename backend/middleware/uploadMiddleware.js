const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // For audio files, save them as raw files in a 'voice-notes' folder
    if (file.mimetype.startsWith('audio/')) {
      return {
        folder: 'civicvoice-voicenotes',
        resource_type: 'raw', // Important for non-image files
        public_id: 'voicenote-' + Date.now(),
      };
    }
    // For image files, save them in the 'reports' folder
    return {
      folder: 'civicvoice-reports',
      format: 'jpeg',
      public_id: 'report-' + Date.now(),
    };
  },
});

// Filter to allow specific image and audio file types
const fileFilter = (req, file, cb) => {
    // Allow images and common audio formats
    const allowedTypes = /jpeg|jpg|png|mp3|wav|m4a|mpeg/;
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype) {
        return cb(null, true);
    }
    cb(new Error('File type not supported. Only images (jpeg, png) and audio (mp3, wav) are allowed.'), false);
};

// Configure multer with the storage, file filter, and size limits
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 10 } // Limit file size to 10MB
});

module.exports = { upload };