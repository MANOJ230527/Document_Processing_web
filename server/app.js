require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const fileRoutes = require('./routes/files');
const jobRoutes = require('./routes/jobs');

const app = express();
const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
const clientBuildExists = fs.existsSync(clientBuildPath);

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000'].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads (protected via API, not direct access)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (clientBuildExists) {
  app.use(express.static(clientBuildPath));
}

// Routes
app.use('/auth', authRoutes);
app.use('/files', fileRoutes);
app.use('/jobs', jobRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

if (clientBuildExists) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 FileFlow server running on port ${PORT}`);
});
