import { sql } from 'drizzle-orm';
import {
  index,
  uniqueIndex,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ideas table
export const ideas = pgTable("ideas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  slug: varchar("slug").notNull().unique(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("image_url"),

  // Categorization
  type: varchar("type").notNull(), // mobile_app, web_app, saas, marketplace, etc.
  market: varchar("market").notNull(), // B2B, B2C, B2B2C
  targetAudience: text("target_audience"),
  mainCompetitor: varchar("main_competitor"),

  // Keywords and search data
  keyword: varchar("keyword"),
  keywordVolume: integer("keyword_volume"),
  keywordGrowth: varchar("keyword_growth"),

  // Scoring metrics (1-10 scale)
  opportunityScore: integer("opportunity_score").notNull(),
  opportunityLabel: varchar("opportunity_label").notNull(),
  problemScore: integer("problem_score").notNull(),
  problemLabel: varchar("problem_label").notNull(),
  feasibilityScore: integer("feasibility_score").notNull(),
  feasibilityLabel: varchar("feasibility_label").notNull(),
  timingScore: integer("timing_score").notNull(),
  timingLabel: varchar("timing_label").notNull(),
  executionScore: integer("execution_score").notNull(),
  gtmScore: integer("gtm_score").notNull(),

  // Revenue and business metrics
  revenuePotential: text("revenue_potential"),
  revenuePotentialNum: integer("revenue_potential_num"), // For sorting
  executionDifficulty: text("execution_difficulty"),
  gtmStrength: text("gtm_strength"),

  // Engagement metrics
  viewCount: integer("view_count").default(0),
  saveCount: integer("save_count").default(0),
  voteCount: integer("vote_count").default(0),

  // Status and visibility
  isPublished: boolean("is_published").default(true),
  isFeatured: boolean("is_featured").default(false),
  isGregsPick: boolean("is_gregs_pick").default(false), // Premium: Greg's personally picked ideas

  // User creation tracking
  createdBy: varchar("created_by").references(() => users.id),
  sourceType: varchar("source_type").default('curated'), // 'curated', 'user_import', 'user_generated'
  sourceData: text("source_data"), // Original imported HTML/instructions
  builderUrl: varchar("builder_url"), // URL to no-code builder project
  previewUrl: varchar("preview_url"), // Preview URL from spreadsheet (for app previews)

  // Detailed analysis sections (for 1:1 ideabrowser.com copy)
  offerTiers: jsonb("offer_tiers"), // Value ladder with lead magnet, frontend, core, backend, continuity
  whyNowAnalysis: text("why_now_analysis"), // Why Now section content
  proofSignals: text("proof_signals"), // Proof & Signals section content
  marketGap: text("market_gap"), // Market Gap section content
  executionPlan: text("execution_plan"), // Execution Plan section content
  frameworkData: jsonb("framework_data"), // All framework analyses (Value Equation, Market Matrix, A.C.P., Value Ladder)
  trendAnalysis: text("trend_analysis"), // Trend analysis content
  storytellingNarrative: text("storytelling_narrative"), // AI-generated persuasive storytelling narrative
  keywordData: jsonb("keyword_data"), // Enhanced keyword data with categories and competition
  builderPrompts: jsonb("builder_prompts"), // Pre-built prompts for various AI builders

  // Community signals data
  communitySignals: jsonb("community_signals"), // Reddit, Facebook, YouTube, Other community data with scores
  signalBadges: text("signal_badges").array(), // Badge tags like "Perfect Timing", "Unfair Advantage", etc.

  // Claim feature - social proof and accountability
  claimedBy: varchar("claimed_by").references(() => users.id), // User who claimed the idea
  claimedAt: timestamp("claimed_at"), // When the idea was claimed
  claimCount: integer("claim_count").default(0), // Total number of times claimed (historical)
  maxClaimSlots: integer("max_claim_slots").default(5), // Max concurrent claimers (for future multi-claim)
  claimProgress: integer("claim_progress").default(0), // 0-100% progress
  claimMilestones: jsonb("claim_milestones"), // Array of milestone objects {name, completed, date}

  // User engagement
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }), // Average user rating
  ratingCount: integer("rating_count").default(0), // Number of ratings

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Performance indexes for frequently queried columns
  index("IDX_ideas_is_published").on(table.isPublished),
  index("IDX_ideas_created_at").on(table.createdAt),
  index("IDX_ideas_market").on(table.market),
  index("IDX_ideas_type").on(table.type),
  index("IDX_ideas_opportunity_score").on(table.opportunityScore),
  index("IDX_ideas_revenue_potential_num").on(table.revenuePotentialNum),
  index("IDX_ideas_vote_count").on(table.voteCount),
  index("IDX_ideas_save_count").on(table.saveCount),
  index("IDX_ideas_is_gregs_pick").on(table.isGregsPick),
  index("IDX_ideas_created_by").on(table.createdBy),
  index("IDX_ideas_claimed_by").on(table.claimedBy),
  // Composite indexes for common filter + sort combinations
  index("IDX_ideas_published_created").on(table.isPublished, table.createdAt),
  index("IDX_ideas_published_opportunity").on(table.isPublished, table.opportunityScore),
  index("IDX_ideas_published_vote").on(table.isPublished, table.voteCount),
]);

