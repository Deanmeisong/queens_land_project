// In mock-server/server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.MOCK_PORT || 8080;

// Enable CORS for all origins
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['*'],
  }),
);

// Serve static files with proper headers for CSV, Excel, and Markdown
app.use(
  '/wqinv_templates',
  express.static(path.join(__dirname, 'public/wqinv_templates'), {
    setHeaders: (res, filePath) => {
      // CSV files
      if (filePath.endsWith('.csv')) {
        res.set({
          'Content-Type': 'text/csv',
          'Content-Disposition': 'inline',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        });
      }
      // Excel files (.xlsx)
      else if (filePath.endsWith('.xlsx')) {
        res.set({
          'Content-Type':
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': 'attachment',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        });
      }
      // Markdown files (.md)
      else if (filePath.endsWith('.md')) {
        res.set({
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': 'inline',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        });
      }
    },
  }),
);

// Root endpoint - list available files (updated to include Markdown)
app.get('/', (req, res) => {
  const templatesDir = path.join(__dirname, 'public/wqinv_templates');

  try {
    const files = fs
      .readdirSync(templatesDir)
      .filter(
        file =>
          file.endsWith('.csv') ||
          file.endsWith('.xlsx') ||
          file.endsWith('.md'),
      )
      .map(file => ({
        name: file,
        url: `http://localhost:${PORT}/wqinv_templates/${file}`,
        size: fs.statSync(path.join(templatesDir, file)).size,
        type: file.endsWith('.csv')
          ? 'CSV'
          : file.endsWith('.xlsx')
          ? 'Excel'
          : 'Markdown',
      }));

    res.json({
      message: 'Mock CSV/Excel/Markdown Server - Available Files',
      baseUrl: `http://localhost:${PORT}`,
      files: files,
      totalFiles: files.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Unable to read files directory' });
  }
});

// 404 handler (updated endpoints)
app.use((req, res) => {
  res.status(404).json({
    error: 'File not found',
    path: req.path,
    availableEndpoints: [
      `http://localhost:${PORT}/`,
      `http://localhost:${PORT}/wqinv_templates/lab_reference_info.csv`,
      `http://localhost:${PORT}/wqinv_templates/sample_data.csv`,
      `http://localhost:${PORT}/wqinv_templates/monitoring_sites.csv`,
      `http://localhost:${PORT}/wqinv_templates/site_template.xlsx`,
      `http://localhost:${PORT}/wqinv_templates/project_template.xlsx`,
      `http://localhost:${PORT}/wqinv_templates/metadata_statement_template.xlsx`,
      `http://localhost:${PORT}/wqinv_templates/inhouse_laboratory_template.xlsx`,
      `http://localhost:${PORT}/wqinv_templates/download_readme.md`,
    ],
  });
});

app.listen(PORT, () => {
  console.log(
    `🎭 Mock CSV/Excel/Markdown Server running on http://localhost:${PORT}`,
  );
  console.log(`📁 Serving files from: ./public/wqinv_templates/`);
  console.log(`📋 Available endpoints:`);
  console.log(`   • http://localhost:${PORT}/ (file listing)`);
  console.log(`   📄 CSV Files:`);
  console.log(
    `   • http://localhost:${PORT}/wqinv_templates/lab_reference_info.csv`,
  );
  console.log(`   • http://localhost:${PORT}/wqinv_templates/sample_data.csv`);
  console.log(
    `   • http://localhost:${PORT}/wqinv_templates/monitoring_sites.csv`,
  );
  console.log(`   📊 Excel Templates:`);
  console.log(
    `   • http://localhost:${PORT}/wqinv_templates/site_template.xlsx`,
  );
  console.log(
    `   • http://localhost:${PORT}/wqinv_templates/project_template.xlsx`,
  );
  console.log(
    `   • http://localhost:${PORT}/wqinv_templates/metadata_statement_template.xlsx`,
  );
  console.log(
    `   • http://localhost:${PORT}/wqinv_templates/inhouse_laboratory_template.xlsx`,
  );
  console.log(`   📝 Markdown Files:`);
  console.log(
    `   • http://localhost:${PORT}/wqinv_templates/download_readme.md`,
  );
  console.log(`🔧 Health check: http://localhost:${PORT}/health`);
});
