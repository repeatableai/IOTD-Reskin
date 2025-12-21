#!/usr/bin/env node

/**
 * Script to batch generate Opportunity Analyses for all ideas
 * Processes ideas in small batches with retry logic and progress tracking
 */

const http = require('http');

const BATCH_SIZE = 3; // Smaller batches to avoid timeouts
const RETRY_DELAY = 5000; // 5 seconds between retries
const BATCH_DELAY = 10000; // 10 seconds between batches
const MAX_RETRIES = 2;

async function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => { responseData += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(responseData) });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(600000); // 10 minute timeout
    req.write(JSON.stringify(data));
    req.end();
  });
}

async function generateBatch(batchNumber) {
  const options = {
    hostname: '127.0.0.1',
    port: 4000,
    path: '/api/admin/generate-all-opportunity-analyses',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const result = await makeRequest(options, { batchSize: BATCH_SIZE });
    
    if (result.status !== 200) {
      throw new Error(`HTTP ${result.status}: ${JSON.stringify(result.data)}`);
    }
    
    return result.data;
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

async function generateAllAnalyses() {
  let totalProcessed = 0;
  let totalFailed = 0;
  let batchNumber = 1;
  const failedIdeas = [];
  
  console.log('🚀 Starting batch generation of Opportunity Analyses...\n');
  
  while (true) {
    let retries = 0;
    let result = null;
    
    // Retry logic
    while (retries <= MAX_RETRIES) {
      try {
        console.log(`[Batch ${batchNumber}] Processing batch of ${BATCH_SIZE} ideas...`);
        result = await generateBatch(batchNumber);
        break;
      } catch (error) {
        retries++;
        if (retries <= MAX_RETRIES) {
          console.log(`[Batch ${batchNumber}] Attempt ${retries} failed: ${error.message}`);
          console.log(`[Batch ${batchNumber}] Retrying in ${RETRY_DELAY/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          console.error(`[Batch ${batchNumber}] Max retries reached. Skipping batch.`);
          result = { processed: 0, remaining: 0, results: [] };
        }
      }
    }
    
    if (!result) {
      console.error(`[Batch ${batchNumber}] Failed to get result. Stopping.`);
      break;
    }
    
    const processed = result.processed || 0;
    const remaining = result.remaining || 0;
    const successCount = result.results?.filter(r => r.status === 'success').length || 0;
    const failCount = result.results?.filter(r => r.status === 'failed').length || 0;
    
    totalProcessed += processed;
    totalFailed += failCount;
    
    console.log(`[Batch ${batchNumber}] ✅ Processed: ${processed} ideas`);
    console.log(`[Batch ${batchNumber}]    Success: ${successCount}, Failed: ${failCount}`);
    console.log(`[Batch ${batchNumber}]    Remaining: ${remaining} ideas`);
    
    // Track failed ideas
    if (result.results) {
      result.results.filter(r => r.status === 'failed').forEach(r => {
        failedIdeas.push({ id: r.id, title: r.title, error: r.error });
        console.log(`[Batch ${batchNumber}]    ❌ Failed: ${r.title.substring(0, 50)}...`);
      });
    }
    
    if (remaining === 0) {
      console.log(`\n✅ All done!`);
      console.log(`   Total processed: ${totalProcessed} ideas`);
      console.log(`   Total failed: ${totalFailed} ideas`);
      
      if (failedIdeas.length > 0) {
        console.log(`\n⚠️  Failed ideas (${failedIdeas.length}):`);
        failedIdeas.forEach((idea, idx) => {
          console.log(`   ${idx + 1}. ${idea.title}`);
          console.log(`      Error: ${idea.error.substring(0, 100)}...`);
        });
      }
      break;
    }
    
    batchNumber++;
    
    // Progress estimate
    const avgTimePerBatch = 60; // seconds (rough estimate)
    const estimatedSeconds = (remaining / BATCH_SIZE) * avgTimePerBatch;
    const estimatedMinutes = Math.floor(estimatedSeconds / 60);
    const estimatedHours = Math.floor(estimatedMinutes / 60);
    
    console.log(`[Batch ${batchNumber}] ⏱️  Estimated time remaining: ~${estimatedHours}h ${estimatedMinutes % 60}m`);
    console.log(`[Batch ${batchNumber}] Waiting ${BATCH_DELAY/1000} seconds before next batch...\n`);
    
    await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
  }
}

// Run the script
generateAllAnalyses().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