// Tags table
export const tags = pgTable("tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  color: varchar("color").default('#3B82F6'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Idea tags junction table
export const ideaTags = pgTable("idea_tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: 'cascade' }),
  tagId: varchar("tag_id").references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_idea_tags_idea_id").on(table.ideaId),
  index("IDX_idea_tags_tag_id").on(table.tagId),
]);

// User saved ideas
export const userSavedIdeas = pgTable("user_saved_ideas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_user_saved_ideas_user_id").on(table.userId),
  index("IDX_user_saved_ideas_idea_id").on(table.ideaId),
  index("IDX_user_saved_ideas_user_idea").on(table.userId, table.ideaId),
]);

// User idea interactions (interested, not interested, building status)
// Redesigned to support multiple independent statuses per idea
export const userIdeaInteractions = pgTable("user_idea_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: 'cascade' }),
  
  // Independent boolean flags - users can have multiple states active
  isInterested: boolean("is_interested").default(false),
  isNotInterested: boolean("is_not_interested").default(false),
  isBuilding: boolean("is_building").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Unique constraint to ensure one row per user-idea pair
  uniqueIndex("IDX_user_idea_interactions_user_idea").on(table.userId, table.ideaId),
]);

// User votes on ideas
export const userIdeaVotes = pgTable("user_idea_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: 'cascade' }),
  voteType: varchar("vote_type").notNull(), // 'up' or 'down'
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_user_idea_votes_user_id").on(table.userId),
  index("IDX_user_idea_votes_idea_id").on(table.ideaId),
  index("IDX_user_idea_votes_user_idea").on(table.userId, table.ideaId),
]);

// Community signals table
export const communitySignals = pgTable("community_signals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: 'cascade' }),
  platform: varchar("platform").notNull(), // reddit, facebook, youtube, other
  signalType: varchar("signal_type").notNull(), // subreddit, group, channel, etc.
  name: varchar("name").notNull(),
  memberCount: integer("member_count"),
  engagementScore: integer("engagement_score"), // 1-10
  url: varchar("url"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_community_signals_idea_id").on(table.ideaId),
]);

// User ratings table
export const userIdeaRatings = pgTable("user_idea_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: 'cascade' }),
  rating: integer("rating").notNull(), // 1-5 scale
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_user_idea_ratings_user_id").on(table.userId),
  index("IDX_user_idea_ratings_idea_id").on(table.ideaId),
  uniqueIndex("IDX_user_idea_ratings_user_idea").on(table.userId, table.ideaId),
]);

