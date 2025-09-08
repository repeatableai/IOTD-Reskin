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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  savedIdeas: many(userSavedIdeas),
  votes: many(userIdeaVotes),
  createdIdeas: many(ideas),
}));

export const ideasRelations = relations(ideas, ({ many, one }) => ({
  tags: many(ideaTags),
  saves: many(userSavedIdeas),
  votes: many(userIdeaVotes),
  communitySignals: many(communitySignals),
  creator: one(users, {
    fields: [ideas.createdBy],
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

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertIdea = typeof ideas.$inferInsert;
export type Idea = typeof ideas.$inferSelect;

export type InsertTag = typeof tags.$inferInsert;
export type Tag = typeof tags.$inferSelect;

export type InsertCommunitySignal = typeof communitySignals.$inferInsert;
export type CommunitySignal = typeof communitySignals.$inferSelect;

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
