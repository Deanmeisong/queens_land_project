const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const archiver = require('archiver');
const router = express.Router();

// Initialize cache with TTL from environment
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL) || 300,
  checkperiod: 60,
  useClones: false,
});

// CSV file configurations
const CSV_FILES = {
  lab_reference: {
    filename: 'lab_reference_info.csv',
    cacheKey: 'lab_reference_csv',
    url: `${process.env.MOCK_SERVER_URL}/lab_reference_info.csv`,
  },
  sample_data: {
    filename: 'sample_data.csv',
    cacheKey: 'sample_data_csv',
    url: `${process.env.MOCK_SERVER_URL}/sample_data.csv`,
  },
  monitoring_sites: {
    filename: 'monitoring_sites.csv',
    cacheKey: 'monitoring_sites_csv',
    url: `${process.env.MOCK_SERVER_URL}/monitoring_sites.csv`,
  },
};

// Helper function to fetch CSV with caching
async function fetchCSVWithCache(fileConfig) {
  const startTime = Date.now();

  // Check cache first
  const cachedData = cache.get(fileConfig.cacheKey);
  if (cachedData) {
    console.log(`🎯 Serving ${fileConfig.filename} from cache`);
    return {
      data: cachedData,
      source: 'cache',
      responseTime: Date.now() - startTime,
    };
  }

  console.log(`🌐 Fetching ${fileConfig.filename} from:`, fileConfig.url);

  try {
    const response = await axios.get(fileConfig.url, {
      timeout: parseInt(process.env.REQUEST_TIMEOUT) || 10000,
      headers: {
        'User-Agent': 'Water-Quality-Portal/1.0',
        Accept: 'text/csv, text/plain, */*',
      },
      responseType: 'text',
    });

    // Validate response
    if (!response.data || typeof response.data !== 'string') {
      throw new Error(`Invalid CSV data received for ${fileConfig.filename}`);
    }

    // Basic CSV validation
    const lines = response.data.split('\n');
    if (lines.length < 2) {
      throw new Error(`${fileConfig.filename} appears to be empty or invalid`);
    }

    // Cache the successful response
    cache.set(fileConfig.cacheKey, response.data);

    console.log(
      `✅ ${fileConfig.filename} fetched successfully (${response.data.length} chars, ${lines.length} lines)`,
    );

    return {
      data: response.data,
      source: 'external',
      responseTime: Date.now() - startTime,
      size: response.data.length,
      lines: lines.length,
    };
  } catch (error) {
    console.error(`❌ Error fetching ${fileConfig.filename}:`, error.message);
    throw new Error(`Failed to fetch ${fileConfig.filename}: ${error.message}`);
  }
}

// Cache statistics endpoint
router.get('/cache-stats', (req, res) => {
  const stats = cache.getStats();
  const keys = cache.keys();

  res.json({
    stats,
    keys,
    cachedFiles: Object.keys(CSV_FILES).reduce((acc, key) => {
      acc[key] = cache.has(CSV_FILES[key].cacheKey);
      return acc;
    }, {}),
    cacheSize: cache.keys().length,
  });
});

// Clear cache endpoint
router.delete('/cache', (req, res) => {
  cache.flushAll();
  res.json({ message: 'Cache cleared successfully' });
});

