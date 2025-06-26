const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
const router = express.Router();

// Initialize cache with TTL from environment
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL) || 300, // 5 minutes default
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false,
});

// Cache statistics endpoint (for debugging)
router.get('/cache-stats', (req, res) => {
  const stats = cache.getStats();
  const keys = cache.keys();

  res.json({
    stats,
    keys,
    csvCached: cache.has('lab_reference_csv'),
    cacheSize: cache.keys().length,
  });
});

// Clear cache endpoint (for debugging/admin)
router.delete('/cache', (req, res) => {
  cache.flushAll();
  res.json({ message: 'Cache cleared successfully' });
});

// Main CSV endpoint
router.get('/lab-reference-csv', async (req, res) => {
  const startTime = Date.now();

  try {
    console.log('📡 CSV Request received at:', new Date().toISOString());

    // Check cache first
    const cachedData = cache.get('lab_reference_csv');
    if (cachedData) {
      console.log('🎯 Serving from cache');
      res.set({
        'Content-Type': 'text/csv',
        'Cache-Control': 'public, max-age=60',
        'X-Data-Source': 'cache',
        'X-Response-Time': `${Date.now() - startTime}ms`,
      });
      return res.send(cachedData);
    }

    console.log('🌐 Fetching from external server:', process.env.CSV_URL);

    // Fetch from external server
    const response = await axios.get(process.env.CSV_URL, {
      timeout: parseInt(process.env.REQUEST_TIMEOUT) || 10000,
      headers: {
        'User-Agent': 'Water-Quality-Portal/1.0',
        Accept: 'text/csv, text/plain, */*',
      },
      // Don't parse as JSON, get raw text
      responseType: 'text',
    });

    // Validate response
    if (!response.data || typeof response.data !== 'string') {
      throw new Error('Invalid CSV data received from external server');
    }

    // Basic CSV validation - check for headers
    const lines = response.data.split('\n');
    if (lines.length < 2) {
      throw new Error('CSV appears to be empty or invalid');
    }

    const headers = lines[0].toLowerCase();
    const requiredHeaders = [
      'laboratory',
      'lab_analysis_method_short_name',
      'generic_name',
    ];
    const hasRequiredHeaders = requiredHeaders.every(header =>
      headers.includes(header.toLowerCase()),
    );

    if (!hasRequiredHeaders) {
      console.warn('⚠️ CSV may be missing required headers:', headers);
    }

    // Cache the successful response
    cache.set('lab_reference_csv', response.data);

    console.log('✅ CSV fetched successfully');
    console.log(`📊 Data size: ${response.data.length} characters`);
    console.log(`📋 Lines: ${lines.length}`);
    console.log(`⏱️ Response time: ${Date.now() - startTime}ms`);

    // Set response headers
    res.set({
      'Content-Type': 'text/csv',
      'Cache-Control': 'public, max-age=60',
      'X-Data-Source': 'external',
      'X-Response-Time': `${Date.now() - startTime}ms`,
      'X-Data-Size': response.data.length,
      'X-Lines-Count': lines.length,
    });

    res.send(response.data);
  } catch (error) {
    console.error('❌ Error fetching CSV:', error.message);

    // Determine error type and status code
    let statusCode = 500;
    let errorMessage = 'Internal server error';
    let errorDetails = error.message;

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      statusCode = 503;
      errorMessage = 'External CSV server unavailable';
      errorDetails =
        'Unable to connect to the data source. Please try again later.';
    } else if (
      error.code === 'ETIMEDOUT' ||
      error.message.includes('timeout')
    ) {
      statusCode = 504;
      errorMessage = 'Request timeout';
      errorDetails =
        'The external server took too long to respond. Please try again.';
    } else if (error.response?.status) {
      statusCode = error.response.status;
      errorMessage = `External server error: ${error.response.statusText}`;
      errorDetails = `The data source returned status ${error.response.status}`;
    }

    // Log detailed error for debugging
    console.error('🔍 Error details:', {
      code: error.code,
      status: error.response?.status,
      message: error.message,
      url: process.env.CSV_URL,
      timeout: process.env.REQUEST_TIMEOUT,
    });

    res.status(statusCode).json({
      error: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
      // Include helpful debugging info in development
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          originalError: error.message,
          errorCode: error.code,
          url: process.env.CSV_URL,
          responseTime: `${Date.now() - startTime}ms`,
        },
      }),
    });
  }
});

module.exports = router;
