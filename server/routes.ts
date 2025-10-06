import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ideaFiltersSchema, insertIdeaSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { aiService, type IdeaGenerationParams } from "./aiService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Ideas routes
  app.get('/api/ideas', async (req, res) => {
    try {
      const filters = ideaFiltersSchema.parse(req.query);
      const result = await storage.getIdeas(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching ideas:", error);
      res.status(500).json({ message: "Failed to fetch ideas" });
    }
  });

  app.get('/api/ideas/featured', async (req, res) => {
    try {
      const idea = await storage.getFeaturedIdea();
      if (!idea) {
        return res.status(404).json({ message: "No featured idea found" });
      }
      res.json(idea);
    } catch (error) {
      console.error("Error fetching featured idea:", error);
      res.status(500).json({ message: "Failed to fetch featured idea" });
    }
  });

  app.get('/api/ideas/top', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const ideas = await storage.getTopIdeas(limit);
      res.json(ideas);
    } catch (error) {
      console.error("Error fetching top ideas:", error);
      res.status(500).json({ message: "Failed to fetch top ideas" });
    }
  });

  app.get('/api/ideas/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const idea = await storage.getIdeaBySlug(slug);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
      
      // Increment view count
      await storage.incrementIdeaView(idea.id);
      
      res.json(idea);
    } catch (error) {
      console.error("Error fetching idea:", error);
      res.status(500).json({ message: "Failed to fetch idea" });
    }
  });

  // Protected idea routes
  app.post('/api/ideas/:id/save', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      await storage.saveIdeaForUser(userId, id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving idea:", error);
      res.status(500).json({ message: "Failed to save idea" });
    }
  });

  app.delete('/api/ideas/:id/save', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      await storage.unsaveIdeaForUser(userId, id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error unsaving idea:", error);
      res.status(500).json({ message: "Failed to unsave idea" });
    }
  });

  app.post('/api/ideas/:id/vote', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { voteType } = req.body;
      
      if (!['up', 'down'].includes(voteType)) {
        return res.status(400).json({ message: "Invalid vote type" });
      }
      
      await storage.voteOnIdea(userId, id, voteType);
      res.json({ success: true });
    } catch (error) {
      console.error("Error voting on idea:", error);
      res.status(500).json({ message: "Failed to vote on idea" });
    }
  });

  app.delete('/api/ideas/:id/vote', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      await storage.removeVoteOnIdea(userId, id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing vote:", error);
      res.status(500).json({ message: "Failed to remove vote" });
    }
  });

  app.get('/api/ideas/:id/vote', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const vote = await storage.getUserVoteOnIdea(userId, id);
      res.json({ vote });
    } catch (error) {
      console.error("Error fetching user vote:", error);
      res.status(500).json({ message: "Failed to fetch user vote" });
    }
  });

  // Claim idea route
  app.post('/api/ideas/:id/claim', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      await storage.claimIdea(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error claiming idea:", error);
      res.status(500).json({ message: "Failed to claim idea" });
    }
  });

  // Rate idea route
  app.post('/api/ideas/:id/rate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { rating } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      
      await storage.rateIdea(userId, id, rating);
      res.json({ success: true });
    } catch (error) {
      console.error("Error rating idea:", error);
      res.status(500).json({ message: "Failed to rate idea" });
    }
  });

  // Get user rating
  app.get('/api/ideas/:id/rating', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const rating = await storage.getUserRating(userId, id);
      res.json({ rating });
    } catch (error) {
      console.error("Error fetching user rating:", error);
      res.status(500).json({ message: "Failed to fetch user rating" });
    }
  });

  // Export idea data
  app.get('/api/ideas/:id/export', async (req, res) => {
    try {
      const { id } = req.params;
      const idea = await storage.getIdeaById(id);
      
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      // Return idea as downloadable JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${idea.slug}.json"`);
      res.json(idea);
    } catch (error) {
      console.error("Error exporting idea:", error);
      res.status(500).json({ message: "Failed to export idea" });
    }
  });

  app.get('/api/users/saved-ideas', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const ideas = await storage.getUserSavedIdeas(userId);
      res.json(ideas);
    } catch (error) {
      console.error("Error fetching saved ideas:", error);
      res.status(500).json({ message: "Failed to fetch saved ideas" });
    }
  });

  // Tags routes
  app.get('/api/tags', async (req, res) => {
    try {
      const tags = await storage.getAllTags();
      res.json(tags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  app.get('/api/ideas/:id/tags', async (req, res) => {
    try {
      const { id } = req.params;
      const tags = await storage.getIdeaTags(id);
      res.json(tags);
    } catch (error) {
      console.error("Error fetching idea tags:", error);
      res.status(500).json({ message: "Failed to fetch idea tags" });
    }
  });

  // Community signals routes
  app.get('/api/ideas/:id/community-signals', async (req, res) => {
    try {
      const { id } = req.params;
      const signals = await storage.getCommunitySignalsForIdea(id);
      res.json(signals);
    } catch (error) {
      console.error("Error fetching community signals:", error);
      res.status(500).json({ message: "Failed to fetch community signals" });
    }
  });

  // Object storage routes
  app.post('/api/objects/upload', isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.post('/api/ideas/set-image', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { imageURL } = req.body;
      
      if (!imageURL) {
        return res.status(400).json({ error: "imageURL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        imageURL,
        {
          owner: userId,
          visibility: "public", // Ideas are generally public
        },
      );

      res.json({ objectPath });
    } catch (error) {
      console.error("Error setting image ACL:", error);
      res.status(500).json({ error: "Failed to set image ACL" });
    }
  });

  // Object serving route
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Create idea route
  app.post('/api/ideas', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const ideaData = req.body;
      
      // Generate slug from title
      const slug = ideaData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      // Set default scores for user-created ideas
      const newIdea = {
        ...ideaData,
        slug,
        createdBy: userId,
        opportunityScore: 7,
        opportunityLabel: "Good",
        problemScore: 7,
        problemLabel: "Good",
        feasibilityScore: 7,
        feasibilityLabel: "Good",
        timingScore: 7,
        timingLabel: "Good",
        executionScore: 7,
        gtmScore: 7,
        revenuePotential: "TBD",
        revenuePotentialNum: 1000000,
        executionDifficulty: "Medium",
        gtmStrength: "TBD",
        isPublished: true,
      };

      const createdIdea = await storage.createIdea(newIdea);
      res.json(createdIdea);
    } catch (error) {
      console.error("Error creating idea:", error);
      res.status(500).json({ message: "Failed to create idea" });
    }
  });

  // Build idea route - redirect to no-code builder
  app.post('/api/ideas/:id/build', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const idea = await storage.getIdeaById(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      // Create a simple builder URL (placeholder for now)
      const builderUrl = `https://builder.replit.com/new?template=web&name=${encodeURIComponent(idea.title.replace(/\s+/g, '-').toLowerCase())}&description=${encodeURIComponent(idea.description)}`;
      
      // Update idea with builder URL
      await storage.updateIdea(id, { builderUrl });
      
      res.json({ builderUrl });
    } catch (error) {
      console.error("Error creating builder project:", error);
      res.status(500).json({ message: "Failed to create builder project" });
    }
  });

  // AI-powered idea generation
  app.post('/api/ai/generate-idea', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate and parse generation parameters
      const generationSchema = z.object({
        industry: z.string().optional(),
        type: z.string().optional(),
        market: z.string().optional(),
        targetAudience: z.string().optional(),
        problemArea: z.string().optional(),
        constraints: z.string().optional(),
      });
      
      const params: IdeaGenerationParams = generationSchema.parse(req.body);
      
      // Generate idea using AI service
      const generatedIdea = await aiService.generateIdea(params);
      
      res.json(generatedIdea);
    } catch (error) {
      console.error("Error generating AI idea:", error);
      res.status(500).json({ 
        message: "Failed to generate idea",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // AI-powered research report generation
  app.post('/api/ai/research-report', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Validate request body
      const reportSchema = z.object({
        ideaTitle: z.string().min(1),
        ideaDescription: z.string().min(1),
      });
      
      const { ideaTitle, ideaDescription } = reportSchema.parse(req.body);
      
      // Generate research report using AI service
      const researchReport = await aiService.generateResearchReport(ideaTitle, ideaDescription);
      
      res.json(researchReport);
    } catch (error) {
      console.error("Error generating AI research report:", error);
      res.status(500).json({ 
        message: "Failed to generate research report",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // AI chat for idea Q&A
  app.post('/api/ai/chat', async (req, res) => {
    try {
      // Validate request body
      const chatSchema = z.object({
        ideaId: z.string(),
        message: z.string().min(1),
        history: z.array(z.object({
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })).optional(),
      });
      
      const { ideaId, message, history = [] } = chatSchema.parse(req.body);
      
      // Get idea details
      const idea = await storage.getIdeaById(ideaId);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      // Generate chat response using AI service
      const response = await aiService.generateChatResponse(idea, message, history);
      
      res.json({ response });
    } catch (error) {
      console.error("Error generating AI chat response:", error);
      res.status(500).json({ 
        message: "Failed to generate chat response",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
