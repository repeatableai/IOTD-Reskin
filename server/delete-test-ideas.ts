// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env') });

// Now import db and schema
import { db } from './db';
import { ideas } from '@shared/schema';
import { sql, inArray } from 'drizzle-orm';

/**
 * Script to delete all ideas with titles matching "test" followed by a number
 * Examples: "test 3", "test 5", "test 10", etc.
 */
async function deleteTestIdeas() {
  try {
    console.log('🔍 Searching for ideas matching "test" + number pattern...');
    
    // Find all ideas where title matches "test" followed by optional space and a number
    // Pattern: "test" (case insensitive) followed by optional space and digits
    const testIdeas = await db
      .select({
        id: ideas.id,
        title: ideas.title,
        slug: ideas.slug,
      })
      .from(ideas)
      .where(
        sql`LOWER(${ideas.title}) ~ '^test\\s*\\d+$'`
      );
    
    console.log(`\n📋 Found ${testIdeas.length} ideas matching pattern:`);
    testIdeas.forEach((idea, index) => {
      console.log(`  ${index + 1}. "${idea.title}" (ID: ${idea.id}, Slug: ${idea.slug})`);
    });
    
    if (testIdeas.length === 0) {
      console.log('\n✅ No ideas found matching the pattern. Nothing to delete.');
      return;
    }
    
    // Get IDs to delete
    const idsToDelete = testIdeas.map(idea => idea.id);
    
    console.log(`\n🗑️  Deleting ${idsToDelete.length} ideas...`);
    
    // Delete ideas (cascade will handle related records like tags, votes, etc.)
    const result = await db
      .delete(ideas)
      .where(inArray(ideas.id, idsToDelete));
    
    console.log(`\n✅ Successfully deleted ${idsToDelete.length} ideas!`);
    console.log('\nDeleted ideas:');
    testIdeas.forEach((idea, index) => {
      console.log(`  ✓ "${idea.title}"`);
    });
    
  } catch (error) {
    console.error('❌ Error deleting test ideas:', error);
    throw error;
  }
}

// Run the script
deleteTestIdeas()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });

