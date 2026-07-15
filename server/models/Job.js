const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['UPLOADED', 'PROCESSING', 'DONE', 'FAILED'],
    default: 'UPLOADED'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  errorMessage: {
    type: String,
    default: null
  },
  outputPath: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', jobSchema);
