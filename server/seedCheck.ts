/**
 * Seed Check - Automatically seeds database if empty
 * This runs at startup to ensure the database has data
 */
import { db } from "./db";
import { ideas, tags, ideaTags, communitySignals } from "@shared/schema";
import { sampleIdeas, sampleTags, sampleCommunitySignals } from "./seedData";

async function seedDatabaseSafe() {
  try {
    console.log("Starting database seeding...");

    // Insert tags (only if they don't exist)
    const existingTags = await db.select().from(tags);
    if (existingTags.length === 0) {
      const insertedTags = await db.insert(tags).values(sampleTags).returning();
      console.log(`Inserted ${insertedTags.length} tags`);
    } else {
      console.log(`Tags already exist (${existingTags.length} found)`);
    }

    // Insert ideas (only if they don't exist)
    const existingIdeas = await db.select().from(ideas);
    if (existingIdeas.length === 0) {
      const insertedIdeas = await db.insert(ideas).values(sampleIdeas).returning();
      console.log(`Inserted ${insertedIdeas.length} ideas`);

      // Create idea-tag relationships
      const insertedTags = await db.select().from(tags);
      const ideaTagRelationships = [];
      
      const tagMappings = [
        { ideaSlug: "native-plant-selection-wizard-for-landscapers", tagNames: ["B2C", "Mobile App", "High Growth", "Perfect Timing"] },
        { ideaSlug: "cross-timezone-meeting-scheduling-and-analytics", tagNames: ["B2B", "SaaS", "High Growth", "Perfect Timing"] },
        { ideaSlug: "bulk-mushroom-coffee-subscription-for-businesses", tagNames: ["B2B", "Subscription", "Proven Market"] },
        { ideaSlug: "ai-powered-ingredient-transparency-tool-for-nootropics", tagNames: ["B2C", "Mobile App", "AI/ML", "High Growth"] },
        { ideaSlug: "ai-curation-platform-for-childrens-educational-apps", tagNames: ["B2C", "AI/ML", "Proven Market"] },
        { ideaSlug: "unified-multi-sport-facility-management-software", tagNames: ["B2B", "SaaS", "Enterprise"] },
        { ideaSlug: "ai-tool-to-verify-regenerative-travel-claims", tagNames: ["B2C", "AI/ML", "Perfect Timing"] },
        { ideaSlug: "personalized-dosage-management-platform-for-glp-1s", tagNames: ["B2C", "Mobile App", "AI/ML", "Perfect Timing"] },
        { ideaSlug: "triage-and-rx-management-app-for-small-vet-practices", tagNames: ["B2B", "SaaS", "Proven Market"] },
      ];

      for (const mapping of tagMappings) {
        const idea = insertedIdeas.find(i => i.slug === mapping.ideaSlug);
        if (idea) {
          for (const tagName of mapping.tagNames) {
            const tag = insertedTags.find(t => t.name === tagName);
            if (tag) {
              ideaTagRelationships.push({
                ideaId: idea.id,
                tagId: tag.id,
              });
            }
          }
        }
      }

      if (ideaTagRelationships.length > 0) {
        await db.insert(ideaTags).values(ideaTagRelationships);
        console.log(`Created ${ideaTagRelationships.length} idea-tag relationships`);
      }

      // Insert community signals
      const communitySignalsWithIdeaIds = sampleCommunitySignals.map((signal, index) => {
        const ideaIndex = Math.floor(index / 2);
        const idea = insertedIdeas[ideaIndex];
        return {
          ...signal,
          ideaId: idea?.id || insertedIdeas[0].id,
        };
      });

      if (communitySignalsWithIdeaIds.length > 0) {
        await db.insert(communitySignals).values(communitySignalsWithIdeaIds);
        console.log(`Inserted ${communitySignalsWithIdeaIds.length} community signals`);
      }
    } else {
      console.log(`Ideas already exist (${existingIdeas.length} found)`);
    }

    console.log("Database seeding completed successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

export async function checkAndSeedDatabase() {
  try {
    // Check if database has any ideas
    const existingIdeas = await db.select().from(ideas).limit(1);
    
    if (existingIdeas.length === 0) {
      console.log("Database is empty, seeding with sample data...");
      await seedDatabaseSafe();
      console.log("Seeding completed successfully");
      return true;
    } else {
      console.log(`Database already has data (${existingIdeas.length} ideas found), skipping seed`);
      return false;
    }
  } catch (error) {
    console.error("Error checking/seeding database:", error);
    // Don't throw - allow app to start even if seeding fails
    return false;
  }
}
