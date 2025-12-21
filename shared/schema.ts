import { sql } from 'drizzle-orm';
import {
  index,
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
});

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
});

// User saved ideas
export const userSavedIdeas = pgTable("user_saved_ideas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

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
  sql`UNIQUE (user_id, idea_id)`,
]);

// User votes on ideas
export const userIdeaVotes = pgTable("user_idea_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: 'cascade' }),
  voteType: varchar("vote_type").notNull(), // 'up' or 'down'
  createdAt: timestamp("created_at").defaultNow(),
});

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
});

// User ratings table
export const userIdeaRatings = pgTable("user_idea_ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: 'cascade' }),
  rating: integer("rating").notNull(), // 1-5 scale
  createdAt: timestamp("created_at").defaultNow(),
});

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
