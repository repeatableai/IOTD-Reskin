import {
  users,
  ideas,
  tags,
  ideaTags,
  userSavedIdeas,
  userIdeaVotes,
  userIdeaRatings,
  userIdeaInteractions,
  communitySignals,
  contactSubmissions,
  researchRequests,
  faqQuestions,
  toolsLibrary,
  userToolFavorites,
  importJobs,
  type User,
  type UpsertUser,
  type Idea,
  type InsertIdea,
  type Tag,
  type InsertTag,
  type CommunitySignal,
  type InsertCommunitySignal,
  type IdeaFilters,
  type ContactSubmission,
  type InsertContactSubmission,
  type ResearchRequest,
  type InsertResearchRequest,
  type FaqQuestion,
  type Tool,
  type UserIdeaInteraction,
  type ImportJob,
  type InsertImportJob,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, ilike, desc, asc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Ideas operations
  getIdeas(filters: IdeaFilters, userId?: string): Promise<{ ideas: Idea[]; total: number }>;
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
  claimIdea(ideaId: string, userId: string): Promise<{ success: boolean; claimedAt: Date }>;
  unclaimIdea(ideaId: string, userId: string): Promise<void>;
  getClaimStatus(ideaId: string): Promise<{ isClaimed: boolean; claimedBy: string | null; claimedAt: Date | null; claimProgress: number; claimCount: number; claimer?: any }>;
  updateClaimProgress(ideaId: string, userId: string, data: { progress?: number; notes?: string; milestones?: any[] }): Promise<{ success: boolean }>;
  getUserClaimedIdeas(userId: string): Promise<Idea[]>;
  logExport(userId: string, ideaId: string, exportType: string, exportUrl?: string): Promise<void>;
  rateIdea(userId: string, ideaId: string, rating: number): Promise<void>;
  getUserRating(userId: string, ideaId: string): Promise<number | null>;
  
  // Community signals
  getCommunitySignalsForIdea(ideaId: string): Promise<CommunitySignal[]>;
  createCommunitySignal(signal: InsertCommunitySignal): Promise<CommunitySignal>;
  
  // Contact submissions
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  
  // Research requests
  createResearchRequest(request: InsertResearchRequest): Promise<ResearchRequest>;
  getUserResearchRequests(userId: string): Promise<ResearchRequest[]>;
  
  // FAQ questions
  getFaqQuestions(category?: string): Promise<FaqQuestion[]>;
  voteFaqQuestion(id: string, helpful: boolean): Promise<void>;
  
  // Tools library
  getTools(category?: string, search?: string): Promise<Tool[]>;
  toggleToolFavorite(userId: string, toolId: string): Promise<boolean>;
  getUserFavoriteTools(userId: string): Promise<Tool[]>;
  
  // User idea interactions (interested, not interested, building, saved)
  setIdeaInteraction(userId: string, ideaId: string, status: string): Promise<void>;
  removeIdeaInteraction(userId: string, ideaId: string, status: string): Promise<void>;
  getUserIdeaInteraction(userId: string, ideaId: string): Promise<string | null>;
  getIdeasByInteraction(userId: string, status: string): Promise<Idea[]>;
  
  // For You personalized recommendations
  getForYouIdeas(userId: string, limit: number, offset: number): Promise<{ ideas: Idea[]; total: number }>;
  
  // Import jobs
  createImportJob(job: InsertImportJob): Promise<ImportJob>;
  getImportJob(jobId: string): Promise<ImportJob | undefined>;
  updateImportJob(jobId: string, updates: Partial<ImportJob>): Promise<ImportJob>;
  getIdeasWithoutImages(limit: number): Promise<Idea[]>;
  
  // Slug checking - check if ANY idea (published or unpublished) has this slug
  slugExists(slug: string): Promise<boolean>;
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
  async getIdeas(filters: IdeaFilters, userId?: string): Promise<{ ideas: Idea[]; total: number }> {
    try {
      // Handle For You personalized recommendations
      if (filters.forYou && userId) {
        return this.getForYouIdeas(userId, filters.limit, filters.offset);
      }
      
      const conditions = [eq(ideas.isPublished, true)];

    if (filters.search) {
      const searchCondition = or(
        ilike(ideas.title, `%${filters.search}%`),
        ilike(ideas.description, `%${filters.search}%`),
        ilike(ideas.keyword, `%${filters.search}%`),
        ilike(ideas.targetAudience, `%${filters.search}%`),
        ilike(ideas.content, `%${filters.search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Handle tags/category filter - search across relevant fields
    if (filters.tags && filters.tags.length > 0) {
      const tagConditions = filters.tags.map(tag => 
        or(
          ilike(ideas.title, `%${tag}%`),
          ilike(ideas.description, `%${tag}%`),
          ilike(ideas.keyword, `%${tag}%`),
          ilike(ideas.targetAudience, `%${tag}%`),
          ilike(ideas.content, `%${tag}%`)
        )
      );
      // At least one tag should match
      const combinedTagCondition = or(...tagConditions.filter(Boolean) as any[]);
      if (combinedTagCondition) {
        conditions.push(combinedTagCondition);
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

    // Premium filters
    if (filters.isGregsPick) {
      conditions.push(eq(ideas.isGregsPick, true));
    }

    // User status filtering - requires userId and userStatus filter
    if (filters.userStatus && userId) {
      const userInteractions = await db
        .select({ ideaId: userIdeaInteractions.ideaId })
        .from(userIdeaInteractions)
        .where(
          and(
            eq(userIdeaInteractions.userId, userId),
            eq(userIdeaInteractions.status, filters.userStatus)
          )
        );
      
      const ideaIds = userInteractions.map(i => i.ideaId);
      if (ideaIds.length > 0) {
        conditions.push(inArray(ideas.id, ideaIds));
      } else {
        // No ideas match this status, return empty result
        return { ideas: [], total: 0 };
      }
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

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
    let query = db.select().from(ideas);
    if (whereCondition) {
      query = query.where(whereCondition) as any;
    }
    const ideasResult = await query
      .orderBy(...orderByClause)
      .limit(filters.limit || 20)
      .offset(filters.offset || 0);

    // Count query
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(ideas);
    if (whereCondition) {
      countQuery = countQuery.where(whereCondition) as any;
    }
    const countResult = await countQuery;

    return {
      ideas: ideasResult || [],
      total: Number(countResult[0]?.count || 0)
    };
    } catch (error: any) {
      console.error("[getIdeas] Database error:", error?.message);
      console.error("[getIdeas] Error stack:", error?.stack);
      console.error("[getIdeas] Filters:", JSON.stringify(filters, null, 2));
      throw error;
    }
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
    try {
      // Get all published ideas
      const allIdeas = await db
        .select()
        .from(ideas)
        .where(eq(ideas.isPublished, true))
        .orderBy(asc(ideas.createdAt)); // Consistent ordering
      
      if (!allIdeas || allIdeas.length === 0) {
        console.warn("[getFeaturedIdea] No published ideas found in database");
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
      const selectedIdea = allIdeas[index];
      
      if (!selectedIdea) {
        console.warn("[getFeaturedIdea] Selected idea is undefined, returning first idea");
        return allIdeas[0];
      }
      
      return selectedIdea;
    } catch (error: any) {
      console.error("[getFeaturedIdea] Database error:", error?.message);
      console.error("[getFeaturedIdea] Error stack:", error?.stack);
      throw error;
    }
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
  async claimIdea(ideaId: string, userId: string): Promise<{ success: boolean; claimedAt: Date }> {
    // Check if idea is already claimed
    const [idea] = await db.select().from(ideas).where(eq(ideas.id, ideaId));
    if (idea?.claimedBy) {
      throw new Error('Idea is already claimed');
    }
    
    const claimedAt = new Date();
    
    await db
      .update(ideas)
      .set({ 
        claimedBy: userId,
        claimedAt: claimedAt,
        claimCount: sql`COALESCE(${ideas.claimCount}, 0) + 1`
      })
      .where(eq(ideas.id, ideaId));
    
    return { success: true, claimedAt };
  }
  
  async unclaimIdea(ideaId: string, userId: string): Promise<void> {
    // Check if user is the one who claimed
    const [idea] = await db.select().from(ideas).where(eq(ideas.id, ideaId));
    if (idea?.claimedBy !== userId) {
      throw new Error('You have not claimed this idea');
    }
    
    await db
      .update(ideas)
      .set({ 
        claimedBy: null,
        claimedAt: null,
        claimProgress: 0,
        claimMilestones: null
      })
      .where(eq(ideas.id, ideaId));
  }
  
  async getClaimStatus(ideaId: string): Promise<{
    isClaimed: boolean;
    claimedBy: string | null;
    claimedAt: Date | null;
    claimProgress: number;
    claimCount: number;
    claimer?: { id: string; firstName: string | null; lastName: string | null; profileImageUrl: string | null };
  }> {
    const [idea] = await db.select().from(ideas).where(eq(ideas.id, ideaId));
    if (!idea) {
      return { isClaimed: false, claimedBy: null, claimedAt: null, claimProgress: 0, claimCount: 0 };
    }
    
    let claimer = undefined;
    if (idea.claimedBy) {
      const [user] = await db.select().from(users).where(eq(users.id, idea.claimedBy));
      if (user) {
        claimer = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl
        };
      }
    }
    
    return {
      isClaimed: !!idea.claimedBy,
      claimedBy: idea.claimedBy,
      claimedAt: idea.claimedAt,
      claimProgress: idea.claimProgress || 0,
      claimCount: idea.claimCount || 0,
      claimer
    };
  }
  
  async updateClaimProgress(ideaId: string, userId: string, data: { 
    progress?: number; 
    notes?: string; 
    milestones?: any[] 
  }): Promise<{ success: boolean }> {
    // Check if user is the one who claimed
    const [idea] = await db.select().from(ideas).where(eq(ideas.id, ideaId));
    if (idea?.claimedBy !== userId) {
      throw new Error('You have not claimed this idea');
    }
    
    const updateData: any = {};
    if (data.progress !== undefined) updateData.claimProgress = data.progress;
    if (data.milestones !== undefined) updateData.claimMilestones = data.milestones;
    
    await db
      .update(ideas)
      .set(updateData)
      .where(eq(ideas.id, ideaId));
    
    return { success: true };
  }
  
  async getUserClaimedIdeas(userId: string): Promise<Idea[]> {
    return await db
      .select()
      .from(ideas)
      .where(eq(ideas.claimedBy, userId))
      .orderBy(desc(ideas.claimedAt));
  }
  
  async logExport(userId: string, ideaId: string, exportType: string, exportUrl?: string): Promise<void> {
    // For now, just log to console - can add to exportHistory table later
    console.log(`Export: user=${userId}, idea=${ideaId}, type=${exportType}, url=${exportUrl || 'N/A'}`);
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

  // Contact submissions
  async createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission> {
    const [newSubmission] = await db.insert(contactSubmissions).values(submission).returning();
    return newSubmission;
  }

  // Research requests
  async createResearchRequest(request: InsertResearchRequest): Promise<ResearchRequest> {
    const [newRequest] = await db.insert(researchRequests).values(request).returning();
    return newRequest;
  }

  async getUserResearchRequests(userId: string): Promise<ResearchRequest[]> {
    return await db
      .select()
      .from(researchRequests)
      .where(eq(researchRequests.userId, userId))
      .orderBy(desc(researchRequests.createdAt));
  }

  // FAQ questions
  async getFaqQuestions(category?: string): Promise<FaqQuestion[]> {
    const conditions = [eq(faqQuestions.isPublished, true)];
    
    if (category) {
      conditions.push(eq(faqQuestions.category, category));
    }

    return await db
      .select()
      .from(faqQuestions)
      .where(and(...conditions))
      .orderBy(asc(faqQuestions.order), desc(faqQuestions.createdAt));
  }

  async voteFaqQuestion(id: string, helpful: boolean): Promise<void> {
    const field = helpful ? faqQuestions.helpful : faqQuestions.notHelpful;
    
    await db
      .update(faqQuestions)
      .set({
        [helpful ? 'helpful' : 'notHelpful']: sql`${field} + 1`
      })
      .where(eq(faqQuestions.id, id));
  }

  // Tools library
  async getTools(category?: string, search?: string): Promise<Tool[]> {
    const conditions = [];
    
    if (category) {
      conditions.push(eq(toolsLibrary.category, category));
    }

    if (search) {
      const searchCondition = or(
        ilike(toolsLibrary.name, `%${search}%`),
        ilike(toolsLibrary.description, `%${search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

    return await db
      .select()
      .from(toolsLibrary)
      .where(whereCondition)
      .orderBy(
        desc(toolsLibrary.isFeatured),
        desc(toolsLibrary.isNew),
        asc(toolsLibrary.name)
      );
  }

  async toggleToolFavorite(userId: string, toolId: string): Promise<boolean> {
    // Check if already favorited
    const [existing] = await db
      .select()
      .from(userToolFavorites)
      .where(and(eq(userToolFavorites.userId, userId), eq(userToolFavorites.toolId, toolId)));

    if (existing) {
      // Remove favorite
      await db
        .delete(userToolFavorites)
        .where(and(eq(userToolFavorites.userId, userId), eq(userToolFavorites.toolId, toolId)));
      return false;
    } else {
      // Add favorite
      await db.insert(userToolFavorites).values({ userId, toolId });
      return true;
    }
  }

  async getUserFavoriteTools(userId: string): Promise<Tool[]> {
    return await db
      .select({
        id: toolsLibrary.id,
        name: toolsLibrary.name,
        description: toolsLibrary.description,
        category: toolsLibrary.category,
        url: toolsLibrary.url,
        imageUrl: toolsLibrary.imageUrl,
        isPremium: toolsLibrary.isPremium,
        isFeatured: toolsLibrary.isFeatured,
        isNew: toolsLibrary.isNew,
        tags: toolsLibrary.tags,
        createdAt: toolsLibrary.createdAt,
        updatedAt: toolsLibrary.updatedAt,
      })
      .from(userToolFavorites)
      .innerJoin(toolsLibrary, eq(userToolFavorites.toolId, toolsLibrary.id))
      .where(eq(userToolFavorites.userId, userId))
      .orderBy(desc(userToolFavorites.createdAt));
  }

  // User idea interactions
  async setIdeaInteraction(userId: string, ideaId: string, status: string): Promise<void> {
    // Map status to boolean fields
    const statusFields = {
      isInterested: status === 'interested',
      isNotInterested: status === 'not_interested',
      isBuilding: status === 'building',
    };

    await db
      .insert(userIdeaInteractions)
      .values({
        userId,
        ideaId,
        ...statusFields,
      })
      .onConflictDoUpdate({
        target: [userIdeaInteractions.userId, userIdeaInteractions.ideaId],
        set: {
          ...statusFields,
          updatedAt: sql`now()`,
        },
      });
  }

  async removeIdeaInteraction(userId: string, ideaId: string, status: string): Promise<void> {
    // Map status to boolean fields - set to false
    const statusFields = {
      isInterested: status === 'interested' ? false : undefined,
      isNotInterested: status === 'not_interested' ? false : undefined,
      isBuilding: status === 'building' ? false : undefined,
    };

    // Filter out undefined values
    const updateFields = Object.fromEntries(
      Object.entries(statusFields).filter(([_, v]) => v !== undefined)
    );

    await db
      .update(userIdeaInteractions)
      .set({
        ...updateFields,
        updatedAt: sql`now()`,
      })
      .where(and(
        eq(userIdeaInteractions.userId, userId),
        eq(userIdeaInteractions.ideaId, ideaId)
      ));
  }

  async getUserIdeaInteraction(userId: string, ideaId: string): Promise<string | null> {
    const [interaction] = await db
      .select()
      .from(userIdeaInteractions)
      .where(and(
        eq(userIdeaInteractions.userId, userId),
        eq(userIdeaInteractions.ideaId, ideaId)
      ))
      .limit(1);

    if (!interaction) return null;

    // Convert boolean fields back to status string
    if (interaction.isInterested) return 'interested';
    if (interaction.isNotInterested) return 'not_interested';
    if (interaction.isBuilding) return 'building';

    return null;
  }

  async getIdeasByInteraction(userId: string, status: string): Promise<Idea[]> {
    return await db
      .select({
        id: ideas.id,
        title: ideas.title,
        subtitle: ideas.subtitle,
        slug: ideas.slug,
        description: ideas.description,
        content: ideas.content,
        imageUrl: ideas.imageUrl,
        type: ideas.type,
        market: ideas.market,
        targetAudience: ideas.targetAudience,
        mainCompetitor: ideas.mainCompetitor,
        keyword: ideas.keyword,
        keywordVolume: ideas.keywordVolume,
        keywordGrowth: ideas.keywordGrowth,
        opportunityScore: ideas.opportunityScore,
        opportunityLabel: ideas.opportunityLabel,
        problemScore: ideas.problemScore,
        problemLabel: ideas.problemLabel,
        feasibilityScore: ideas.feasibilityScore,
        feasibilityLabel: ideas.feasibilityLabel,
        timingScore: ideas.timingScore,
        timingLabel: ideas.timingLabel,
        executionScore: ideas.executionScore,
        gtmScore: ideas.gtmScore,
        revenuePotential: ideas.revenuePotential,
        revenuePotentialNum: ideas.revenuePotentialNum,
        executionDifficulty: ideas.executionDifficulty,
        gtmStrength: ideas.gtmStrength,
        viewCount: ideas.viewCount,
        saveCount: ideas.saveCount,
        voteCount: ideas.voteCount,
        isPublished: ideas.isPublished,
        isFeatured: ideas.isFeatured,
        createdBy: ideas.createdBy,
        sourceType: ideas.sourceType,
        sourceData: ideas.sourceData,
        builderUrl: ideas.builderUrl,
        offerTiers: ideas.offerTiers,
        whyNowAnalysis: ideas.whyNowAnalysis,
        proofSignals: ideas.proofSignals,
        marketGap: ideas.marketGap,
        executionPlan: ideas.executionPlan,
        frameworkData: ideas.frameworkData,
        trendAnalysis: ideas.trendAnalysis,
        keywordData: ideas.keywordData,
        builderPrompts: ideas.builderPrompts,
        communitySignals: ideas.communitySignals,
        signalBadges: ideas.signalBadges,
        claimedBy: ideas.claimedBy,
        averageRating: ideas.averageRating,
        ratingCount: ideas.ratingCount,
        createdAt: ideas.createdAt,
        updatedAt: ideas.updatedAt,
      })
      .from(userIdeaInteractions)
      .innerJoin(ideas, eq(userIdeaInteractions.ideaId, ideas.id))
      .where(and(
        eq(userIdeaInteractions.userId, userId),
        status === 'interested' ? eq(userIdeaInteractions.isInterested, true) :
        status === 'not_interested' ? eq(userIdeaInteractions.isNotInterested, true) :
        status === 'building' ? eq(userIdeaInteractions.isBuilding, true) :
        sql`false`
      ))
      .orderBy(desc(userIdeaInteractions.createdAt));
  }
  
  // For You personalized recommendations based on user behavior
  async getForYouIdeas(userId: string, limit: number, offset: number): Promise<{ ideas: Idea[]; total: number }> {
    // Step 1: Get user's interacted ideas (saved, interested, upvoted)
    const savedIdeas = await db
      .select({ ideaId: userSavedIdeas.ideaId })
      .from(userSavedIdeas)
      .where(eq(userSavedIdeas.userId, userId));
    
    const upvotedIdeas = await db
      .select({ ideaId: userIdeaVotes.ideaId })
      .from(userIdeaVotes)
      .where(and(
        eq(userIdeaVotes.userId, userId),
        eq(userIdeaVotes.voteType, 'up')
      ));
    
    const interestedIdeas = await db
      .select({ ideaId: userIdeaInteractions.ideaId })
      .from(userIdeaInteractions)
      .where(and(
        eq(userIdeaInteractions.userId, userId),
        eq(userIdeaInteractions.isInterested, true)
      ));
    
    // Combine all interacted idea IDs
    const interactedIdeaIds = new Set([
      ...savedIdeas.map(s => s.ideaId),
      ...upvotedIdeas.map(v => v.ideaId),
      ...interestedIdeas.map(i => i.ideaId)
    ].filter(Boolean) as string[]);
    
    // Step 2: Get preferences from interacted ideas
    if (interactedIdeaIds.size === 0) {
      // No interactions yet - show trending/popular ideas
      const trendingIdeas = await db
        .select()
        .from(ideas)
        .where(eq(ideas.isPublished, true))
        .orderBy(desc(ideas.voteCount), desc(ideas.viewCount), desc(ideas.opportunityScore))
        .limit(limit)
        .offset(offset);
      
      const countResult = await db
        .select({ count: sql`count(*)` })
        .from(ideas)
        .where(eq(ideas.isPublished, true));
      
      return {
        ideas: trendingIdeas,
        total: Number(countResult[0]?.count || 0)
      };
    }
    
    // Get market and type preferences from interacted ideas
    const interactedIdeasData = await db
      .select({
        market: ideas.market,
        type: ideas.type,
        keyword: ideas.keyword
      })
      .from(ideas)
      .where(inArray(ideas.id, Array.from(interactedIdeaIds)));
    
    // Count preferences
    const marketCounts: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};
    
    interactedIdeasData.forEach(idea => {
      if (idea.market) {
        marketCounts[idea.market] = (marketCounts[idea.market] || 0) + 1;
      }
      if (idea.type) {
        typeCounts[idea.type] = (typeCounts[idea.type] || 0) + 1;
      }
    });
    
    // Get preferred markets and types (top 2 of each)
    const preferredMarkets = Object.entries(marketCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([market]) => market);
    
    const preferredTypes = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([type]) => type);
    
    // Get not interested ideas to exclude
    const notInterestedIdeas = await db
      .select({ ideaId: userIdeaInteractions.ideaId })
      .from(userIdeaInteractions)
      .where(and(
        eq(userIdeaInteractions.userId, userId),
        eq(userIdeaInteractions.isNotInterested, true)
      ));
    
    const excludeIds = new Set([
      ...interactedIdeaIds,
      ...notInterestedIdeas.map(n => n.ideaId).filter(Boolean) as string[]
    ]);
    
    // Step 3: Build recommendation query
    const conditions = [
      eq(ideas.isPublished, true)
    ];
    
    // Exclude already interacted ideas
    if (excludeIds.size > 0) {
      conditions.push(sql`${ideas.id} NOT IN (${sql.join(Array.from(excludeIds).map(id => sql`${id}`), sql`, `)})`);
    }
    
    // Prefer ideas matching user preferences
    const preferenceConditions = [];
    if (preferredMarkets.length > 0) {
      preferenceConditions.push(inArray(ideas.market, preferredMarkets));
    }
    if (preferredTypes.length > 0) {
      preferenceConditions.push(inArray(ideas.type, preferredTypes));
    }
    
    // Create a relevance score for ordering
    // Ideas matching preferences come first, sorted by opportunity score
    const recommendedIdeas = await db
      .select()
      .from(ideas)
      .where(and(...conditions))
      .orderBy(
        // Prioritize matching markets and types
        sql`CASE 
          WHEN ${ideas.market} IN (${sql.join(preferredMarkets.map(m => sql`${m}`), sql`, `)}) 
          AND ${ideas.type} IN (${sql.join(preferredTypes.map(t => sql`${t}`), sql`, `)}) THEN 1
          WHEN ${ideas.market} IN (${sql.join(preferredMarkets.map(m => sql`${m}`), sql`, `)}) THEN 2
          WHEN ${ideas.type} IN (${sql.join(preferredTypes.map(t => sql`${t}`), sql`, `)}) THEN 3
          ELSE 4
        END`,
        desc(ideas.opportunityScore),
        desc(ideas.voteCount)
      )
      .limit(limit)
      .offset(offset);
    
    // Count total recommendations (excluding already interacted)
    const countResult = await db
      .select({ count: sql`count(*)` })
      .from(ideas)
      .where(and(...conditions));
    
    return {
      ideas: recommendedIdeas,
      total: Number(countResult[0]?.count || 0)
    };
  }

  // Import jobs
  async createImportJob(job: InsertImportJob): Promise<ImportJob> {
    const [newJob] = await db.insert(importJobs).values(job).returning();
    return newJob;
  }

  async getImportJob(jobId: string): Promise<ImportJob | undefined> {
    const [job] = await db.select().from(importJobs).where(eq(importJobs.id, jobId));
    return job;
  }

  async updateImportJob(jobId: string, updates: Partial<ImportJob>): Promise<ImportJob> {
    const [updated] = await db
      .update(importJobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(importJobs.id, jobId))
      .returning();
    return updated;
  }

  async getIdeasWithoutImages(limit: number): Promise<Idea[]> {
    return await db
      .select()
      .from(ideas)
      .where(and(
        sql`${ideas.imageUrl} IS NULL`,
        eq(ideas.isPublished, true)
      ))
      .limit(limit);
  }

  async slugExists(slug: string): Promise<boolean> {
    const [idea] = await db
      .select()
      .from(ideas)
      .where(eq(ideas.slug, slug))
      .limit(1);
    return !!idea;
  }
}

export const storage = new DatabaseStorage();
