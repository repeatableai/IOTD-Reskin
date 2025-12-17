/**
 * Export all ideas from database to JSON file
 * Run with: npx tsx server/scripts/exportIdeas.ts
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

async function exportIdeas() {
  try {
    console.log("Starting idea export...");
    
    // Get all ideas (including unpublished)
    const allIdeas = await db.select().from(ideas);
    console.log(`Found ${allIdeas.length} ideas to export`);
    
    // Get all tags
    const allTags = await db.select().from(tags);
    console.log(`Found ${allTags.length} tags`);
    
    // Get all idea-tag relationships
    const allIdeaTags = await db.select().from(ideaTags);
    console.log(`Found ${allIdeaTags.length} idea-tag relationships`);
    
    // Get all community signals
    const allSignals = await db.select().from(communitySignals);
    console.log(`Found ${allSignals.length} community signals`);
    
    // Build export data structure
    const exportData = {
      exportedAt: new Date().toISOString(),
      totalIdeas: allIdeas.length,
      ideas: allIdeas.map(idea => {
        // Get tags for this idea
        const ideaTagIds = allIdeaTags
          .filter(it => it.ideaId === idea.id)
          .map(it => it.tagId);
        const ideaTags = allTags
          .filter(t => ideaTagIds.includes(t.id))
          .map(t => ({ id: t.id, name: t.name, color: t.color }));
        
        // Get community signals for this idea
        const ideaSignals = allSignals
          .filter(s => s.ideaId === idea.id)
          .map(s => ({
            platform: s.platform,
            signalType: s.signalType,
            name: s.name,
            memberCount: s.memberCount,
            engagementScore: s.engagementScore,
            url: s.url,
            description: s.description,
          }));
        
        return {
          ...idea,
          tags: ideaTags,
          communitySignals: ideaSignals,
        };
      }),
      tags: allTags,
    };
    
    // Write to file
    const exportPath = path.join(process.cwd(), "ideas-export.json");
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Export complete!`);
    console.log(`📁 File saved to: ${exportPath}`);
    console.log(`📊 Exported ${allIdeas.length} ideas`);
    console.log(`🏷️  Exported ${allTags.length} tags`);
    console.log(`🔗 Exported ${allIdeaTags.length} tag relationships`);
    console.log(`📡 Exported ${allSignals.length} community signals`);
    
    return exportPath;
  } catch (error) {
    console.error("Error exporting ideas:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  exportIdeas()
    .then(() => {
      console.log("Export completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Export failed:", error);
      process.exit(1);
    });
}

export { exportIdeas };

