const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 8080; // Different port to avoid conflicts

// Enable CORS for all origins (like the real server)
app.use(cors({
  origin: '*',
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['*']
}));

// Serve static files from public directory
app.use('/wqinv_templates', express.static(path.join(__dirname, 'public/wqinv_templates'), {
  setHeaders: (res, filePath) => {
    // Set proper CSV headers
    if (filePath.endsWith('.csv')) {
      res.set({
        'Content-Type': 'text/csv',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      });
    }
  }
}));

// Root endpoint - list available files
app.get('/', (req, res) => {
  const templatesDir = path.join(__dirname, 'public/wqinv_templates');
  
  try {
    const files = fs.readdirSync(templatesDir)
      .filter(file => file.endsWith('.csv'))
      .map(file => ({
        name: file,
        url: `http://localhost:${PORT}/wqinv_templates/${file}`,
        size: fs.statSync(path.join(templatesDir, file)).size
      }));
    
    res.json({
      message: 'Mock CSV Server - Available Files',
      baseUrl: `http://localhost:${PORT}`,
      files: files,
      totalFiles: files.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Unable to read files directory' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Mock CSV Server is running',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'File not found',
    path: req.path,
    availableEndpoints: [
      `http://localhost:${PORT}/`,
      `http://localhost:${PORT}/wqinv_templates/lab_reference_info.csv`,
      `http://localhost:${PORT}/wqinv_templates/sample_data.csv`,
      `http://localhost:${PORT}/wqinv_templates/monitoring_sites.csv`
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🎭 Mock CSV Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ./public/wqinv_templates/`);
  console.log(`📋 Available endpoints:`);
  console.log(`   • http://localhost:${PORT}/ (file listing)`);
  console.log(`   • http://localhost:${PORT}/wqinv_templates/lab_reference_info.csv`);
  console.log(`   • http://localhost:${PORT}/wqinv_templates/sample_data.csv`);
  console.log(`   • http://localhost:${PORT}/wqinv_templates/monitoring_sites.csv`);
  console.log(`🔧 Health check: http://localhost:${PORT}/health`);
});