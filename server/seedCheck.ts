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

    // Insert ideas - check by slug to avoid duplicates
    const existingIdeas = await db.select().from(ideas);
    const existingSlugs = new Set(existingIdeas.map(i => i.slug));
    
    // Filter out ideas that already exist
    const ideasToInsert = sampleIdeas.filter(idea => !existingSlugs.has(idea.slug));
    
    if (ideasToInsert.length > 0) {
      const insertedIdeas = await db.insert(ideas).values(ideasToInsert).returning();
      console.log(`Inserted ${insertedIdeas.length} new ideas (${existingIdeas.length} already existed)`);
      
      // Get all ideas (existing + newly inserted) for tag relationships
      const allIdeas = [...existingIdeas, ...insertedIdeas];

      // Create idea-tag relationships (only for newly inserted ideas to avoid duplicates)
      const allTags = await db.select().from(tags);
      const existingRelationships = await db.select().from(ideaTags);
      const existingRelationshipKeys = new Set(
        existingRelationships.map(r => `${r.ideaId}-${r.tagId}`)
      );
      
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
        const idea = allIdeas.find(i => i.slug === mapping.ideaSlug);
        if (idea) {
          for (const tagName of mapping.tagNames) {
            const tag = allTags.find(t => t.name === tagName);
            if (tag) {
              const relationshipKey = `${idea.id}-${tag.id}`;
              if (!existingRelationshipKeys.has(relationshipKey)) {
                ideaTagRelationships.push({
                  ideaId: idea.id,
                  tagId: tag.id,
                });
              }
            }
          }
        }
      }

      if (ideaTagRelationships.length > 0) {
        await db.insert(ideaTags).values(ideaTagRelationships);
        console.log(`Created ${ideaTagRelationships.length} new idea-tag relationships`);
      }

      // Insert community signals (only for newly inserted ideas)
      if (insertedIdeas.length > 0) {
        const existingSignals = await db.select().from(communitySignals);
        const existingSignalKeys = new Set(existingSignals.map(s => `${s.ideaId}-${s.platform}-${s.name}`));
        
        const communitySignalsWithIdeaIds = sampleCommunitySignals
          .map((signal, index) => {
            const ideaIndex = Math.floor(index / 2);
            const idea = insertedIdeas[ideaIndex] || insertedIdeas[0];
            return {
              ...signal,
              ideaId: idea?.id || insertedIdeas[0].id,
            };
          })
          .filter(signal => {
            const signalKey = `${signal.ideaId}-${signal.platform}-${signal.name}`;
            return !existingSignalKeys.has(signalKey);
          });

        if (communitySignalsWithIdeaIds.length > 0) {
          await db.insert(communitySignals).values(communitySignalsWithIdeaIds);
          console.log(`Inserted ${communitySignalsWithIdeaIds.length} new community signals`);
        }
      }
    } else {
      console.log(`All seed ideas already exist (${existingIdeas.length} found)`);
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
      // Check if we have the expected number of seed ideas (9)
      const ideaCount = await db.select().from(ideas);
      const expectedSeedIdeas = 9; // Number of ideas in sampleIdeas
      
      if (ideaCount.length < expectedSeedIdeas) {
        console.log(`Database has ${ideaCount.length} ideas but expected ${expectedSeedIdeas} seed ideas. Seeding missing data...`);
        await seedDatabaseSafe();
        console.log("Seeding completed successfully");
        return true;
      } else {
        console.log(`Database already has data (${ideaCount.length} ideas found), skipping seed`);
        return false;
      }
    }
  } catch (error) {
    console.error("Error checking/seeding database:", error);
    // Don't throw - allow app to start even if seeding fails
    return false;
  }
}
