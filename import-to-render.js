#!/usr/bin/env node
/**
 * Import ideas to Render from local export file
 * Usage: node import-to-render.js <render-url> [export-file]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const RENDER_URL = process.argv[2] || process.env.RENDER_URL;
const EXPORT_FILE = process.argv[3] || 'ideas-export.json';

if (!RENDER_URL) {
  console.error('❌ ERROR: Render URL required');
  console.error('Usage: node import-to-render.js <render-url> [export-file]');
  console.error('   Or: RENDER_URL=https://your-app.onrender.com node import-to-render.js');
  process.exit(1);
}

if (!fs.existsSync(EXPORT_FILE)) {
  console.error(`❌ ERROR: Export file not found: ${EXPORT_FILE}`);
  process.exit(1);
}

// Validate JSON
try {
  const data = JSON.parse(fs.readFileSync(EXPORT_FILE, 'utf-8'));
  console.log(`📦 Export file contains ${data.totalIdeas || 0} ideas`);
} catch (error) {
  console.error(`❌ ERROR: Invalid JSON file: ${error.message}`);
  process.exit(1);
}

const fileStats = fs.statSync(EXPORT_FILE);
const fileSizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);
console.log(`📁 File size: ${fileSizeMB} MB`);
console.log(`🌐 Render URL: ${RENDER_URL}`);
console.log('');

// Read file
const fileContent = fs.readFileSync(EXPORT_FILE);

// Create form data
const FormData = require('form-data');
const form = new FormData();
form.append('file', fileContent, {
  filename: path.basename(EXPORT_FILE),
  contentType: 'application/json',
});

// Get headers
const headers = form.getHeaders();

// Parse URL
const url = new URL(RENDER_URL);
const isHttps = url.protocol === 'https:';
const client = isHttps ? https : http;

const options = {
  hostname: url.hostname,
  port: url.port || (isHttps ? 443 : 80),
  path: '/api/admin/import-ideas',
  method: 'POST',
  headers: {
    ...headers,
    // Add any auth headers if needed
  },
};

console.log('🚀 Starting import...');
console.log('⏳ This may take 5-10 minutes for 800+ ideas...');
console.log('');

const startTime = Date.now();

const req = client.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
    // Show progress indicator
    process.stdout.write('.');
  });

  res.on('end', () => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('');
    console.log('');

    if (res.statusCode === 200 || res.statusCode === 201) {
      try {
        const result = JSON.parse(responseData);
        console.log('✅ Import completed successfully!');
        console.log(`📊 Imported: ${result.imported || result.importedCount || 0} ideas`);
        console.log(`⏭️  Skipped: ${result.skipped || result.skippedCount || 0} ideas`);
        console.log(`🔄 Updated: ${result.updated || result.updatedCount || 0} ideas`);
        console.log(`⏱️  Duration: ${duration} seconds`);
      } catch (e) {
        console.log('✅ Import completed!');
        console.log('Response:', responseData.substring(0, 200));
      }
    } else {
      console.error(`❌ Import failed with status ${res.statusCode}`);
      console.error('Response:', responseData);
      
      if (res.statusCode === 403) {
        console.error('');
        console.error('💡 Make sure ALLOW_BULK_IMPORT=true is set in Render environment variables');
      } else if (res.statusCode === 401) {
        console.error('');
        console.error('💡 Authentication required. You may need to log in first.');
      }
    }
  });
});

req.on('error', (error) => {
  console.error('');
  console.error('❌ Request failed:', error.message);
  console.error('');
  console.error('💡 Make sure:');
  console.error('   1. Render URL is correct');
  console.error('   2. Render service is running');
  console.error('   3. ALLOW_BULK_IMPORT=true is set in Render environment variables');
});

// Pipe form data
form.pipe(req);

// Handle form errors
form.on('error', (error) => {
  console.error('❌ Form error:', error.message);
});

