import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ideaFiltersSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}
