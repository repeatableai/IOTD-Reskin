import {
  users,
  ideas,
  tags,
  ideaTags,
  userSavedIdeas,
  userIdeaVotes,
  userIdeaRatings,
  communitySignals,
  type User,
  type UpsertUser,
  type Idea,
  type InsertIdea,
  type Tag,
  type InsertTag,
  type CommunitySignal,
  type InsertCommunitySignal,
  type IdeaFilters,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, desc, asc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Ideas operations
  getIdeas(filters: IdeaFilters): Promise<{ ideas: Idea[]; total: number }>;
  getIdeaBySlug(slug: string): Promise<Idea | undefined>;
  getIdeaById(id: string): Promise<Idea | undefined>;
  createIdea(idea: InsertIdea): Promise<Idea>;
  updateIdea(id: string, idea: Partial<InsertIdea>): Promise<Idea>;
  deleteIdea(id: string): Promise<void>;
  getFeaturedIdea(date?: string): Promise<Idea | undefined>;
  getTopIdeas(limit: number): Promise<Idea[]>;
  incrementIdeaView(id: string): Promise<void>;
  
  // Tags operations
  getAllTags(): Promise<Tag[]>;
  getIdeaTags(ideaId: string): Promise<Tag[]>;
  createTag(tag: InsertTag): Promise<Tag>;
  addTagToIdea(ideaId: string, tagId: string): Promise<void>;
  removeTagFromIdea(ideaId: string, tagId: string): Promise<void>;
  
  // User interactions
  saveIdeaForUser(userId: string, ideaId: string): Promise<void>;
  unsaveIdeaForUser(userId: string, ideaId: string): Promise<void>;
  getUserSavedIdeas(userId: string): Promise<Idea[]>;
  voteOnIdea(userId: string, ideaId: string, voteType: 'up' | 'down'): Promise<void>;
  removeVoteOnIdea(userId: string, ideaId: string): Promise<void>;
  getUserVoteOnIdea(userId: string, ideaId: string): Promise<'up' | 'down' | null>;
  
  // Claim and rating operations
  claimIdea(ideaId: string, userId: string): Promise<void>;
  rateIdea(userId: string, ideaId: string, rating: number): Promise<void>;
  getUserRating(userId: string, ideaId: string): Promise<number | null>;
  
  // Community signals
  getCommunitySignalsForIdea(ideaId: string): Promise<CommunitySignal[]>;
  createCommunitySignal(signal: InsertCommunitySignal): Promise<CommunitySignal>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Ideas operations
  async getIdeas(filters: IdeaFilters): Promise<{ ideas: Idea[]; total: number }> {
    const conditions = [eq(ideas.isPublished, true)];

    if (filters.search) {
      const searchCondition = or(
        ilike(ideas.title, `%${filters.search}%`),
        ilike(ideas.description, `%${filters.search}%`),
        ilike(ideas.keyword, `%${filters.search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    if (filters.market) {
      conditions.push(eq(ideas.market, filters.market));
    }

    if (filters.type) {
      conditions.push(eq(ideas.type, filters.type));
    }

    if (filters.minOpportunityScore) {
      conditions.push(sql`${ideas.opportunityScore} >= ${filters.minOpportunityScore}`);
    }

    if (filters.maxExecutionScore) {
      conditions.push(sql`${ideas.executionScore} <= ${filters.maxExecutionScore}`);
    }

    if (filters.minRevenueNum) {
      conditions.push(sql`${ideas.revenuePotentialNum} >= ${filters.minRevenueNum}`);
    }

    if (filters.maxRevenueNum) {
      conditions.push(sql`${ideas.revenuePotentialNum} <= ${filters.maxRevenueNum}`);
    }

    const whereCondition = and(...conditions);

    // Determine ordering based on sortBy
    let orderByClause;
    switch (filters.sortBy) {
      case 'popular':
        orderByClause = [desc(ideas.voteCount), desc(ideas.viewCount)];
        break;
      case 'opportunity':
        orderByClause = [desc(ideas.opportunityScore), desc(ideas.createdAt)];
        break;
      case 'revenue':
        orderByClause = [desc(ideas.revenuePotentialNum), desc(ideas.createdAt)];
        break;
      default: // newest
        orderByClause = [desc(ideas.createdAt)];
        break;
    }

    // Build and execute the main query with all clauses in one chain
    const ideasResult = await db
      .select()
      .from(ideas)
      .where(whereCondition)
      .orderBy(...orderByClause)
      .limit(filters.limit)
      .offset(filters.offset);

    // Count query
    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(ideas)
      .where(whereCondition);

    return {
      ideas: ideasResult,
      total: Number(countResult[0]?.count || 0)
    };
  }

  async getIdeaBySlug(slug: string): Promise<Idea | undefined> {
    const [idea] = await db.select().from(ideas).where(and(eq(ideas.slug, slug), eq(ideas.isPublished, true)));
    return idea;
  }

  async getIdeaById(id: string): Promise<Idea | undefined> {
    const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
    return idea;
  }

  async createIdea(idea: InsertIdea): Promise<Idea> {
    const [newIdea] = await db.insert(ideas).values(idea).returning();
    return newIdea;
  }

  async updateIdea(id: string, idea: Partial<InsertIdea>): Promise<Idea> {
    const [updatedIdea] = await db
      .update(ideas)
      .set({ ...idea, updatedAt: new Date() })
      .where(eq(ideas.id, id))
      .returning();
    return updatedIdea;
  }

  async deleteIdea(id: string): Promise<void> {
    await db.delete(ideas).where(eq(ideas.id, id));
  }

  async getFeaturedIdea(date?: string): Promise<Idea | undefined> {
    // Get all published ideas
    const allIdeas = await db
      .select()
      .from(ideas)
      .where(eq(ideas.isPublished, true))
      .orderBy(asc(ideas.createdAt)); // Consistent ordering
    
    if (allIdeas.length === 0) {
      return undefined;
    }
    
    // Use date to deterministically select an idea
    const dateStr = date || new Date().toISOString().split('T')[0];
    
    // Simple hash function to convert date string to a number
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = ((hash << 5) - hash) + dateStr.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use absolute value and modulo to get an index
    const index = Math.abs(hash) % allIdeas.length;
    return allIdeas[index];
  }

  async getTopIdeas(limit: number): Promise<Idea[]> {
    return await db
      .select()
      .from(ideas)
      .where(eq(ideas.isPublished, true))
      .orderBy(desc(ideas.voteCount), desc(ideas.viewCount))
      .limit(limit);
  }

  async incrementIdeaView(id: string): Promise<void> {
    await db
      .update(ideas)
      .set({ viewCount: sql`${ideas.viewCount} + 1` })
      .where(eq(ideas.id, id));
  }

  // Tags operations
  async getAllTags(): Promise<Tag[]> {
    return await db.select().from(tags).orderBy(asc(tags.name));
  }

  async getIdeaTags(ideaId: string): Promise<Tag[]> {
    const result = await db
      .select({
        id: tags.id,
        name: tags.name,
        color: tags.color,
        createdAt: tags.createdAt,
      })
      .from(tags)
      .innerJoin(ideaTags, eq(tags.id, ideaTags.tagId))
      .where(eq(ideaTags.ideaId, ideaId));
    
    return result;
  }

  async createTag(tag: InsertTag): Promise<Tag> {
    const [newTag] = await db.insert(tags).values(tag).returning();
    return newTag;
  }

  async addTagToIdea(ideaId: string, tagId: string): Promise<void> {
    await db.insert(ideaTags).values({ ideaId, tagId });
  }

  async removeTagFromIdea(ideaId: string, tagId: string): Promise<void> {
    await db.delete(ideaTags).where(and(eq(ideaTags.ideaId, ideaId), eq(ideaTags.tagId, tagId)));
  }

  // User interactions
  async saveIdeaForUser(userId: string, ideaId: string): Promise<void> {
    await db.insert(userSavedIdeas).values({ userId, ideaId });
    await db
      .update(ideas)
      .set({ saveCount: sql`${ideas.saveCount} + 1` })
      .where(eq(ideas.id, ideaId));
  }

  async unsaveIdeaForUser(userId: string, ideaId: string): Promise<void> {
    await db.delete(userSavedIdeas).where(and(eq(userSavedIdeas.userId, userId), eq(userSavedIdeas.ideaId, ideaId)));
    await db
      .update(ideas)
      .set({ saveCount: sql`${ideas.saveCount} - 1` })
      .where(eq(ideas.id, ideaId));
  }

  async getUserSavedIdeas(userId: string): Promise<Idea[]> {
    const result = await db
      .select()
      .from(ideas)
      .innerJoin(userSavedIdeas, eq(ideas.id, userSavedIdeas.ideaId))
      .where(eq(userSavedIdeas.userId, userId))
      .orderBy(desc(userSavedIdeas.createdAt));
    
    return result.map(row => row.ideas);
  }

  async voteOnIdea(userId: string, ideaId: string, voteType: 'up' | 'down'): Promise<void> {
    // Remove existing vote if any
    await this.removeVoteOnIdea(userId, ideaId);
    
    // Add new vote
    await db.insert(userIdeaVotes).values({ userId, ideaId, voteType });
    
    // Update vote count
    const increment = voteType === 'up' ? 1 : -1;
    await db
      .update(ideas)
      .set({ voteCount: sql`${ideas.voteCount} + ${increment}` })
      .where(eq(ideas.id, ideaId));
  }

  async removeVoteOnIdea(userId: string, ideaId: string): Promise<void> {
    const [existingVote] = await db
      .select()
      .from(userIdeaVotes)
      .where(and(eq(userIdeaVotes.userId, userId), eq(userIdeaVotes.ideaId, ideaId)));
    
    if (existingVote) {
      await db.delete(userIdeaVotes).where(and(eq(userIdeaVotes.userId, userId), eq(userIdeaVotes.ideaId, ideaId)));
      
      const decrement = existingVote.voteType === 'up' ? -1 : 1;
      await db
        .update(ideas)
        .set({ voteCount: sql`${ideas.voteCount} + ${decrement}` })
        .where(eq(ideas.id, ideaId));
    }
  }

  async getUserVoteOnIdea(userId: string, ideaId: string): Promise<'up' | 'down' | null> {
    const [vote] = await db
      .select({ voteType: userIdeaVotes.voteType })
      .from(userIdeaVotes)
      .where(and(eq(userIdeaVotes.userId, userId), eq(userIdeaVotes.ideaId, ideaId)));
    
    return vote ? (vote.voteType as 'up' | 'down') : null;
  }

  // Community signals
  async getCommunitySignalsForIdea(ideaId: string): Promise<CommunitySignal[]> {
    return await db
      .select()
      .from(communitySignals)
      .where(eq(communitySignals.ideaId, ideaId))
      .orderBy(desc(communitySignals.engagementScore));
  }

  async createCommunitySignal(signal: InsertCommunitySignal): Promise<CommunitySignal> {
    const [newSignal] = await db.insert(communitySignals).values(signal).returning();
    return newSignal;
  }

  // Claim and rating operations
  async claimIdea(ideaId: string, userId: string): Promise<void> {
    await db
      .update(ideas)
      .set({ claimedBy: userId })
      .where(eq(ideas.id, ideaId));
  }

  async rateIdea(userId: string, ideaId: string, rating: number): Promise<void> {
    // Upsert user rating
    await db
      .insert(userIdeaRatings)
      .values({ userId, ideaId, rating })
      .onConflictDoUpdate({
        target: [userIdeaRatings.userId, userIdeaRatings.ideaId],
        set: { rating }
      });

    // Recalculate average rating
    const ratings = await db
      .select({ rating: userIdeaRatings.rating })
      .from(userIdeaRatings)
      .where(eq(userIdeaRatings.ideaId, ideaId));

    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    const ratingCount = ratings.length;

    await db
      .update(ideas)
      .set({ 
        averageRating: averageRating.toFixed(2),
        ratingCount 
      })
      .where(eq(ideas.id, ideaId));
  }

  async getUserRating(userId: string, ideaId: string): Promise<number | null> {
    const [rating] = await db
      .select({ rating: userIdeaRatings.rating })
      .from(userIdeaRatings)
      .where(and(eq(userIdeaRatings.userId, userId), eq(userIdeaRatings.ideaId, ideaId)));
    
    return rating ? rating.rating : null;
  }
}

export const storage = new DatabaseStorage();
