/**
 * Import ideas from JSON file to database
 * Run with: npx tsx server/scripts/importIdeas.ts <path-to-export.json>
 */
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Ensure DATABASE_URL is set before importing db
if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not found in environment variables");
  console.error("Make sure .env file exists in project root with DATABASE_URL set");
  process.exit(1);
}

import { db } from "../db";
import { ideas, tags, ideaTags, communitySignals } from "@shared/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

interface ExportData {
  exportedAt: string;
  totalIdeas: number;
  ideas: Array<any>;
  tags: Array<any>;
}

async function importIdeas(filePath: string, skipExisting: boolean = true) {
  try {
    console.log(`Starting idea import from: ${filePath}`);
    
    // Read export file
    if (!fs.existsSync(filePath)) {
      throw new Error(`Export file not found: ${filePath}`);
    }
    
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const exportData: ExportData = JSON.parse(fileContent);
    
    console.log(`📦 Import file contains ${exportData.totalIdeas} ideas`);
    console.log(`📅 Exported at: ${exportData.exportedAt}`);
    
    // Import tags first
    const existingTags = await db.select().from(tags);
    const existingTagNames = new Set(existingTags.map(t => t.name));
    
    const tagsToInsert = exportData.tags.filter(t => !existingTagNames.has(t.name));
    if (tagsToInsert.length > 0) {
      await db.insert(tags).values(tagsToInsert);
      console.log(`✅ Imported ${tagsToInsert.length} new tags`);
    } else {
      console.log(`ℹ️  All tags already exist`);
    }
    
    // Get all tags (including newly inserted) for mapping
    const allTags = await db.select().from(tags);
    const tagMap = new Map(allTags.map(t => [t.name, t.id]));
    
    // Import ideas
    const existingIdeas = await db.select().from(ideas);
    const existingSlugs = new Set(existingIdeas.map(i => i.slug));
    
    let importedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;
    
    for (const ideaData of exportData.ideas) {
      const { tags: ideaTagsData, communitySignals: ideaSignalsData, ...ideaFields } = ideaData;
      
      // Remove id to let database generate new one
      const { id, createdAt, updatedAt, ...ideaToInsert } = ideaFields;
      
      // Ensure isPublished is true
      ideaToInsert.isPublished = true;
      
      if (existingSlugs.has(ideaToInsert.slug)) {
        if (skipExisting) {
          skippedCount++;
          continue;
        } else {
          // Update existing idea
          const existingIdea = existingIdeas.find(i => i.slug === ideaToInsert.slug);
          if (existingIdea) {
            await db.update(ideas)
              .set(ideaToInsert)
              .where(eq(ideas.id, existingIdea.id));
            updatedCount++;
          }
        }
      } else {
        // Insert new idea
        const [insertedIdea] = await db.insert(ideas).values(ideaToInsert).returning();
        importedCount++;
        
        // Import tags for this idea
        if (ideaTagsData && ideaTagsData.length > 0) {
          const tagRelationships = ideaTagsData
            .map((tag: any) => {
              const tagId = tagMap.get(tag.name);
              return tagId ? { ideaId: insertedIdea.id, tagId } : null;
            })
            .filter((r: any) => r !== null);
          
          if (tagRelationships.length > 0) {
            // Check if relationships already exist
            const existingRelationships = await db
              .select()
              .from(ideaTags)
              .where(eq(ideaTags.ideaId, insertedIdea.id));
            const existingTagIds = new Set(existingRelationships.map(r => r.tagId));
            
            const newRelationships = tagRelationships.filter(
              (r: any) => !existingTagIds.has(r.tagId)
            );
            
            if (newRelationships.length > 0) {
              await db.insert(ideaTags).values(newRelationships);
            }
          }
        }
        
        // Import community signals for this idea
        if (ideaSignalsData && ideaSignalsData.length > 0) {
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
          
          await db.insert(communitySignals).values(signalsToInsert);
        }
      }
      
      // Log progress every 50 ideas
      if ((importedCount + skippedCount + updatedCount) % 50 === 0) {
        console.log(`Progress: ${importedCount} imported, ${skippedCount} skipped, ${updatedCount} updated`);
      }
    }
    
    console.log(`\n✅ Import complete!`);
    console.log(`📊 Imported: ${importedCount} new ideas`);
    console.log(`⏭️  Skipped: ${skippedCount} existing ideas`);
    console.log(`🔄 Updated: ${updatedCount} existing ideas`);
    
    return { importedCount, skippedCount, updatedCount };
  } catch (error) {
    console.error("Error importing ideas:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: npx tsx server/scripts/importIdeas.ts <path-to-export.json>");
    process.exit(1);
  }
  
  importIdeas(filePath)
    .then(() => {
      console.log("Import completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Import failed:", error);
      process.exit(1);
    });
}

export { importIdeas };

