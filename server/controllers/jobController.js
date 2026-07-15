const fs = require('fs');
const path = require('path');
const Job = require('../models/Job');
const File = require('../models/File');

// GET /jobs — list all jobs for logged-in user
const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ ownerId: req.user._id })
      .populate('fileId', 'originalName mimeType size createdAt')
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to retrieve jobs.' });
  }
};

// GET /jobs/:id — get specific job status
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('fileId', 'originalName mimeType size createdAt');

    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Ownership check
    if (job.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You do not own this job.' });
    }

    res.json({ job });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to retrieve job.' });
  }
};

// GET /jobs/:id/output — download processed output
const downloadOutput = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ error: 'Job not found.' });
    }

    // Ownership check
    if (job.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You do not own this job.' });
    }

    if (job.status !== 'DONE') {
      return res.status(400).json({ error: 'Output not ready. Job is not yet complete.' });
    }

    if (!job.outputPath || !fs.existsSync(job.outputPath)) {
      return res.status(404).json({ error: 'Output file not found on server.' });
    }

    const outputFilename = path.basename(job.outputPath);
    res.download(job.outputPath, outputFilename);
  } catch (error) {
    console.error('Download output error:', error);
    res.status(500).json({ error: 'Failed to download output.' });
  }
};

module.exports = { getJobs, getJobById, downloadOutput };
