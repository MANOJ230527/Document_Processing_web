const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const Job = require('../models/Job');
const { processFile } = require('../services/processor');

// POST /files/upload
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const { originalname, filename, mimetype, size, path: filePath } = req.file;

    // Create file document
    const fileDoc = await File.create({
      ownerId: req.user._id,
      originalName: originalname,
      filePath: filePath,
      mimeType: mimetype,
      size: size
    });

    // Create job document
    const job = await Job.create({
      fileId: fileDoc._id,
      ownerId: req.user._id,
      status: 'UPLOADED',
      progress: 0
    });

    // Start background processing (non-blocking)
    setImmediate(() => {
      processFile(job._id, fileDoc);
    });

    res.status(201).json({
      jobId: job._id,
      fileId: fileDoc._id,
      status: 'UPLOADED',
      fileName: originalname,
      message: 'File uploaded successfully. Processing will begin shortly.'
    });
  } catch (error) {
    console.error('Upload error:', error);
    // Clean up uploaded file if DB save fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'File upload failed. Please try again.' });
  }
};

// GET /files/:id/download — download original upload
const downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    // Ownership check
    if (file.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You do not own this file.' });
    }

    if (!fs.existsSync(file.filePath)) {
      return res.status(404).json({ error: 'File no longer exists on server.' });
    }

    res.download(file.filePath, file.originalName);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed. Please try again.' });
  }
};

module.exports = { uploadFile, downloadFile };
