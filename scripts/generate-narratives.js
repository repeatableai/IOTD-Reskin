/**
 * Script to batch generate storytelling narratives for all ideas that don't have one.
 *
 * Usage:
 *   node scripts/generate-narratives.js [batchSize] [delayMs]
 *
 * Arguments:
 *   batchSize - Number of ideas to process per batch (default: 10)
 *   delayMs   - Delay between API calls in ms (default: 2000)
 *
 * Environment:
 *   DATABASE_URL - Required for database connection
 *   ANTHROPIC_API_KEY - Required for narrative generation
 */

import 'dotenv/config';

const API_BASE = process.env.API_BASE || 'http://127.0.0.1:4000';
const BATCH_SIZE = parseInt(process.argv[2]) || 10;
const DELAY_MS = parseInt(process.argv[3]) || 2000;

async function main() {
  console.log('='.repeat(60));
  console.log('Storytelling Narrative Generator');
  console.log('='.repeat(60));
  console.log(`API Base: ${API_BASE}`);
  console.log(`Batch Size: ${BATCH_SIZE}`);
  console.log(`Delay: ${DELAY_MS}ms`);
  console.log('');

  // Check status first
  console.log('Checking current status...');
  const statusRes = await fetch(`${API_BASE}/api/admin/narrative-status`);
  if (!statusRes.ok) {
    console.error('Failed to get status:', await statusRes.text());
    process.exit(1);
  }

  const status = await statusRes.json();
  console.log('');
  console.log('Current Status:');
  console.log(`  Total Ideas: ${status.total}`);
  console.log(`  With Narrative: ${status.withNarrative}`);
  console.log(`  Without Narrative: ${status.withoutNarrative}`);
  console.log(`  Published: ${status.published}`);
  console.log(`  Published With Narrative: ${status.publishedWithNarrative}`);
  console.log(`  Published Without Narrative: ${status.publishedWithoutNarrative}`);
  console.log(`  Progress: ${status.publishedPercentComplete}%`);
  console.log('');

  if (status.publishedWithoutNarrative === 0) {
    console.log('All published ideas already have narratives!');
    process.exit(0);
  }

  // Generate narratives in batches
  let totalProcessed = 0;
  let totalSuccessful = 0;
  let totalFailed = 0;
  let remaining = status.publishedWithoutNarrative;
  let batchNum = 1;

  while (remaining > 0) {
    console.log(`\nBatch ${batchNum}: Processing up to ${BATCH_SIZE} ideas...`);
    console.log('-'.repeat(40));

    const genRes = await fetch(
      `${API_BASE}/api/admin/generate-narratives?batchSize=${BATCH_SIZE}&delay=${DELAY_MS}`,
      { method: 'POST' }
    );

    if (!genRes.ok) {
      console.error('Batch failed:', await genRes.text());
      break;
    }

    const result = await genRes.json();

    totalProcessed += result.processed;
    totalSuccessful += result.successful;
    totalFailed += result.failed;
    remaining = result.remaining;

    console.log(`  Processed: ${result.processed}`);
    console.log(`  Successful: ${result.successful}`);
    console.log(`  Failed: ${result.failed}`);
    console.log(`  Remaining: ${remaining}`);

    // Show individual results
    if (result.results) {
      for (const r of result.results) {
        const icon = r.success ? '✓' : '✗';
        console.log(`    ${icon} ${r.title}${r.error ? ` - ${r.error}` : ''}`);
      }
    }

    batchNum++;

    // Small delay between batches
    if (remaining > 0) {
      console.log(`\nWaiting 5 seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Generation Complete!');
  console.log('='.repeat(60));
  console.log(`Total Processed: ${totalProcessed}`);
  console.log(`Total Successful: ${totalSuccessful}`);
  console.log(`Total Failed: ${totalFailed}`);
  console.log(`Remaining: ${remaining}`);
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});
