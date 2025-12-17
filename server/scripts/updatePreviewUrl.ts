/**
 * Update preview URL for a specific idea
 * Usage: npx tsx server/scripts/updatePreviewUrl.ts <idea-slug-or-id> <new-url>
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
import { eq, or, ilike } from "drizzle-orm";

async function updatePreviewUrl(identifier: string, newUrl: string) {
  try {
    console.log(`Looking for idea: ${identifier}`);
    console.log(`New URL: ${newUrl}`);
    
    // Try to find by slug or ID
    const [idea] = await db
      .select()
      .from(ideas)
      .where(
        or(
          eq(ideas.slug, identifier),
          eq(ideas.id, identifier),
          ilike(ideas.title, `%${identifier}%`)
        )
      )
      .limit(1);
    
    if (!idea) {
      console.error(`❌ Idea not found: ${identifier}`);
      console.log("Try using the idea slug or ID");
      process.exit(1);
    }
    
    console.log(`✅ Found idea: ${idea.title} (${idea.slug})`);
    console.log(`Current previewUrl: ${idea.previewUrl || 'none'}`);
    console.log(`Current sourceData: ${idea.sourceData?.substring(0, 50) || 'none'}...`);
    
    // Update previewUrl
    const [updated] = await db
      .update(ideas)
      .set({ 
        previewUrl: newUrl,
        updatedAt: new Date()
      })
      .where(eq(ideas.id, idea.id))
      .returning();
    
    console.log(`\n✅ Updated successfully!`);
    console.log(`New previewUrl: ${updated.previewUrl}`);
    
    return updated;
  } catch (error: any) {
    console.error("Error updating preview URL:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  const identifier = process.argv[2];
  const newUrl = process.argv[3];
  
  if (!identifier || !newUrl) {
    console.error("Usage: npx tsx server/scripts/updatePreviewUrl.ts <idea-slug-or-id> <new-url>");
    console.error("Example: npx tsx server/scripts/updatePreviewUrl.ts my-idea-slug https://example.com");
    process.exit(1);
  }
  
  updatePreviewUrl(identifier, newUrl)
    .then(() => {
      console.log("Update completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Update failed:", error);
      process.exit(1);
    });
}

export { updatePreviewUrl };

