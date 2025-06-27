require('dotenv').config();

// Then your other imports
const express = require('express');
const cors = require('cors');
const csvRoutes = require('./routes/csv'); // This loads after dotenv now
const { errorHandler, notFound } = require('./middleware/errorHandler');

// ADD THIS DEBUG CODE:
console.log('🔍 DEBUGGING ENVIRONMENT VARIABLES:');
console.log('  MOCK_SERVER_URL:', process.env.MOCK_SERVER_URL);
console.log('  PORT:', process.env.PORT);
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  Current working directory:', process.cwd());
console.log('  __dirname:', __dirname);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Water Quality Backend Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Routes
app.use('/api', csvRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL}`);
  console.log(`📊 CSV Source: ${process.env.MOCK_SERVER_URL}`); // Fixed this line
  console.log(`⏰ Cache TTL: ${process.env.CACHE_TTL} seconds`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('💤 SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('💤 SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
