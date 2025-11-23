const express = require('express');
const router = express.Router();
const multer = require('multer');
const { auth } = require('../middleware/auth');

// Lazy load cloudinary to avoid errors if not configured
let cloudinary;
try {
  cloudinary = require('cloudinary').v2;
} catch (error) {
  console.warn('Cloudinary package not found. Image uploads will not work.');
}

// Configure Cloudinary if available
if (cloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image size must be less than 5MB' });
      }
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    return res.status(400).json({ error: err.message || 'File upload error' });
  }
  next();
};

// Upload image to Cloudinary
router.post('/image', auth, upload.single('image'), handleMulterError, async (req, res) => {
  try {
    console.log('Upload request received');
    console.log('File:', req.file ? 'Present' : 'Missing');
    console.log('Request body keys:', Object.keys(req.body || {}));
    
    if (!req.file) {
      console.error('No file in request');
      return res.status(400).json({ error: 'No image file provided. Please select an image file.' });
    }

    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Check if Cloudinary is available and configured
    if (!cloudinary) {
      console.error('Cloudinary package not available');
      return res.status(500).json({ error: 'Image upload service not available. Please contact administrator.' });
    }

    const hasCloudName = !!process.env.CLOUDINARY_CLOUD_NAME;
    const hasApiKey = !!process.env.CLOUDINARY_API_KEY;
    const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;

    console.log('Cloudinary config check:', {
      hasCloudName,
      hasApiKey,
      hasApiSecret: !!hasApiSecret
    });

    if (!hasCloudName || !hasApiKey || !hasApiSecret) {
      console.error('Cloudinary credentials not configured');
      return res.status(500).json({ 
        error: 'Image upload service not configured. Please contact administrator.',
        details: 'Missing Cloudinary credentials in server configuration'
      });
    }

    // Convert buffer to base64
    console.log('Converting to base64...');
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    console.log('Uploading to Cloudinary...');
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'tournament-payment-proofs',
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' }
      ]
    });

    console.log('Upload successful:', result.secure_url);
    res.json({
      imageUrl: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    console.error('Error stack:', error.stack);
    // Provide more specific error message
    if (error.message && error.message.includes('Invalid')) {
      return res.status(400).json({ error: 'Invalid image file. Please try again with a valid image.' });
    }
    if (error.http_code) {
      return res.status(500).json({ 
        error: `Cloudinary error: ${error.message || 'Failed to upload image'}`,
        details: error.http_code === 401 ? 'Invalid Cloudinary credentials' : error.message
      });
    }
    res.status(500).json({ 
      error: error.message || 'Failed to upload image. Please try again.',
      details: 'Check server logs for more information'
    });
  }
});

module.exports = router;

