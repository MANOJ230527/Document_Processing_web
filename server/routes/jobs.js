const express = require('express');
const router = express.Router();
const { getJobs, getJobById, downloadOutput } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getJobs);
router.get('/:id', protect, getJobById);
router.get('/:id/output', protect, downloadOutput);

module.exports = router;
