import { db } from "./db";
import { ideas, tags, ideaTags, communitySignals } from "@shared/schema";
import { sampleIdeas, sampleTags, sampleCommunitySignals } from "./seedData";

export async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Clear existing data
    await db.delete(communitySignals);
    await db.delete(ideaTags);
    await db.delete(ideas);
    await db.delete(tags);

    console.log("Cleared existing data");

    // Insert tags
    const insertedTags = await db.insert(tags).values(sampleTags).returning();
    console.log(`Inserted ${insertedTags.length} tags`);

    // Insert ideas
    const insertedIdeas = await db.insert(ideas).values(sampleIdeas).returning();
    console.log(`Inserted ${insertedIdeas.length} ideas`);

    // Create idea-tag relationships
    const ideaTagRelationships = [];
    
    // Tag mapping based on idea content
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
      // Assign signals to first few ideas
      const ideaIndex = Math.floor(index / 2); // 2 signals per idea
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

    console.log("Database seeding completed successfully!");
    
    return {
      tags: insertedTags.length,
      ideas: insertedIdeas.length,
      ideaTags: ideaTagRelationships.length,
      communitySignals: communitySignalsWithIdeaIds.length,
    };

  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url.endsWith(process.argv[1])) {
  seedDatabase()
    .then((result) => {
      console.log("Seeding results:", result);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
