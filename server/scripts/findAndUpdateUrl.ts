/**
 * Find idea by old URL and update to new URL
 */
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL not found");
  process.exit(1);
}

import { db } from "../db";
import { ideas } from "@shared/schema";
import { eq } from "drizzle-orm";

async function findAndUpdateUrl(oldUrlPattern: string, newUrl: string) {
  try {
    console.log(`Searching for ideas with URL containing: ${oldUrlPattern}`);
    
    // Get all ideas and filter in JavaScript (more reliable)
    const allIdeas = await db.select().from(ideas);
    const matchingIdeas = allIdeas.filter(idea => 
      (idea.previewUrl && idea.previewUrl.includes(oldUrlPattern)) ||
      (idea.sourceData && idea.sourceData.includes(oldUrlPattern))
    );
    
    if (matchingIdeas.length === 0) {
      console.log(`❌ No ideas found with URL containing: ${oldUrlPattern}`);
      console.log("\nSearching all ideas for reference...");
      
      // Show all ideas with preview URLs
      const allIdeas = await db.select().from(ideas).limit(100);
      const withUrls = allIdeas.filter(i => i.previewUrl || (i.sourceData && i.sourceData.includes('genspark')));
      
      if (withUrls.length > 0) {
        console.log(`\nFound ${withUrls.length} ideas with preview URLs:`);
        withUrls.forEach(idea => {
          console.log(`- ${idea.title} (${idea.slug})`);
          console.log(`  previewUrl: ${idea.previewUrl || 'none'}`);
          console.log(`  sourceData: ${idea.sourceData?.substring(0, 80) || 'none'}...`);
        });
      }
      
      return;
    }
    
    console.log(`\n✅ Found ${matchingIdeas.length} matching idea(s):\n`);
    
    for (const idea of matchingIdeas) {
      console.log(`Updating: ${idea.title} (${idea.slug})`);
      console.log(`  Old URL: ${idea.previewUrl || idea.sourceData}`);
      
      await db
        .update(ideas)
        .set({ 
          previewUrl: newUrl,
          updatedAt: new Date()
        })
        .where(eq(ideas.id, idea.id));
      
      console.log(`  ✅ Updated to: ${newUrl}\n`);
    }
    
    console.log(`✅ Successfully updated ${matchingIdeas.length} idea(s)`);
  } catch (error: any) {
    console.error("Error:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const oldUrl = "genspark.ai/agents?id=ee22ed95-7280-4ea3-987c-85f6265c3b2a";
  const newUrl = "https://www.genspark.ai/api/code_sandbox_light/preview/ee22ed95-7280-4ea3-987c-85f6265c3b2a/index.html?canvas_history_id=9b73209c-02ab-4299-a7b6-fe0d841ff046";
  
  findAndUpdateUrl(oldUrl, newUrl)
    .then(() => {
      console.log("Update completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Update failed:", error);
      process.exit(1);
    });
}

export { findAndUpdateUrl };

