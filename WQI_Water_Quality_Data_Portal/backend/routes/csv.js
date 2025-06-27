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

// New endpoint: Download ZIP with all CSVs + custom analysis CSV
router.post('/download-zip', async (req, res) => {
  const startTime = Date.now();

  try {
    console.log('📦 Creating ZIP file with all CSVs...');

    // Get custom analysis CSV content from request body
    const { analysisCSVContent, filename = 'analysis_data.csv' } = req.body;

    if (!analysisCSVContent) {
      return res.status(400).json({
        error: 'Missing analysis CSV content',
        details: 'analysisCSVContent is required in request body',
      });
    }

    // Fetch all three CSV files concurrently
    console.log('🔄 Fetching all CSV files...');
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

    const csvFiles = await Promise.all(csvPromises);

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

    // Add the custom analysis CSV
    archive.append(analysisCSVContent, { name: filename });
    console.log(`📄 Added custom analysis CSV: ${filename}`);

    // Add all fetched CSV files
    csvFiles.forEach(file => {
      archive.append(file.content, { name: file.filename });
      console.log(`📄 Added ${file.filename} (source: ${file.source})`);
    });

    // Add a README file with metadata
    const readmeContent = `Water Quality Data Export
Generated: ${new Date().toISOString()}

Files included:
1. ${filename} - Custom analysis data based on user selections
2. lab_reference_info.csv - Laboratory reference information
3. sample_data.csv - Sample data
4. monitoring_sites.csv - Monitoring sites information

Total files: 4
Archive created by: Water Quality Portal
`;

    archive.append(readmeContent, { name: 'README.txt' });
    console.log('📄 Added README.txt');

    // Finalize the archive
    await archive.finalize();

    console.log(
      `✅ ZIP file created successfully in ${Date.now() - startTime}ms`,
    );
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

module.exports = router;
