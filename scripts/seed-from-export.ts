/**
 * Seed database from ideas-export.json on Render deployment
 * This runs automatically when Render starts up
 */

import { db } from "../server/db.js";
import { ideas, tags, ideaTags, communitySignals } from "@shared/schema";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seedFromExport() {
  try {
    console.log("[Seed] Starting seed from ideas-export.json...");
    
    // Check if export file exists
    const exportPath = join(__dirname, "..", "ideas-export.json");
    let exportData;
    
    try {
      const fileContent = readFileSync(exportPath, "utf-8");
      exportData = JSON.parse(fileContent);
      console.log(`[Seed] Loaded export file: ${exportPath}`);
    } catch (error: any) {
      console.log(`[Seed] Export file not found at ${exportPath}, skipping seed`);
      console.log(`[Seed] This is normal if you haven't committed ideas-export.json`);
      return;
    }
    
    if (!exportData.ideas || !Array.isArray(exportData.ideas)) {
      console.log("[Seed] Invalid export file format, skipping seed");
      return;
    }
    
    console.log(`[Seed] Export file contains ${exportData.ideas.length} ideas`);
    
    // Check if ideas already exist
    const existingIdeas = await db.select().from(ideas);
    const existingSlugs = new Set(existingIdeas.map(i => i.slug));
    
    if (existingSlugs.size > 0) {
      console.log(`[Seed] Database already has ${existingSlugs.size} ideas, skipping seed`);
      console.log(`[Seed] To re-seed, clear the database first`);
      return;
    }
    
    console.log("[Seed] Database is empty, proceeding with seed...");
    
    // Import tags first
    const allTags = await db.select().from(tags);
    const existingTagNames = new Set(allTags.map(t => t.name));
    
    if (exportData.tags && Array.isArray(exportData.tags)) {
      const tagsToInsert = exportData.tags.filter((t: any) => !existingTagNames.has(t.name));
      if (tagsToInsert.length > 0) {
        await db.insert(tags).values(tagsToInsert);
        console.log(`[Seed] Imported ${tagsToInsert.length} tags`);
      }
    }
    
    // Get all tags for mapping
    const allTagsAfter = await db.select().from(tags);
    const tagMap = new Map(allTagsAfter.map(t => [t.name, t.id]));
    
    // Import ideas (excluding previewUrl if column doesn't exist)
    let importedCount = 0;
    
    for (const ideaData of exportData.ideas) {
      const { tags: ideaTagsData, communitySignals: ideaSignalsData, ...ideaFields } = ideaData;
      const { id, createdAt, updatedAt, previewUrl, ...ideaToInsert } = ideaFields;
      
      // Ensure isPublished is true
      ideaToInsert.isPublished = true;
      
      // Skip if already exists
      if (existingSlugs.has(ideaToInsert.slug)) {
        continue;
      }
      
      try {
        // Insert idea (previewUrl excluded if column doesn't exist)
        const [insertedIdea] = await db.insert(ideas).values(ideaToInsert).returning();
        importedCount++;
        
        // Import tags for this idea
        if (ideaTagsData && Array.isArray(ideaTagsData) && ideaTagsData.length > 0) {
          const tagRelationships = ideaTagsData
            .map((tag: any) => {
              const tagId = tagMap.get(tag.name);
              return tagId ? { ideaId: insertedIdea.id, tagId } : null;
            })
            .filter((r: any) => r !== null);
          
          if (tagRelationships.length > 0) {
            await db.insert(ideaTags).values(tagRelationships);
          }
        }
        
        // Import community signals
        if (ideaSignalsData && Array.isArray(ideaSignalsData) && ideaSignalsData.length > 0) {
          const signalsToInsert = ideaSignalsData.map((signal: any) => ({
            ideaId: insertedIdea.id,
            platform: signal.platform,
            signalType: signal.signalType,
            name: signal.name,
            memberCount: signal.memberCount,
            engagementScore: signal.engagementScore,
            url: signal.url,
            description: signal.description,
          }));
          
          if (signalsToInsert.length > 0) {
            await db.insert(communitySignals).values(signalsToInsert);
          }
        }
      } catch (error: any) {
        // Skip ideas that fail (e.g., missing columns)
        console.error(`[Seed] Failed to import idea "${ideaToInsert.title}":`, error.message);
        continue;
      }
    }
    
    console.log(`[Seed] ✅ Successfully imported ${importedCount} ideas`);
    
  } catch (error: any) {
    console.error("[Seed] Error seeding database:", error.message);
    // Don't throw - allow server to start even if seed fails
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFromExport()
    .then(() => {
      console.log("[Seed] Seed process completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("[Seed] Seed process failed:", error);
      process.exit(1);
    });
}

export { seedFromExport };

