const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'civicvoice-reports',
    format: async (req, file) => 'jpeg', // supports promises as well
    public_id: (req, file) => 'report-' + Date.now(),
  },
});

const multer = require('multer');
// ... (keep cloudinary config the same)

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|mp3|wav/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(file.originalname.split('.').pop());

    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('File type not supported. Only jpeg, jpg, png, and pdf are allowed.'), false);
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // Limit file size to 5MB
});

module.exports = { upload };

module.exports = { upload };