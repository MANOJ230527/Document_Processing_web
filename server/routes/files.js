const express = require('express');
const router = express.Router();
const { uploadFile, downloadFile } = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Handle multer errors
const handleUpload = (req, res, next) => {
  const uploadSingle = upload.single('file');
  uploadSingle(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 10 MB.' });
      }
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

router.post('/upload', protect, handleUpload, uploadFile);
router.get('/:id/download', protect, downloadFile);

module.exports = router;