// Individual CSV endpoints
router.get('/lab-reference-csv', async (req, res) => {
  try {
    const result = await fetchCSVWithCache(CSV_FILES.lab_reference);

    res.set({
      'Content-Type': 'text/csv',
      'Cache-Control': 'public, max-age=60',
      'X-Data-Source': result.source,
      'X-Response-Time': `${result.responseTime}ms`,
    });

    res.send(result.data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch lab reference CSV',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

router.get('/sample-data-csv', async (req, res) => {
  try {
    const result = await fetchCSVWithCache(CSV_FILES.sample_data);

    res.set({
      'Content-Type': 'text/csv',
      'Cache-Control': 'public, max-age=60',
      'X-Data-Source': result.source,
      'X-Response-Time': `${result.responseTime}ms`,
    });

    res.send(result.data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch sample data CSV',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

router.get('/monitoring-sites-csv', async (req, res) => {
  try {
    const result = await fetchCSVWithCache(CSV_FILES.monitoring_sites);

    res.set({
      'Content-Type': 'text/csv',
      'Cache-Control': 'public, max-age=60',
      'X-Data-Source': result.source,
      'X-Response-Time': `${result.responseTime}ms`,
    });

    res.send(result.data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch monitoring sites CSV',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Site Template Excel endpoint
router.get('/site-template-xlsx', async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.MOCK_SERVER_URL}/site_template.xlsx`,
      {
        timeout: 10000,
        responseType: 'arraybuffer',
      },
    );

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="site_template.xlsx"',
    });

    res.send(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch site template Excel',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Project Template Excel endpoint
router.get('/project-template-xlsx', async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.MOCK_SERVER_URL}/project_template.xlsx`,
      {
        timeout: 10000,
        responseType: 'arraybuffer',
      },
    );

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="project_template.xlsx"',
    });

    res.send(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch project template Excel',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Metadata Statement Template Excel endpoint
router.get('/metadata-statement-template-xlsx', async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.MOCK_SERVER_URL}/metadata_statement_template.xlsx`,
      {
        timeout: 10000,
        responseType: 'arraybuffer',
      },
    );

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition':
        'attachment; filename="metadata_statement_template.xlsx"',
    });

    res.send(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch metadata statement template Excel',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// NEW: Inhouse Laboratory Template Excel endpoint
router.get('/inhouse-laboratory-template-xlsx', async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.MOCK_SERVER_URL}/inhouse_laboratory_template.xlsx`,
      {
        timeout: 10000,
        responseType: 'arraybuffer',
      },
    );

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition':
        'attachment; filename="inhouse_laboratory_template.xlsx"',
    });

    res.send(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch inhouse laboratory template Excel',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Updated backend route in routes/csv.js
router.post('/download-zip', async (req, res) => {
  const startTime = Date.now();

  try {
    console.log('📦 Creating ZIP file with multiple laboratory CSV files...');

    // Get laboratory files from request body
    const { laboratoryFiles } = req.body;

    if (
      !laboratoryFiles ||
      !Array.isArray(laboratoryFiles) ||
      laboratoryFiles.length === 0
    ) {
      return res.status(400).json({
        error: 'Missing laboratory files',
        details: 'laboratoryFiles array is required in request body',
      });
    }

    console.log(
      `📊 Received ${laboratoryFiles.length} laboratory files:`,
      laboratoryFiles.map(file => file.filename),
    );

    // Validate laboratory files structure
    for (const labFile of laboratoryFiles) {
      if (!labFile.filename || !labFile.content) {
        return res.status(400).json({
          error: 'Invalid laboratory file structure',
          details:
            'Each laboratory file must have filename and content properties',
        });
      }
    }

    // Fetch all three CSV files concurrently (dummy files)
    console.log('🔄 Fetching dummy CSV files...');
    const csvPromises = Object.entries(CSV_FILES).map(async ([key, config]) => {
      try {
        const result = await fetchCSVWithCache(config);
        return {
          filename: config.filename,
          content: result.data,
          source: result.source,
        };
      } catch (error) {
        console.error(`Failed to fetch ${config.filename}:`, error.message);
        return {
          filename: config.filename,
          content: `Error: Failed to fetch ${config.filename}\n${error.message}`,
          source: 'error',
        };
      }
    });

    const dummyCSVFiles = await Promise.all(csvPromises);

    // Set response headers for ZIP download
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename="water_quality_data.zip"',
      'X-Response-Time': `${Date.now() - startTime}ms`,
    });

    // Create ZIP archive
    const archive = archiver('zip', {
      zlib: { level: 9 }, // Maximum compression
    });

    // Handle archive errors
    archive.on('error', err => {
      console.error('📦 Archive error:', err);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Failed to create ZIP archive',
          details: err.message,
        });
      }
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add all laboratory CSV files
    laboratoryFiles.forEach(labFile => {
      archive.append(labFile.content, { name: labFile.filename });
      console.log(`📄 Added laboratory file: ${labFile.filename}`);
    });

    // Add all fetched dummy CSV files
    dummyCSVFiles.forEach(file => {
      archive.append(file.content, { name: file.filename });
      console.log(
        `📄 Added dummy file: ${file.filename} (source: ${file.source})`,
      );
    });

    // Add a README file with metadata
    const labFilesList = laboratoryFiles
      .map(
        (file, index) =>
          `${index + 1}. ${file.filename} - Laboratory-specific analysis data`,
      )
      .join('\n');

    const readmeContent = `Water Quality Data Export
Generated: ${new Date().toISOString()}

Files included:

Laboratory Analysis Files:
${labFilesList}

Reference Data Files:
${
  laboratoryFiles.length + 1
}. lab_reference_info.csv - Laboratory reference information
${laboratoryFiles.length + 2}. sample_data.csv - Sample data
${
  laboratoryFiles.length + 3
}. monitoring_sites.csv - Monitoring sites information

Additional Files:
${laboratoryFiles.length + 4}. README.txt - This file

Total files: ${laboratoryFiles.length + 4}
Laboratory files: ${laboratoryFiles.length}
Reference files: 3
Archive created by: Water Quality Portal
`;

    archive.append(readmeContent, { name: 'README.txt' });
    console.log('📄 Added README.txt');

    // Finalize the archive
    await archive.finalize();

    console.log(
      `✅ ZIP file created successfully in ${Date.now() - startTime}ms`,
    );
    console.log(`📊 Total files in ZIP: ${laboratoryFiles.length + 4}`);
  } catch (error) {
    console.error('❌ Error creating ZIP:', error);

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to create ZIP file',
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }
});

// Get all CSV files info
router.get('/csv-info', (req, res) => {
  const info = Object.entries(CSV_FILES).map(([key, config]) => ({
    key,
    filename: config.filename,
    url: config.url,
    cached: cache.has(config.cacheKey),
    endpoint: `/api/${key.replace('_', '-')}-csv`,
  }));

  res.json({
    message: 'Available CSV files',
    files: info,
    totalFiles: info.length,
    zipEndpoint: '/api/download-zip',
  });
});

// Download README Markdown endpoint
router.get('/download-readme-md', async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.MOCK_SERVER_URL}/download_readme.md`,
      {
        timeout: 10000,
        responseType: 'text',
        headers: {
          'User-Agent': 'Water-Quality-Portal/1.0',
          Accept: 'text/markdown, text/plain, */*',
        },
      },
    );

    res.set({
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=60',
      'Content-Disposition': 'inline',
    });

    res.send(response.data);
  } catch (error) {
    console.error('❌ Error fetching download README:', error.message);
    res.status(500).json({
      error: 'Failed to fetch download README',
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

module.exports = router;