// Contact submissions table
export const contactSubmissions = pgTable("contact_submissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  subject: varchar("subject").notNull(),
  message: text("message").notNull(),
  status: varchar("status").default('new'), // new, in_progress, resolved
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Research requests table
export const researchRequests = pgTable("research_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  ideaId: varchar("idea_id").references(() => ideas.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  industry: varchar("industry"),
  targetMarket: varchar("target_market"),
  status: varchar("status").default('pending'), // pending, in_progress, completed, cancelled
  priority: varchar("priority").default('normal'), // low, normal, high
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// FAQ questions table
export const faqQuestions = pgTable("faq_questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category").default('general'), // general, billing, features, technical
  order: integer("order").default(0),
  helpful: integer("helpful").default(0), // Count of helpful votes
  notHelpful: integer("not_helpful").default(0), // Count of not helpful votes
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tools library table
export const toolsLibrary = pgTable("tools_library", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // fundraising, finance, marketing, legal, research, development
  url: varchar("url"),
  imageUrl: varchar("image_url"),
  isPremium: boolean("is_premium").default(false),
  isFeatured: boolean("is_featured").default(false),
  isNew: boolean("is_new").default(false),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User tool favorites
export const userToolFavorites = pgTable("user_tool_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  toolId: varchar("tool_id").references(() => toolsLibrary.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Claims history - tracks all claim events
export const ideaClaims = pgTable("idea_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  status: varchar("status").default('active'), // active, released, completed, expired
  progress: integer("progress").default(0), // 0-100
  milestones: jsonb("milestones"), // Array of milestone objects
  notes: text("notes"), // User notes about their progress
  claimedAt: timestamp("claimed_at").defaultNow(),
  releasedAt: timestamp("released_at"),
  completedAt: timestamp("completed_at"),
});

// Export history - tracks user exports
export const exportHistory = pgTable("export_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: 'cascade' }),
  exportType: varchar("export_type").notNull(), // pdf, notion, google_docs, markdown
  exportUrl: text("export_url"), // URL to exported document (for Notion/Docs)
  createdAt: timestamp("created_at").defaultNow(),
});

// Import jobs - tracks bulk import progress
export const importJobs = pgTable("import_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  status: varchar("status").notNull(), // 'processing', 'completed', 'failed', 'cancelled'
  totalRows: integer("total_rows").notNull(),
  processedRows: integer("processed_rows").default(0),
  successfulRows: integer("successful_rows").default(0),
  failedRows: integer("failed_rows").default(0),
  errors: jsonb("errors"), // Array of {row: number, error: string}
  results: jsonb("results"), // Array of created idea IDs
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Collaboration sessions - tracks active collaboration sessions on ideas
export const collaborationSessions = pgTable("collaboration_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Collaboration messages - messages in collaboration sessions
export const collaborationMessages = pgTable("collaboration_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  savedIdeas: many(userSavedIdeas),
  votes: many(userIdeaVotes),
  ratings: many(userIdeaRatings),
  createdIdeas: many(ideas),
}));

export const ideasRelations = relations(ideas, ({ many, one }) => ({
  tags: many(ideaTags),
  saves: many(userSavedIdeas),
  votes: many(userIdeaVotes),
  ratings: many(userIdeaRatings),
  communitySignals: many(communitySignals),
  creator: one(users, {
    fields: [ideas.createdBy],
    references: [users.id],
  }),
  claimer: one(users, {
    fields: [ideas.claimedBy],
    references: [users.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  ideas: many(ideaTags),
}));

export const ideaTagsRelations = relations(ideaTags, ({ one }) => ({
  idea: one(ideas, {
    fields: [ideaTags.ideaId],
    references: [ideas.id],
  }),
  tag: one(tags, {
    fields: [ideaTags.tagId],
    references: [tags.id],
  }),
}));

export const userSavedIdeasRelations = relations(userSavedIdeas, ({ one }) => ({
  user: one(users, {
    fields: [userSavedIdeas.userId],
    references: [users.id],
  }),
  idea: one(ideas, {
    fields: [userSavedIdeas.ideaId],
    references: [ideas.id],
  }),
}));

export const userIdeaVotesRelations = relations(userIdeaVotes, ({ one }) => ({
  user: one(users, {
    fields: [userIdeaVotes.userId],
    references: [users.id],
  }),
  idea: one(ideas, {
    fields: [userIdeaVotes.ideaId],
    references: [ideas.id],
  }),
}));

export const communitySignalsRelations = relations(communitySignals, ({ one }) => ({
  idea: one(ideas, {
    fields: [communitySignals.ideaId],
    references: [ideas.id],
  }),
}));

export const userIdeaRatingsRelations = relations(userIdeaRatings, ({ one }) => ({
  user: one(users, {
    fields: [userIdeaRatings.userId],
    references: [users.id],
  }),
  idea: one(ideas, {
    fields: [userIdeaRatings.ideaId],
    references: [ideas.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertIdea = typeof ideas.$inferInsert;
export type Idea = typeof ideas.$inferSelect;

export type InsertTag = typeof tags.$inferInsert;
export type Tag = typeof tags.$inferSelect;

export type InsertCommunitySignal = typeof communitySignals.$inferInsert;
export type CommunitySignal = typeof communitySignals.$inferSelect;

export type InsertUserIdeaRating = typeof userIdeaRatings.$inferInsert;
export type UserIdeaRating = typeof userIdeaRatings.$inferSelect;

export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

export type InsertResearchRequest = typeof researchRequests.$inferInsert;
export type ResearchRequest = typeof researchRequests.$inferSelect;

export type InsertFaqQuestion = typeof faqQuestions.$inferInsert;
export type FaqQuestion = typeof faqQuestions.$inferSelect;

export type InsertTool = typeof toolsLibrary.$inferInsert;
export type Tool = typeof toolsLibrary.$inferSelect;

export type InsertIdeaClaim = typeof ideaClaims.$inferInsert;
export type IdeaClaim = typeof ideaClaims.$inferSelect;

export type InsertExportHistory = typeof exportHistory.$inferInsert;
export type ExportHistory = typeof exportHistory.$inferSelect;

export type InsertImportJob = typeof importJobs.$inferInsert;
export type ImportJob = typeof importJobs.$inferSelect;

// Input schemas
export const insertIdeaSchema = createInsertSchema(ideas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true,
});

export const insertCommunitySignalSchema = createInsertSchema(communitySignals).omit({
  id: true,
  createdAt: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResearchRequestSchema = createInsertSchema(researchRequests).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertToolSchema = createInsertSchema(toolsLibrary).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserIdeaInteraction = typeof userIdeaInteractions.$inferInsert;
export type UserIdeaInteraction = typeof userIdeaInteractions.$inferSelect;

// Search and filter schemas
export const ideaFiltersSchema = z.object({
  search: z.string().optional(),
  market: z.enum(['B2B', 'B2C', 'B2B2C']).optional(),
  type: z.string().optional(),
  minOpportunityScore: z.coerce.number().min(1).max(10).optional(),
  maxExecutionScore: z.coerce.number().min(1).max(10).optional(),
  minRevenueNum: z.coerce.number().optional(),
  maxRevenueNum: z.coerce.number().optional(),
  tags: z.array(z.string()).optional(),
  
  // Premium filters
  isGregsPick: z.coerce.boolean().optional(), // Show only Greg's picks
  userStatus: z.enum(['interested', 'not_interested', 'building', 'saved']).optional(), // Filter by user interaction
  forYou: z.coerce.boolean().optional(), // AI-powered recommendations based on user history
  
  sortBy: z.enum(['newest', 'popular', 'opportunity', 'revenue']).default('newest'),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type IdeaFilters = z.infer<typeof ideaFiltersSchema>;

// ─── ICP Builder Tables ────────────────────────────────────────────────────────

// ICP Profiles table - stores generated Ideal Customer Profiles
export const icpProfiles = pgTable("icp_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  name: varchar("name").notNull(),
  description: text("description"),
  profileData: jsonb("profile_data").notNull(), // IcpDemographics, IcpPsychographics, IcpBuyingBehavior
  validationPriority: varchar("validation_priority").default('medium'), // high, medium, low
  confidence: integer("confidence").default(50), // 0-100
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_icp_profiles_idea_id").on(table.ideaId),
  index("IDX_icp_profiles_user_id").on(table.userId),
]);

// Validation Contacts table - stores contacts for market validation
export const validationContacts = pgTable("validation_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  icpProfileId: varchar("icp_profile_id").references(() => icpProfiles.id, { onDelete: 'set null' }),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  linkedInUrl: varchar("linkedin_url"),
  jobTitle: varchar("job_title").notNull(),
  company: varchar("company").notNull(),
  companySize: varchar("company_size"),
  industry: varchar("industry"),
  region: varchar("region").notNull(),
  complianceFlags: jsonb("compliance_flags").default([]), // ComplianceFlag[]
  consentStatus: varchar("consent_status").default('unknown'), // unknown, pending, granted, denied
  matchScore: integer("match_score"), // 0-100
  source: varchar("source").default('manual'), // manual, custom_api, imported
  validationStatus: varchar("validation_status").default('pending'), // pending, contacted, responded, completed
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("IDX_validation_contacts_idea_id").on(table.ideaId),
  index("IDX_validation_contacts_user_id").on(table.userId),
  index("IDX_validation_contacts_icp_profile_id").on(table.icpProfileId),
  index("IDX_validation_contacts_status").on(table.validationStatus),
]);

// Validation Scripts table - stores generated call scripts
export const validationScripts = pgTable("validation_scripts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  icpProfileId: varchar("icp_profile_id").references(() => icpProfiles.id, { onDelete: 'set null' }),
  title: varchar("title").notNull(),
  scriptType: varchar("script_type").default('discovery'), // discovery, validation, follow_up
  objective: text("objective"),
  totalDuration: varchar("total_duration"),
  scriptData: jsonb("script_data").notNull(), // sections, branches, keyQuestions, etc.
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("IDX_validation_scripts_idea_id").on(table.ideaId),
  index("IDX_validation_scripts_user_id").on(table.userId),
  index("IDX_validation_scripts_icp_profile_id").on(table.icpProfileId),
]);

// ICP Builder Relations
export const icpProfilesRelations = relations(icpProfiles, ({ one, many }) => ({
  idea: one(ideas, {
    fields: [icpProfiles.ideaId],
    references: [ideas.id],
  }),
  user: one(users, {
    fields: [icpProfiles.userId],
    references: [users.id],
  }),
  contacts: many(validationContacts),
  scripts: many(validationScripts),
}));

export const validationContactsRelations = relations(validationContacts, ({ one }) => ({
  idea: one(ideas, {
    fields: [validationContacts.ideaId],
    references: [ideas.id],
  }),
  user: one(users, {
    fields: [validationContacts.userId],
    references: [users.id],
  }),
  icpProfile: one(icpProfiles, {
    fields: [validationContacts.icpProfileId],
    references: [icpProfiles.id],
  }),
}));

export const validationScriptsRelations = relations(validationScripts, ({ one }) => ({
  idea: one(ideas, {
    fields: [validationScripts.ideaId],
    references: [ideas.id],
  }),
  user: one(users, {
    fields: [validationScripts.userId],
    references: [users.id],
  }),
  icpProfile: one(icpProfiles, {
    fields: [validationScripts.icpProfileId],
    references: [icpProfiles.id],
  }),
}));

// ICP Builder Types
export type InsertIcpProfile = typeof icpProfiles.$inferInsert;
export type IcpProfileRecord = typeof icpProfiles.$inferSelect;

export type InsertValidationContact = typeof validationContacts.$inferInsert;
export type ValidationContactRecord = typeof validationContacts.$inferSelect;

export type InsertValidationScript = typeof validationScripts.$inferInsert;
export type ValidationScriptRecord = typeof validationScripts.$inferSelect;

// ICP Builder Insert Schemas
export const insertIcpProfileSchema = createInsertSchema(icpProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertValidationContactSchema = createInsertSchema(validationContacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertValidationScriptSchema = createInsertSchema(validationScripts).omit({
  id: true,
  createdAt: true,
});
