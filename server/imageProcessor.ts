import { storage } from './storage';
import { aiService } from './aiService';

/**
 * Helper function to sleep/delay
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Image processor service for background batch image processing
 * Processes ideas without images in batches with rate limiting
 */
export class ImageProcessor {
  /**
   * Process a single batch of ideas without images
   */
  async processBatch(
    batchSize: number = 50,
    delayBetweenBatches: number = 2000
  ): Promise<{ processed: number; found: number; failed: number }> {
    // Get ideas without images
    const ideasWithoutImages = await storage.getIdeasWithoutImages(batchSize);
    
    if (ideasWithoutImages.length === 0) {
      return { processed: 0, found: 0, failed: 0 };
    }
    
    let found = 0;
    let failed = 0;
    
    // Process batch
    for (const idea of ideasWithoutImages) {
      try {
        // Use fast methods only (skip DALL-E for speed)
        // Try Google Images first, then Unsplash
        const imageUrl = await aiService.generateIdeaImage(idea.title, idea.description);
        
        if (imageUrl) {
          await storage.updateIdea(idea.id, { imageUrl });
          found++;
          console.log(`[Image Processor] Found image for idea: ${idea.title}`);
        } else {
          failed++;
          console.log(`[Image Processor] No image found for idea: ${idea.title}`);
        }
        
        // Small delay between individual image searches to avoid rate limits
        await sleep(500);
      } catch (error) {
        console.error(`[Image Processor] Failed for idea ${idea.id}:`, error);
        failed++;
      }
    }
    
    return {
      processed: ideasWithoutImages.length,
      found,
      failed,
    };
  }

  /**
   * Process all ideas without images in batches
   */
  async processAll(
    batchSize: number = 50,
    delayBetweenBatches: number = 2000
  ): Promise<{ totalProcessed: number; totalFound: number; totalFailed: number }> {
    let totalProcessed = 0;
    let totalFound = 0;
    let totalFailed = 0;
    
    console.log('[Image Processor] Starting batch processing of ideas without images...');
    
    while (true) {
      const result = await this.processBatch(batchSize, delayBetweenBatches);
      
      totalProcessed += result.processed;
      totalFound += result.found;
      totalFailed += result.failed;
      
      console.log(`[Image Processor] Batch complete: ${result.processed} processed, ${result.found} found, ${result.failed} failed`);
      console.log(`[Image Processor] Total: ${totalProcessed} processed, ${totalFound} found, ${totalFailed} failed`);
      
      // If no more ideas to process, break
      if (result.processed === 0) {
        break;
      }
      
      // Delay between batches
      if (result.processed > 0) {
        console.log(`[Image Processor] Waiting ${delayBetweenBatches}ms before next batch...`);
        await sleep(delayBetweenBatches);
      }
    }
    
    console.log(`[Image Processor] Complete: ${totalProcessed} processed, ${totalFound} found, ${totalFailed} failed`);
    
    return {
      totalProcessed,
      totalFound,
      totalFailed,
    };
  }

  /**
   * Process a specific number of ideas (for testing or limited runs)
   */
  async processLimited(
    limit: number,
    batchSize: number = 50,
    delayBetweenBatches: number = 2000
  ): Promise<{ totalProcessed: number; totalFound: number; totalFailed: number }> {
    let totalProcessed = 0;
    let totalFound = 0;
    let totalFailed = 0;
    
    console.log(`[Image Processor] Starting limited processing: ${limit} ideas max`);
    
    while (totalProcessed < limit) {
      const remaining = limit - totalProcessed;
      const currentBatchSize = Math.min(batchSize, remaining);
      
      const result = await this.processBatch(currentBatchSize, delayBetweenBatches);
      
      totalProcessed += result.processed;
      totalFound += result.found;
      totalFailed += result.failed;
      
      console.log(`[Image Processor] Batch complete: ${result.processed} processed, ${result.found} found, ${result.failed} failed`);
      
      // If no more ideas to process, break
      if (result.processed === 0) {
        break;
      }
      
      // Delay between batches
      if (result.processed > 0 && totalProcessed < limit) {
        await sleep(delayBetweenBatches);
      }
    }
    
    console.log(`[Image Processor] Limited processing complete: ${totalProcessed} processed, ${totalFound} found, ${totalFailed} failed`);
    
    return {
      totalProcessed,
      totalFound,
      totalFailed,
    };
  }
}

export const imageProcessor = new ImageProcessor();

