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
  
  // User creation tracking
  createdBy: varchar("created_by").references(() => users.id),
  sourceType: varchar("source_type").default('curated'), // 'curated', 'user_import', 'user_generated'
  sourceData: text("source_data"), // Original imported HTML/instructions
  builderUrl: varchar("builder_url"), // URL to no-code builder project
  
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
  
  // User engagement
  claimedBy: varchar("claimed_by").references(() => users.id), // User who claimed the idea
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
  sortBy: z.enum(['newest', 'popular', 'opportunity', 'revenue']).default('newest'),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type IdeaFilters = z.infer<typeof ideaFiltersSchema>;
