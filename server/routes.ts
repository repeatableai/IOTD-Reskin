import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, getSession } from "./replitAuth";
import { ideaFiltersSchema, insertIdeaSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { setupSocketServer } from "./socketServer";
import { ObjectPermission } from "./objectAcl";
import { aiService, type IdeaGenerationParams } from "./aiService";
import { externalDataService } from "./externalDataService";
import { getTrendData, getMultipleTrends, getRelatedQueries } from "./googleTrendsService";
import Anthropic from '@anthropic-ai/sdk';
import PDFDocument from 'pdfkit';
import { documentParser } from './documentParser';
import multer from 'multer';
import { spreadsheetParser } from './spreadsheetParser';
import { spreadsheetMapper } from './spreadsheetMapper';
import { slugService } from './slugService';
import { imageProcessor } from './imageProcessor';
import puppeteer from 'puppeteer';
import { db } from './db';
import { ideas, tags, ideaTags, communitySignals, collaborationMessages, collaborationSessions, users } from '@shared/schema';
import { eq, sql, desc, asc, inArray, and } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

// Create error log file
const ERROR_LOG_PATH = path.join(process.cwd(), 'server-errors.log');

function logErrorToFile(error: any, context: string) {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : 'No stack trace';
  const errorDetails = error instanceof Error ? JSON.stringify(error, Object.getOwnPropertyNames(error), 2) : String(error);
  
  const logEntry = `\n[${timestamp}] ${context}\nError: ${errorMessage}\nStack: ${errorStack}\nDetails: ${errorDetails}\n---\n`;
  
  try {
    fs.appendFileSync(ERROR_LOG_PATH, logEntry, 'utf8');
  } catch (e) {
    // If we can't write to file, at least log to console
    console.error(`[ERROR LOG FAILED] ${context}:`, error);
  }
  console.error(`[ERROR LOGGED TO FILE] ${context}:`, error);
}

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types for parsing
    cb(null, true);
  },
});

// Initialize Claude AI client for building prompts
// Note: Using claude-opus-4-5-20251101 (latest model)
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function registerRoutes(app: Express): Promise<{ server: Server; sessionMiddleware: ReturnType<typeof import('express-session')> }> {
  // CRITICAL: Early API request logger - runs before everything else
  // Use a function to match all API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/') || req.originalUrl.startsWith('/api/')) {
      console.log(`[API Request] ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
      console.log(`[API Request] Path: ${req.path}`);
      console.log(`[API Request] Content-Type: ${req.headers['content-type']}`);
      // Ensure JSON response for API routes
      res.setHeader('Content-Type', 'application/json');
    }
    next();
  });
  
  // Health check endpoint (for Render/load balancers)
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth middleware - capture the session middleware for Socket.io
  const sessionMiddleware = await setupAuth(app);

  // Auth routes - check auth status (returns 401 if not authenticated)
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check if user is authenticated - return 401 if not (frontend handles this)
      if (!req.user || !req.user.claims || !req.user.claims.sub) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Ideas routes
  app.get('/api/ideas', async (req: any, res) => {
    try {
      const filters = ideaFiltersSchema.parse(req.query);
      const userId = req.user?.claims?.sub; // Get userId if authenticated
      const result = await storage.getIdeas(filters, userId);
      res.json(result);
    } catch (error: any) {
      console.error("Error fetching ideas:", error);
      console.error("Error stack:", error?.stack);
      console.error("Error details:", JSON.stringify(error, null, 2));
      console.error("Request query:", req.query);
      res.status(500).json({ 
        message: "Failed to fetch ideas",
        error: error?.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      });
    }
  });

  app.get('/api/ideas/featured', async (req, res) => {
    try {
      const date = req.query.date as string | undefined;
      const idea = await storage.getFeaturedIdea(date);
      if (!idea) {
        return res.status(404).json({ message: "No featured idea found" });
      }
      res.json(idea);
    } catch (error: any) {
      console.error("Error fetching featured idea:", error);
      console.error("Error stack:", error?.stack);
      console.error("Error details:", JSON.stringify(error, null, 2));
      res.status(500).json({ 
        message: "Failed to fetch featured idea",
        error: error?.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      });
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
  
  // For You personalized recommendations endpoint
  app.get('/api/ideas/for-you', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const result = await storage.getForYouIdeas(userId, limit, offset);
      res.json(result);
    } catch (error) {
      console.error("Error fetching For You recommendations:", error);
      res.status(500).json({ message: "Failed to fetch personalized recommendations" });
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

  // Claim idea routes
  app.post('/api/ideas/:id/claim', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const result = await storage.claimIdea(id, userId);
      res.json(result);
    } catch (error: any) {
      console.error("Error claiming idea:", error);
      if (error.message === 'Idea is already claimed') {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to claim idea" });
    }
  });

  app.delete('/api/ideas/:id/claim', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      await storage.unclaimIdea(id, userId);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error unclaiming idea:", error);
      if (error.message === 'You have not claimed this idea') {
        return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to unclaim idea" });
    }
  });

  app.get('/api/ideas/:id/claim', async (req: any, res) => {
    try {
      const { id } = req.params;
      const claimStatus = await storage.getClaimStatus(id);
      res.json(claimStatus);
    } catch (error) {
      console.error("Error fetching claim status:", error);
      res.status(500).json({ message: "Failed to fetch claim status" });
    }
  });

  app.put('/api/ideas/:id/claim/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { progress, notes, milestones } = req.body;
      
      if (progress !== undefined && (progress < 0 || progress > 100)) {
        return res.status(400).json({ message: "Progress must be between 0 and 100" });
      }
      
      const result = await storage.updateClaimProgress(id, userId, { progress, notes, milestones });
      res.json(result);
    } catch (error: any) {
      console.error("Error updating claim progress:", error);
      if (error.message === 'You have not claimed this idea') {
        return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to update claim progress" });
    }
  });

  // Get user's claimed ideas
  app.get('/api/user/claimed-ideas', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const claims = await storage.getUserClaimedIdeas(userId);
      res.json(claims);
    } catch (error) {
      console.error("Error fetching user claimed ideas:", error);
      res.status(500).json({ message: "Failed to fetch claimed ideas" });
    }
  });

  // Get user-created ideas
  app.get('/api/user/created-ideas', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Query ideas directly where createdBy matches userId
      const userIdeas = await db
        .select({
          id: ideas.id,
          title: ideas.title,
          slug: ideas.slug,
          description: ideas.description,
          imageUrl: ideas.imageUrl,
          createdAt: ideas.createdAt,
          sourceData: ideas.sourceData, // Include sourceData to filter by researchType
        })
        .from(ideas)
        .where(eq(ideas.createdBy, userId))
        .orderBy(desc(ideas.createdAt));
      
      res.json(userIdeas);
    } catch (error) {
      console.error("Error fetching user created ideas:", error);
      res.status(500).json({ message: "Failed to fetch created ideas" });
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

  // Helper function to generate TXT report
  function generateTxtReport(idea: any): string {
    const sections: string[] = [];
    
    // Title and Overview
    sections.push('='.repeat(80));
    sections.push(`${idea.title}`);
    sections.push('='.repeat(80));
    sections.push('');
    
    if (idea.subtitle) {
      sections.push(idea.subtitle);
      sections.push('');
    }
    
    // Basic Info
    sections.push('--- OVERVIEW ---');
    sections.push(`Market: ${idea.market}`);
    sections.push(`Type: ${idea.type}`);
    if (idea.targetAudience) {
      sections.push(`Target Audience: ${idea.targetAudience}`);
    }
    sections.push('');
    
    // Description
    sections.push('--- DESCRIPTION ---');
    sections.push(idea.description);
    sections.push('');
    
    // Key Metrics
    sections.push('--- KEY METRICS ---');
    if (idea.opportunityScore) {
      sections.push(`• Opportunity Score: ${idea.opportunityScore}/10`);
    }
    if (idea.problemScore) {
      sections.push(`• Problem Score: ${idea.problemScore}/10`);
    }
    if (idea.executionDifficulty) {
      sections.push(`• Execution Difficulty: ${idea.executionDifficulty}/10`);
    }
    if (idea.marketSize) {
      sections.push(`• Market Size: ${idea.marketSize}`);
    }
    if (idea.timeToMarket) {
      sections.push(`• Time to Market: ${idea.timeToMarket}`);
    }
    if (idea.estimatedRevenue) {
      sections.push(`• Estimated Revenue: ${idea.estimatedRevenue}`);
    }
    sections.push('');
    
    // Community Stats
    sections.push('--- COMMUNITY ENGAGEMENT ---');
    sections.push(`• Views: ${idea.viewCount || 0}`);
    sections.push(`• Saves: ${idea.saveCount || 0}`);
    sections.push(`• Votes: ${idea.voteCount || 0}`);
    if (idea.averageRating) {
      sections.push(`• Average Rating: ${idea.averageRating}/5 (${idea.ratingCount} ratings)`);
    }
    sections.push('');
    
    // Signal Badges
    if (idea.signalBadges && idea.signalBadges.length > 0) {
      sections.push('--- SIGNALS & INDICATORS ---');
      idea.signalBadges.forEach((badge: string) => {
        sections.push(`• ${badge}`);
      });
      sections.push('');
    }
    
    // Tags
    if (idea.tags && idea.tags.length > 0) {
      sections.push('--- TAGS ---');
      sections.push(idea.tags.join(', '));
      sections.push('');
    }
    
    // Detailed Content
    if (idea.content) {
      sections.push('--- DETAILED ANALYSIS ---');
      sections.push(idea.content);
      sections.push('');
    }
    
    // Next Steps
    if (idea.keyPoints && idea.keyPoints.length > 0) {
      sections.push('--- KEY POINTS ---');
      idea.keyPoints.forEach((point: string) => {
        sections.push(`• ${point}`);
      });
      sections.push('');
    }
    
    if (idea.nextSteps && idea.nextSteps.length > 0) {
      sections.push('--- SUGGESTED NEXT STEPS ---');
      idea.nextSteps.forEach((step: string, index: number) => {
        sections.push(`${index + 1}. ${step}`);
      });
      sections.push('');
    }
    
    // Footer
    sections.push('='.repeat(80));
    sections.push(`Generated: ${new Date().toISOString()}`);
    sections.push(`Slug: ${idea.slug}`);
    sections.push('='.repeat(80));
    
    return sections.join('\n');
  }

  // Helper function to generate PDF report
  function generatePdfReport(idea: any): PDFDocument {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Title
    doc.fontSize(24).fillColor('#1a1a2e').font('Helvetica-Bold')
       .text(idea.title || 'Untitled Idea', { align: 'center' });
    doc.moveDown(0.5);
    
    if (idea.subtitle) {
      doc.fontSize(14).fillColor('#4a4a6a').font('Helvetica')
         .text(idea.subtitle, { align: 'center' });
    }
    doc.moveDown(1);
    
    // Horizontal line
    doc.strokeColor('#e0e0e0').lineWidth(1)
       .moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);
    
    // Scores section
    doc.fontSize(16).fillColor('#1a1a2e').font('Helvetica-Bold')
       .text('Opportunity Analysis');
    doc.moveDown(0.5);
    
    const scores = [
      { label: 'Opportunity Score', value: idea.opportunityScore, suffix: '/10' },
      { label: 'Problem Score', value: idea.problemScore, suffix: '/10' },
      { label: 'Feasibility Score', value: idea.feasibilityScore, suffix: '/10' },
      { label: 'Timing Score', value: idea.timingScore, suffix: '/10' },
      { label: 'Revenue Potential', value: idea.revenuePotential, suffix: '' },
    ];
    
    scores.forEach(score => {
      if (score.value !== null && score.value !== undefined) {
        doc.fontSize(11).fillColor('#4a4a6a').font('Helvetica')
           .text(`${score.label}: `, { continued: true })
           .font('Helvetica-Bold').fillColor('#2563eb')
           .text(`${score.value}${score.suffix}`);
      }
    });
    doc.moveDown(1);
    
    // Description
    if (idea.description) {
      doc.fontSize(16).fillColor('#1a1a2e').font('Helvetica-Bold')
         .text('Description');
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#4a4a6a').font('Helvetica')
         .text(idea.description, { align: 'justify' });
      doc.moveDown(1);
    }
    
    // Market Information
    doc.fontSize(16).fillColor('#1a1a2e').font('Helvetica-Bold')
       .text('Market Information');
    doc.moveDown(0.5);
    
    const marketInfo = [
      { label: 'Market Type', value: idea.market },
      { label: 'Type', value: idea.type },
      { label: 'Target Audience', value: idea.targetAudience },
      { label: 'Main Competitor', value: idea.mainCompetitor },
      { label: 'Keyword', value: idea.keyword },
    ];
    
    marketInfo.forEach(info => {
      if (info.value) {
        doc.fontSize(11).fillColor('#4a4a6a').font('Helvetica')
           .text(`${info.label}: `, { continued: true })
           .font('Helvetica-Bold')
           .text(info.value);
      }
    });
    doc.moveDown(1);
    
    // Why Now Analysis
    if (idea.whyNowAnalysis) {
      doc.addPage();
      doc.fontSize(16).fillColor('#1a1a2e').font('Helvetica-Bold')
         .text('Why Now Analysis');
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#4a4a6a').font('Helvetica')
         .text(idea.whyNowAnalysis, { align: 'justify' });
      doc.moveDown(1);
    }
    
    // Market Gap
    if (idea.marketGap) {
      doc.fontSize(16).fillColor('#1a1a2e').font('Helvetica-Bold')
         .text('Market Gap');
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#4a4a6a').font('Helvetica')
         .text(idea.marketGap, { align: 'justify' });
      doc.moveDown(1);
    }
    
    // Execution Plan
    if (idea.executionPlan) {
      doc.addPage();
      doc.fontSize(16).fillColor('#1a1a2e').font('Helvetica-Bold')
         .text('Execution Plan');
      doc.moveDown(0.5);
      doc.fontSize(11).fillColor('#4a4a6a').font('Helvetica')
         .text(idea.executionPlan, { align: 'justify' });
      doc.moveDown(1);
    }
    
    // Signal Badges
    if (idea.signalBadges && idea.signalBadges.length > 0) {
      doc.fontSize(16).fillColor('#1a1a2e').font('Helvetica-Bold')
         .text('Signals & Indicators');
      doc.moveDown(0.5);
      idea.signalBadges.forEach((badge: string) => {
        doc.fontSize(11).fillColor('#059669').font('Helvetica')
           .text(`✓ ${badge}`);
      });
      doc.moveDown(1);
    }
    
    // Community Stats
    doc.fontSize(16).fillColor('#1a1a2e').font('Helvetica-Bold')
       .text('Community Engagement');
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor('#4a4a6a').font('Helvetica')
       .text(`Views: ${idea.viewCount || 0}  |  Saves: ${idea.saveCount || 0}  |  Votes: ${idea.voteCount || 0}`);
    
    if (idea.averageRating) {
      doc.text(`Average Rating: ${idea.averageRating}/5 (${idea.ratingCount} ratings)`);
    }
    doc.moveDown(1);
    
    // Footer
    doc.fontSize(9).fillColor('#9ca3af').font('Helvetica')
       .text(`Generated: ${new Date().toISOString()}`, 50, doc.page.height - 50)
       .text(`Slug: ${idea.slug}`, 50, doc.page.height - 40);
    
    return doc;
  }

  // Generate markdown report for export
  function generateMarkdownReport(idea: any): string {
    const sections: string[] = [];
    
    sections.push(`# ${idea.title}`);
    sections.push('');
    if (idea.subtitle) {
      sections.push(`*${idea.subtitle}*`);
      sections.push('');
    }
    
    sections.push('## Overview');
    sections.push(`- **Market:** ${idea.market}`);
    sections.push(`- **Type:** ${idea.type}`);
    if (idea.targetAudience) sections.push(`- **Target Audience:** ${idea.targetAudience}`);
    sections.push('');
    
    sections.push('## Description');
    sections.push(idea.description);
    sections.push('');
    
    sections.push('## Key Metrics');
    sections.push(`| Metric | Score |`);
    sections.push(`|--------|-------|`);
    if (idea.opportunityScore) sections.push(`| Opportunity | ${idea.opportunityScore}/10 |`);
    if (idea.problemScore) sections.push(`| Problem Severity | ${idea.problemScore}/10 |`);
    if (idea.feasibilityScore) sections.push(`| Feasibility | ${idea.feasibilityScore}/10 |`);
    if (idea.timingScore) sections.push(`| Timing | ${idea.timingScore}/10 |`);
    if (idea.executionScore) sections.push(`| Execution | ${idea.executionScore}/10 |`);
    if (idea.gtmScore) sections.push(`| Go-to-Market | ${idea.gtmScore}/10 |`);
    sections.push('');
    
    if (idea.whyNowAnalysis) {
      sections.push('## Why Now');
      sections.push(idea.whyNowAnalysis);
      sections.push('');
    }
    
    if (idea.proofSignals) {
      sections.push('## Proof & Signals');
      sections.push(idea.proofSignals);
      sections.push('');
    }
    
    if (idea.marketGap) {
      sections.push('## Market Gap');
      sections.push(idea.marketGap);
      sections.push('');
    }
    
    if (idea.executionPlan) {
      sections.push('## Execution Plan');
      sections.push(idea.executionPlan);
      sections.push('');
    }
    
    if (idea.content) {
      sections.push('## Full Analysis');
      sections.push(idea.content);
      sections.push('');
    }
    
    sections.push('---');
    sections.push(`*Exported from Idea Browser on ${new Date().toLocaleDateString()}*`);
    
    return sections.join('\n');
  }

  // Export idea data
  app.get('/api/ideas/:id/export', async (req, res) => {
    try {
      const { id } = req.params;
      const { format = 'json' } = req.query;
      const idea = await storage.getIdeaById(id);
      
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      // Validate format parameter
      if (!['json', 'txt', 'pdf', 'markdown', 'md'].includes(format as string)) {
        return res.status(400).json({ message: "Invalid format. Supported formats: json, txt, pdf, markdown" });
      }

      if (format === 'json') {
        // Return idea as downloadable JSON
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${idea.slug}.json"`);
        res.json(idea);
      } else if (format === 'txt') {
        // Generate human-readable TXT report
        const txtContent = generateTxtReport(idea);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${idea.slug}.txt"`);
        res.send(txtContent);
      } else if (format === 'pdf') {
        // Generate PDF report
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${idea.slug}.pdf"`);
        
        const doc = generatePdfReport(idea);
        doc.pipe(res);
        doc.end();
      } else if (format === 'markdown' || format === 'md') {
        // Generate Markdown report
        const mdContent = generateMarkdownReport(idea);
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${idea.slug}.md"`);
        res.send(mdContent);
      }
    } catch (error) {
      console.error("Error exporting idea:", error);
      res.status(500).json({ message: "Failed to export idea" });
    }
  });

  // Export to Notion
  app.post('/api/ideas/:id/export/notion', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { notionToken, parentPageId } = req.body;
      
      if (!notionToken) {
        return res.status(400).json({ message: "Notion integration token is required" });
      }
      
      const idea = await storage.getIdeaById(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
      
      // Create Notion page
      const notionResponse = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${notionToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28'
        },
        body: JSON.stringify({
          parent: parentPageId ? { page_id: parentPageId } : { type: 'workspace', workspace: true },
          properties: {
            title: {
              title: [{ text: { content: idea.title } }]
            }
          },
          children: [
            {
              object: 'block',
              type: 'heading_2',
              heading_2: { rich_text: [{ text: { content: 'Overview' } }] }
            },
            {
              object: 'block',
              type: 'paragraph',
              paragraph: { rich_text: [{ text: { content: idea.description } }] }
            },
            {
              object: 'block',
              type: 'heading_2',
              heading_2: { rich_text: [{ text: { content: 'Key Metrics' } }] }
            },
            {
              object: 'block',
              type: 'bulleted_list_item',
              bulleted_list_item: { rich_text: [{ text: { content: `Opportunity Score: ${idea.opportunityScore}/10` } }] }
            },
            {
              object: 'block',
              type: 'bulleted_list_item',
              bulleted_list_item: { rich_text: [{ text: { content: `Market: ${idea.market}` } }] }
            },
            {
              object: 'block',
              type: 'bulleted_list_item',
              bulleted_list_item: { rich_text: [{ text: { content: `Type: ${idea.type}` } }] }
            },
            ...(idea.whyNowAnalysis ? [
              {
                object: 'block',
                type: 'heading_2',
                heading_2: { rich_text: [{ text: { content: 'Why Now' } }] }
              },
              {
                object: 'block',
                type: 'paragraph',
                paragraph: { rich_text: [{ text: { content: idea.whyNowAnalysis.slice(0, 2000) } }] }
              }
            ] : []),
            ...(idea.executionPlan ? [
              {
                object: 'block',
                type: 'heading_2',
                heading_2: { rich_text: [{ text: { content: 'Execution Plan' } }] }
              },
              {
                object: 'block',
                type: 'paragraph',
                paragraph: { rich_text: [{ text: { content: idea.executionPlan.slice(0, 2000) } }] }
              }
            ] : [])
          ]
        })
      });
      
      if (!notionResponse.ok) {
        const error = await notionResponse.json();
        console.error("Notion API error:", error);
        return res.status(400).json({ message: "Failed to create Notion page. Check your token and permissions." });
      }
      
      const notionPage = await notionResponse.json();
      
      // Log export
      await storage.logExport(userId, id, 'notion', notionPage.url);
      
      res.json({ 
        success: true, 
        url: notionPage.url,
        pageId: notionPage.id 
      });
    } catch (error) {
      console.error("Error exporting to Notion:", error);
      res.status(500).json({ message: "Failed to export to Notion" });
    }
  });

  // Export to Google Docs (generates a link to create doc with content)
  app.post('/api/ideas/:id/export/google-docs', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      const idea = await storage.getIdeaById(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
      
      // Generate markdown content for Google Docs
      const mdContent = generateMarkdownReport(idea);
      
      // Create a Google Docs URL with pre-filled content (using Google's URL scheme)
      // This opens Google Docs with the title pre-filled
      const encodedTitle = encodeURIComponent(idea.title);
      const googleDocsUrl = `https://docs.google.com/document/create?title=${encodedTitle}`;
      
      // Log export
      await storage.logExport(userId, id, 'google_docs');
      
      res.json({ 
        success: true, 
        url: googleDocsUrl,
        content: mdContent, // Include content to copy
        message: "Click the link to create a new Google Doc, then paste the content"
      });
    } catch (error) {
      console.error("Error preparing Google Docs export:", error);
      res.status(500).json({ message: "Failed to prepare Google Docs export" });
    }
  });

  // Copy to clipboard formatted content
  app.get('/api/ideas/:id/export/clipboard', async (req, res) => {
    try {
      const { id } = req.params;
      const { format = 'markdown' } = req.query;
      
      const idea = await storage.getIdeaById(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
      
      let content: string;
      if (format === 'markdown' || format === 'md') {
        content = generateMarkdownReport(idea);
      } else {
        content = generateTxtReport(idea);
      }
      
      res.json({ content });
    } catch (error) {
      console.error("Error generating clipboard content:", error);
      res.status(500).json({ message: "Failed to generate content" });
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

  // User idea interactions routes
  app.post('/api/ideas/:id/interaction', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['interested', 'not_interested', 'building', 'saved'].includes(status)) {
        return res.status(400).json({ message: "Invalid interaction status" });
      }
      
      await storage.setIdeaInteraction(userId, id, status);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting idea interaction:", error);
      res.status(500).json({ message: "Failed to set idea interaction" });
    }
  });

  app.delete('/api/ideas/:id/interaction', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['interested', 'not_interested', 'building', 'saved'].includes(status)) {
        return res.status(400).json({ message: "Invalid interaction status" });
      }
      
      await storage.removeIdeaInteraction(userId, id, status);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing idea interaction:", error);
      res.status(500).json({ message: "Failed to remove idea interaction" });
    }
  });

  app.get('/api/ideas/:id/interaction', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const status = await storage.getUserIdeaInteraction(userId, id);
      res.json({ status });
    } catch (error) {
      console.error("Error fetching user interaction:", error);
      res.status(500).json({ message: "Failed to fetch user interaction" });
    }
  });

  app.get('/api/users/ideas/:status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status } = req.params;
      
      if (!['interested', 'not_interested', 'building', 'saved'].includes(status)) {
        return res.status(400).json({ message: "Invalid interaction status" });
      }
      
      const ideas = await storage.getIdeasByInteraction(userId, status);
      res.json(ideas);
    } catch (error) {
      console.error("Error fetching ideas by interaction:", error);
      res.status(500).json({ message: "Failed to fetch ideas by interaction" });
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

  // Generate Opportunity Analysis endpoint
  app.post('/api/ideas/:id/generate-opportunity-analysis', async (req, res) => {
    return res.status(501).json({ 
      message: "Opportunity Analysis feature is not yet implemented",
      success: false
    });
  });

  // Batch generate Opportunity Analysis for all existing ideas
  app.post('/api/admin/generate-all-opportunity-analyses', async (req, res) => {
    try {
      const { batchSize = 5 } = req.body; // Process in small batches
      
      return res.status(501).json({ 
        message: "Opportunity Analysis feature is not yet implemented",
          processed: 0,
        results: []
      });
    } catch (error: any) {
      console.error('[Batch Generate] Error:', error);
      res.status(500).json({ 
        message: "Failed to batch generate analyses",
        error: error.message 
      });
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
      
      // Validate required fields
      if (!ideaData.title || !ideaData.description) {
        return res.status(400).json({ 
          message: "Missing required fields: title and description are required" 
        });
      }
      
      // Use description as content fallback if content is missing
      if (!ideaData.content) {
        ideaData.content = ideaData.description;
      }
      
      // Generate slug from title
      const slug = ideaData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      // Ensure signalBadges is an array (schema expects array)
      const signalBadges = Array.isArray(ideaData.signalBadges) 
        ? ideaData.signalBadges 
        : (ideaData.signalBadges ? [ideaData.signalBadges] : []);
      
      // Manual entry ALWAYS calls AI enrichment to generate comprehensive analysis
      // This ensures all manually created ideas have the same level of detail as imported/generated ideas
      let enrichedData: any = {};
      
      try {
        console.log(`[Idea Creation] ⚡ ALWAYS enriching manual entry with comprehensive AI analysis: ${ideaData.title}`);
        console.log(`[Idea Creation] Input data:`, {
          title: ideaData.title,
          description: ideaData.description?.substring(0, 100),
          content: ideaData.content?.substring(0, 100),
          type: ideaData.type,
          market: ideaData.market,
          targetAudience: ideaData.targetAudience,
          keyword: ideaData.keyword,
        });
        
        enrichedData = await aiService.enrichIdeaWithComprehensiveAnalysis({
          title: ideaData.title,
          description: ideaData.description,
          content: ideaData.content,
          type: ideaData.type,
          market: ideaData.market,
          targetAudience: ideaData.targetAudience,
          keyword: ideaData.keyword,
        });
        
        // Validate that enrichment returned comprehensive data
        const hasComprehensiveData = enrichedData.offerTiers && 
                                     enrichedData.whyNowAnalysis && 
                                     enrichedData.proofSignals &&
                                     enrichedData.marketGap &&
                                     enrichedData.executionPlan &&
                                     enrichedData.frameworkData &&
                                     enrichedData.keywordData &&
                                     enrichedData.communitySignals;
        
        if (!hasComprehensiveData) {
          console.error(`[Idea Creation] ⚠️ Enrichment returned incomplete data. Fields present:`, {
            offerTiers: !!enrichedData.offerTiers,
            whyNowAnalysis: !!enrichedData.whyNowAnalysis,
            proofSignals: !!enrichedData.proofSignals,
            marketGap: !!enrichedData.marketGap,
            executionPlan: !!enrichedData.executionPlan,
            frameworkData: !!enrichedData.frameworkData,
            keywordData: !!enrichedData.keywordData,
            communitySignals: !!enrichedData.communitySignals,
          });
          console.error(`[Idea Creation] ⚠️ Enrichment data keys:`, Object.keys(enrichedData));
          // Enrichment function should return comprehensive defaults, but log warning
        }
        
        console.log(`[Idea Creation] ✅ AI enrichment completed for: ${ideaData.title}`);
        console.log(`[Idea Creation] Enriched fields count:`, Object.keys(enrichedData).length);
        console.log(`[Idea Creation] Key enriched fields:`, {
          hasOfferTiers: !!enrichedData.offerTiers,
          hasWhyNowAnalysis: !!enrichedData.whyNowAnalysis,
          hasProofSignals: !!enrichedData.proofSignals,
          hasMarketGap: !!enrichedData.marketGap,
          hasExecutionPlan: !!enrichedData.executionPlan,
          hasFrameworkData: !!enrichedData.frameworkData,
          hasKeywordData: !!enrichedData.keywordData,
          hasCommunitySignals: !!enrichedData.communitySignals,
        });
      } catch (enrichError) {
        console.error(`[Idea Creation] ❌ AI enrichment failed:`, enrichError);
        console.error(`[Idea Creation] Error details:`, {
          message: enrichError instanceof Error ? enrichError.message : String(enrichError),
          stack: enrichError instanceof Error ? enrichError.stack : undefined,
        });
        logErrorToFile(enrichError, 'Idea Enrichment');
        // Enrichment function should return comprehensive defaults on error
        // But if it throws, enrichedData will remain {} - ensure we have defaults
        if (!enrichedData || Object.keys(enrichedData).length === 0) {
          console.error(`[Idea Creation] ⚠️ enrichedData is empty after error, using fallback defaults`);
          enrichedData = {
            opportunityScore: 7,
            problemScore: 7,
            feasibilityScore: 6,
            timingScore: 7,
            executionScore: 6,
            gtmScore: 7,
            opportunityLabel: "Good Opportunity",
            problemLabel: "Clear Problem",
            feasibilityLabel: "Moderate Complexity",
            timingLabel: "Good Timing",
            revenuePotential: "Analysis pending - AI enrichment failed",
            revenuePotentialNum: 1000000,
            executionDifficulty: "Medium",
            gtmStrength: "Analysis pending",
            offerTiers: {
              leadMagnet: { name: "Free Resource", description: "Value-add resource", price: "$0" },
              frontend: { name: "Entry Product", description: "Low-ticket entry", price: "$47" },
              core: { name: "Core Product", description: "Main value", price: "$497" },
              backend: { name: "Premium Service", description: "High-ticket", price: "$2997" },
              continuity: { name: "Subscription", description: "Recurring revenue", price: "$97/mo" }
            },
            whyNowAnalysis: "Analysis pending - AI enrichment failed. Please retry.",
            proofSignals: "Analysis pending - AI enrichment failed. Please retry.",
            marketGap: "Analysis pending - AI enrichment failed. Please retry.",
            executionPlan: "Analysis pending - AI enrichment failed. Please retry.",
            frameworkData: {
              valueEquation: { dreamOutcome: "Pending", perceivedLikelihood: "Pending", timeDelay: "Pending", effortSacrifice: "Pending" },
              marketMatrix: { marketSize: "Pending", painLevel: "Pending", targetingEase: "Pending", purchasingPower: "Pending" },
              acpFramework: { avatar: "Pending", catalyst: "Pending", promise: "Pending" }
            },
            keywordData: { fastestGrowing: [], highestVolume: [], mostRelevant: [] },
            communitySignals: {
              reddit: { subreddits: 0, members: "0", score: 0, details: "Pending" },
              facebook: { groups: 0, members: "0", score: 0, details: "Pending" },
              youtube: { channels: 0, members: "0", score: 0, details: "Pending" },
              other: { segments: 0, priorities: 0, score: 0, details: "Pending" }
            },
            signalBadges: []
          };
        }
      }

      // Merge AI-enriched data with user-provided data
      // User-provided data takes precedence for basic fields, but enriched data fills in missing comprehensive fields
      // For comprehensive fields, only use user data if it's meaningful (not empty/placeholder)
      const mergedIdea = {
        // Start with enriched data (comprehensive analysis)
        ...enrichedData,
        // Basic user-provided fields (always use user data for these)
        title: ideaData.title,
        subtitle: ideaData.subtitle,
        description: ideaData.description,
        content: ideaData.content,
        type: ideaData.type,
        market: ideaData.market,
        targetAudience: ideaData.targetAudience,
        imageUrl: ideaData.imageUrl,
        // Ensure required fields
        slug,
        createdBy: userId,
        // Scores: use user-provided if available and valid, otherwise use enriched, otherwise defaults
        opportunityScore: (ideaData.opportunityScore && ideaData.opportunityScore > 0) ? ideaData.opportunityScore : (enrichedData.opportunityScore ?? 7),
        opportunityLabel: ideaData.opportunityLabel || enrichedData.opportunityLabel || "Good",
        problemScore: (ideaData.problemScore && ideaData.problemScore > 0) ? ideaData.problemScore : (enrichedData.problemScore ?? 7),
        problemLabel: ideaData.problemLabel || enrichedData.problemLabel || "Good",
        feasibilityScore: (ideaData.feasibilityScore && ideaData.feasibilityScore > 0) ? ideaData.feasibilityScore : (enrichedData.feasibilityScore ?? 7),
        feasibilityLabel: ideaData.feasibilityLabel || enrichedData.feasibilityLabel || "Good",
        timingScore: (ideaData.timingScore && ideaData.timingScore > 0) ? ideaData.timingScore : (enrichedData.timingScore ?? 7),
        timingLabel: ideaData.timingLabel || enrichedData.timingLabel || "Good",
        executionScore: (ideaData.executionScore && ideaData.executionScore > 0) ? ideaData.executionScore : (enrichedData.executionScore ?? 7),
        gtmScore: (ideaData.gtmScore && ideaData.gtmScore > 0) ? ideaData.gtmScore : (enrichedData.gtmScore ?? 7),
        // Business metrics: use user data if meaningful, otherwise enriched
        revenuePotential: (ideaData.revenuePotential && ideaData.revenuePotential !== "TBD" && ideaData.revenuePotential.trim().length > 0) 
          ? ideaData.revenuePotential 
          : (enrichedData.revenuePotential || "TBD"),
        revenuePotentialNum: ideaData.revenuePotentialNum || enrichedData.revenuePotentialNum || 1000000,
        executionDifficulty: (ideaData.executionDifficulty && ideaData.executionDifficulty !== "Medium" && ideaData.executionDifficulty.trim().length > 0)
          ? ideaData.executionDifficulty
          : (enrichedData.executionDifficulty || "Medium"),
        gtmStrength: (ideaData.gtmStrength && ideaData.gtmStrength !== "TBD" && ideaData.gtmStrength.trim().length > 0)
          ? ideaData.gtmStrength
          : (enrichedData.gtmStrength || "TBD"),
        mainCompetitor: ideaData.mainCompetitor || enrichedData.mainCompetitor,
        keyword: ideaData.keyword || enrichedData.keyword,
        keywordVolume: ideaData.keywordVolume || enrichedData.keywordVolume,
        keywordGrowth: ideaData.keywordGrowth || enrichedData.keywordGrowth,
        // Comprehensive analysis sections: use enriched data (manual entry always enriches)
        // User-provided values only used if they're meaningful (not empty/placeholder)
        offerTiers: (ideaData.offerTiers && typeof ideaData.offerTiers === 'object' && Object.keys(ideaData.offerTiers).length > 0) 
          ? ideaData.offerTiers 
          : enrichedData.offerTiers,
        whyNowAnalysis: (ideaData.whyNowAnalysis && typeof ideaData.whyNowAnalysis === 'string' && ideaData.whyNowAnalysis.trim().length > 50) 
          ? ideaData.whyNowAnalysis 
          : enrichedData.whyNowAnalysis,
        proofSignals: (ideaData.proofSignals && typeof ideaData.proofSignals === 'string' && ideaData.proofSignals.trim().length > 50) 
          ? ideaData.proofSignals 
          : enrichedData.proofSignals,
        marketGap: (ideaData.marketGap && typeof ideaData.marketGap === 'string' && ideaData.marketGap.trim().length > 50) 
          ? ideaData.marketGap 
          : enrichedData.marketGap,
        executionPlan: (ideaData.executionPlan && typeof ideaData.executionPlan === 'string' && ideaData.executionPlan.trim().length > 50) 
          ? ideaData.executionPlan 
          : enrichedData.executionPlan,
        frameworkData: (ideaData.frameworkData && typeof ideaData.frameworkData === 'object' && Object.keys(ideaData.frameworkData).length > 0) 
          ? ideaData.frameworkData 
          : enrichedData.frameworkData,
        trendAnalysis: (ideaData.trendAnalysis && typeof ideaData.trendAnalysis === 'string' && ideaData.trendAnalysis.trim().length > 50) 
          ? ideaData.trendAnalysis 
          : enrichedData.trendAnalysis,
        keywordData: (ideaData.keywordData && typeof ideaData.keywordData === 'object' && Object.keys(ideaData.keywordData).length > 0) 
          ? ideaData.keywordData 
          : enrichedData.keywordData,
        communitySignals: (ideaData.communitySignals && typeof ideaData.communitySignals === 'object' && Object.keys(ideaData.communitySignals).length > 0) 
          ? ideaData.communitySignals 
          : enrichedData.communitySignals,
        builderPrompts: (ideaData.builderPrompts && typeof ideaData.builderPrompts === 'object' && Object.keys(ideaData.builderPrompts).length > 0)
          ? ideaData.builderPrompts
          : enrichedData.builderPrompts,
        // Other fields
        isPublished: ideaData.isPublished !== undefined ? ideaData.isPublished : true,
        signalBadges: signalBadges.length > 0 ? signalBadges : (enrichedData.signalBadges || []),
      };

      const createdIdea = await storage.createIdea(mergedIdea);
      
      // Return the created idea immediately
        res.json(createdIdea);
    } catch (error: any) {
      console.error("Error creating idea:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        code: error.code,
        detail: error.detail,
        constraint: error.constraint,
        column: error.column,
      });
      console.error("Request body keys:", Object.keys(req.body));
      console.error("Title:", req.body.title);
      console.error("Description length:", req.body.description?.length);
      console.error("Content length:", req.body.content?.length);
      res.status(500).json({ 
        message: "Failed to create idea",
        error: error.message || "Unknown error",
        ...(process.env.NODE_ENV === 'development' && {
          details: error.detail,
          constraint: error.constraint,
        })
      });
    }
  });

  // Update idea endpoint
  app.put('/api/ideas/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const updateData = req.body;
      
      // Verify user owns the idea or is admin
      const idea = await storage.getIdeaById(id);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }
      
      if (idea.createdBy !== userId) {
        return res.status(403).json({ message: "You can only update your own ideas" });
      }
      
      const updatedIdea = await storage.updateIdea(id, updateData);
      res.json(updatedIdea);
    } catch (error) {
      console.error("Error updating idea:", error);
      res.status(500).json({ message: "Failed to update idea" });
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
      
      console.log(`[AI Generate] ===== REQUEST RECEIVED =====`);
      console.log(`[AI Generate] User ID: ${userId}`);
      console.log(`[AI Generate] Request body:`, JSON.stringify(req.body, null, 2));
      
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
      
      // Normalize empty strings to undefined so defaults are used
      // Empty strings are truthy, so defaults don't apply - we need undefined
      const normalizedParams: IdeaGenerationParams = {
        industry: params.industry?.trim() || undefined,
        type: params.type?.trim() || undefined,
        market: params.market?.trim() || undefined,
        targetAudience: params.targetAudience?.trim() || undefined,
        problemArea: params.problemArea?.trim() || undefined,
        constraints: params.constraints?.trim() || undefined,
      };
      
      console.log(`[AI Generate] Original params:`, params);
      console.log(`[AI Generate] Normalized params:`, normalizedParams);
      
      // Generate idea using AI service
      const generatedIdea = await aiService.generateIdea(normalizedParams);
      
      // Enrich with comprehensive analysis to ensure accurate metrics, scores, and community signals
      // Use same pattern as manual entry: always enrich, with fallback defaults on error
      // Use stronger model (Opus) for AI generation enrichment to get more detail
      let enrichedData: any = {};
      
      try {
        console.log(`[AI Generate] ⚡ Enriching generated idea with comprehensive AI analysis: ${generatedIdea.title}`);
        console.log(`[AI Generate] Input data:`, {
          title: generatedIdea.title,
          description: generatedIdea.description?.substring(0, 100),
          content: generatedIdea.content?.substring(0, 100),
          type: generatedIdea.type,
          market: generatedIdea.market,
          targetAudience: generatedIdea.targetAudience,
          keyword: generatedIdea.keyword,
        });
        
        // Use stronger model (Opus) for AI generation enrichment to get more detail
        enrichedData = await aiService.enrichIdeaWithComprehensiveAnalysis({
          title: generatedIdea.title,
          description: generatedIdea.description,
          content: generatedIdea.content,
          type: generatedIdea.type,
          market: generatedIdea.market,
          targetAudience: generatedIdea.targetAudience,
          keyword: generatedIdea.keyword,
        }, 'claude-opus-4-5-20251101'); // Use Opus for more detail in AI generation
        
        // Validate that enrichment returned comprehensive data
        const hasComprehensiveData = enrichedData.offerTiers && 
                                     enrichedData.whyNowAnalysis && 
                                     enrichedData.proofSignals &&
                                     enrichedData.marketGap &&
                                     enrichedData.executionPlan &&
                                     enrichedData.frameworkData &&
                                     enrichedData.keywordData &&
                                     enrichedData.communitySignals;
        
        if (!hasComprehensiveData) {
          console.error(`[AI Generate] ⚠️ Enrichment returned incomplete data. Fields present:`, {
            offerTiers: !!enrichedData.offerTiers,
            whyNowAnalysis: !!enrichedData.whyNowAnalysis,
            proofSignals: !!enrichedData.proofSignals,
            marketGap: !!enrichedData.marketGap,
            executionPlan: !!enrichedData.executionPlan,
            frameworkData: !!enrichedData.frameworkData,
            keywordData: !!enrichedData.keywordData,
            communitySignals: !!enrichedData.communitySignals,
          });
          console.error(`[AI Generate] ⚠️ Enrichment data keys:`, Object.keys(enrichedData));
        }
        
        console.log(`[AI Generate] ✅ AI enrichment completed for: ${generatedIdea.title}`);
        console.log(`[AI Generate] Enriched fields count:`, Object.keys(enrichedData).length);
        console.log(`[AI Generate] Key enriched fields:`, {
          hasOfferTiers: !!enrichedData.offerTiers,
          hasWhyNowAnalysis: !!enrichedData.whyNowAnalysis,
          hasProofSignals: !!enrichedData.proofSignals,
          hasMarketGap: !!enrichedData.marketGap,
          hasExecutionPlan: !!enrichedData.executionPlan,
          hasFrameworkData: !!enrichedData.frameworkData,
          hasKeywordData: !!enrichedData.keywordData,
          hasCommunitySignals: !!enrichedData.communitySignals,
        });
      } catch (enrichError) {
        console.error(`[AI Generate] ❌ AI enrichment failed:`, enrichError);
        console.error(`[AI Generate] Error details:`, {
          message: enrichError instanceof Error ? enrichError.message : String(enrichError),
          stack: enrichError instanceof Error ? enrichError.stack : undefined,
        });
        logErrorToFile(enrichError, 'AI Generate Enrichment');
        // Use same fallback defaults as manual entry
        if (!enrichedData || Object.keys(enrichedData).length === 0) {
          console.error(`[AI Generate] ⚠️ enrichedData is empty after error, using fallback defaults`);
          enrichedData = {
            opportunityScore: 7,
            problemScore: 7,
            feasibilityScore: 6,
            timingScore: 7,
            executionScore: 6,
            gtmScore: 7,
            opportunityLabel: "Good Opportunity",
            problemLabel: "Clear Problem",
            feasibilityLabel: "Moderate Complexity",
            timingLabel: "Good Timing",
            revenuePotential: "Analysis pending - AI enrichment failed",
            revenuePotentialNum: 1000000,
            executionDifficulty: "Medium",
            gtmStrength: "Analysis pending",
            offerTiers: {
              leadMagnet: { name: "Free Resource", description: "Value-add resource", price: "$0" },
              frontend: { name: "Entry Product", description: "Low-ticket entry", price: "$47" },
              core: { name: "Core Product", description: "Main value", price: "$497" },
              backend: { name: "Premium Service", description: "High-ticket", price: "$2997" },
              continuity: { name: "Subscription", description: "Recurring revenue", price: "$97/mo" }
            },
            whyNowAnalysis: "Analysis pending - AI enrichment failed. Please retry.",
            proofSignals: "Analysis pending - AI enrichment failed. Please retry.",
            marketGap: "Analysis pending - AI enrichment failed. Please retry.",
            executionPlan: "Analysis pending - AI enrichment failed. Please retry.",
            frameworkData: {
              valueEquation: { dreamOutcome: "Pending", perceivedLikelihood: "Pending", timeDelay: "Pending", effortSacrifice: "Pending" },
              marketMatrix: { marketSize: "Pending", painLevel: "Pending", targetingEase: "Pending", purchasingPower: "Pending" },
              acpFramework: { avatar: "Pending", catalyst: "Pending", promise: "Pending" }
            },
            keywordData: { fastestGrowing: [], highestVolume: [], mostRelevant: [] },
            communitySignals: {
              reddit: { subreddits: 0, members: "0", score: 0, details: "Pending" },
              facebook: { groups: 0, members: "0", score: 0, details: "Pending" },
              youtube: { channels: 0, members: "0", score: 0, details: "Pending" },
              other: { segments: 0, priorities: 0, score: 0, details: "Pending" }
            },
            signalBadges: []
          };
        }
      }
      
      // Merge: enriched data provides comprehensive fields, generated idea provides basic fields
      // Same merge logic as manual entry
      const finalIdea = {
        ...enrichedData, // Start with enriched comprehensive data
        ...generatedIdea, // Override with generated basic fields (title, description, etc.)
        // Use enriched data for comprehensive fields unless generated has meaningful data
        offerTiers: generatedIdea.offerTiers || enrichedData.offerTiers,
        whyNowAnalysis: generatedIdea.whyNowAnalysis || enrichedData.whyNowAnalysis,
        proofSignals: generatedIdea.proofSignals || enrichedData.proofSignals,
        marketGap: generatedIdea.marketGap || enrichedData.marketGap,
        executionPlan: generatedIdea.executionPlan || enrichedData.executionPlan,
        frameworkData: generatedIdea.frameworkData || enrichedData.frameworkData,
        keywordData: generatedIdea.keywordData || enrichedData.keywordData,
        communitySignals: generatedIdea.communitySignals || enrichedData.communitySignals,
        trendAnalysis: generatedIdea.trendAnalysis || enrichedData.trendAnalysis,
        signalBadges: generatedIdea.signalBadges || enrichedData.signalBadges,
        builderPrompts: generatedIdea.builderPrompts || enrichedData.builderPrompts,
      };
      
      // Validate that we have at least basic required fields
      if (!finalIdea.title || !finalIdea.description) {
        console.error(`[AI Generate] ❌ CRITICAL: Missing required fields in final idea`);
        console.error(`[AI Generate] Final idea keys:`, Object.keys(finalIdea));
        console.error(`[AI Generate] Title:`, finalIdea.title);
        console.error(`[AI Generate] Description:`, finalIdea.description);
        logErrorToFile(new Error('Missing required fields in final idea'), 'AI Generate Validation');
        return res.status(500).json({ 
          message: "Failed to generate idea - missing required fields",
          error: "Generated idea is incomplete"
        });
      }
      
      // Log warning if enrichment failed but we're still returning
      if (!enrichedData || Object.keys(enrichedData).length === 0 || 
          enrichedData.whyNowAnalysis?.includes('Analysis pending - AI enrichment failed')) {
        console.warn(`[AI Generate] ⚠️ WARNING: Returning idea with fallback defaults - enrichment failed`);
        console.warn(`[AI Generate] This means the idea will have incomplete comprehensive analysis`);
      }
      
      console.log(`[AI Generate] ✅ Successfully returning final idea: ${finalIdea.title}`);
      res.json(finalIdea);
    } catch (error) {
      logErrorToFile(error, 'AI Idea Generation Endpoint');
      console.error("Error generating AI idea:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        message: "Failed to generate idea",
        error: errorMessage
      });
    }
  });

  // Generate solution from HTML content
  app.post('/api/ai/generate-from-html', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const htmlSchema = z.object({
        htmlContent: z.string().min(1),
      });
      
      const { htmlContent } = htmlSchema.parse(req.body);
      
      // Generate idea from HTML using AI service
      const generatedIdea = await aiService.generateIdeaFromHTML(htmlContent);
      
      // Enrich with comprehensive analysis to ensure accurate metrics, scores, and community signals
      try {
        console.log(`[Generate from HTML] Enriching generated idea with comprehensive analysis: ${generatedIdea.title}`);
        const enrichedData = await aiService.enrichIdeaWithComprehensiveAnalysis({
          title: generatedIdea.title,
          description: generatedIdea.description,
          content: generatedIdea.content,
          type: generatedIdea.type,
          market: generatedIdea.market,
          targetAudience: generatedIdea.targetAudience,
          keyword: generatedIdea.keyword,
        });
        
        // Merge: generated idea takes precedence, enriched fills gaps
        const finalIdea = {
          ...enrichedData,
          ...generatedIdea, // Generated data overrides enriched defaults
          // Ensure comprehensive fields use enriched if missing from generated
          offerTiers: generatedIdea.offerTiers || enrichedData.offerTiers,
          whyNowAnalysis: generatedIdea.whyNowAnalysis || enrichedData.whyNowAnalysis,
          proofSignals: generatedIdea.proofSignals || enrichedData.proofSignals,
          marketGap: generatedIdea.marketGap || enrichedData.marketGap,
          executionPlan: generatedIdea.executionPlan || enrichedData.executionPlan,
          frameworkData: generatedIdea.frameworkData || enrichedData.frameworkData,
          keywordData: generatedIdea.keywordData || enrichedData.keywordData,
          communitySignals: generatedIdea.communitySignals || enrichedData.communitySignals,
          trendAnalysis: generatedIdea.trendAnalysis || enrichedData.trendAnalysis,
          signalBadges: generatedIdea.signalBadges || enrichedData.signalBadges,
        };
        
        console.log(`[Generate from HTML] ✅ Comprehensive enrichment completed for: ${generatedIdea.title}`);
        res.json(finalIdea);
      } catch (enrichError) {
        console.error(`[Generate from HTML] Enrichment failed, returning generated idea without enrichment:`, enrichError);
        // Return generated idea even if enrichment fails
      res.json(generatedIdea);
      }
    } catch (error) {
      console.error("Error generating idea from HTML:", error);
      res.status(500).json({ 
        message: "Failed to generate idea from HTML",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Test route to verify routing works
  app.get('/api/documents/test', (req, res) => {
    console.log('[Document Test] Route hit!');
    res.json({ message: 'Document parse route is accessible', timestamp: new Date().toISOString() });
  });
  
  // Test POST route to verify POST requests work
  app.post('/api/documents/test', (req, res) => {
    console.log('[Document Test POST] Route hit!');
    console.log('[Document Test POST] Content-Type:', req.headers['content-type']);
    console.log('[Document Test POST] Body:', req.body);
    res.json({ message: 'Document parse POST route is accessible', timestamp: new Date().toISOString() });
  });

  // Parse document and extract text content
  // Note: Multer must come before isAuthenticated to parse multipart/form-data
  // Wrap entire route in error handler to ensure JSON responses
  app.post('/api/documents/parse', 
    // Step 0: Comprehensive logging and JSON response wrapper
    (req, res, next) => {
      console.log('[Document Parse] ===== ROUTE HIT =====');
      console.log('[Document Parse] Method:', req.method);
      console.log('[Document Parse] Path:', req.path);
      console.log('[Document Parse] Original URL:', req.originalUrl);
      console.log('[Document Parse] Content-Type:', req.headers['content-type']);
      console.log('[Document Parse] Content-Length:', req.headers['content-length']);
      console.log('[Document Parse] User:', (req as any).user ? 'Present' : 'Missing');
      console.log('[Document Parse] User details:', JSON.stringify((req as any).user?.claims || {}, null, 2));
      
      // Ensure response is JSON if an error occurs
      const originalJson = res.json;
      const originalSend = res.send;
      const originalEnd = res.end;
      
      res.json = function(body: any) {
        console.log('[Document Parse] Sending JSON response:', typeof body === 'object' ? JSON.stringify(body).substring(0, 200) : body);
        res.setHeader('Content-Type', 'application/json');
        return originalJson.call(this, body);
      };
      
      res.send = function(body: any) {
        console.log('[Document Parse] Sending response (send):', typeof body === 'string' ? body.substring(0, 200) : typeof body);
        if (typeof body === 'object') {
          res.setHeader('Content-Type', 'application/json');
        }
        return originalSend.call(this, body);
      };
      
      res.end = function(chunk?: any, encoding?: any) {
        console.log('[Document Parse] Ending response');
        return originalEnd.call(this, chunk, encoding);
      };
      
      // Catch any unhandled errors
      res.on('error', (err) => {
        console.error('[Document Parse] Response error:', err);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Internal server error', error: err.message });
        }
      });
      
      next();
    },
    // Step 1: Handle file upload with multer
    (req, res, next) => {
      console.log('[Document Parse] ----- Step 1: Multer Middleware -----');
      console.log('[Document Parse] Content-Type header:', req.headers['content-type']);
      console.log('[Document Parse] Has body:', !!req.body);
      
      upload.single('file')(req, res, (err) => {
        if (err) {
          console.error('[Document Parse] Multer error:', err);
          console.error('[Document Parse] Multer error stack:', err.stack);
          return res.status(400).json({ 
            message: 'File upload error',
            error: err.message 
          });
        }
        console.log('[Document Parse] Multer success');
        console.log('[Document Parse] File:', req.file ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          fieldname: req.file.fieldname
        } : 'NO FILE');
        next();
      });
    },
    // Step 2: Check authentication - ensure JSON response
    async (req, res, next) => {
      console.log('[Document Parse] ----- Step 2: Authentication Check -----');
      try {
        const user = (req as any).user;
        
        // Check if we're actually running on Replit (not just local dev with vars set)
        // Only use Replit OIDC if we're actually on a Replit domain
        const isActuallyReplit = process.env.REPLIT_DOMAINS && 
                                 process.env.REPL_ID && 
                                 !process.env.REPLIT_DOMAINS.includes('localhost') &&
                                 !process.env.REPLIT_DOMAINS.includes('127.0.0.1');
        const hasReplitOIDC = !!isActuallyReplit;
        
        console.log('[Document Parse] Has Replit OIDC:', hasReplitOIDC);
        console.log('[Document Parse] User object:', user ? 'Present' : 'Missing');
        console.log('[Document Parse] User claims:', user?.claims ? JSON.stringify(user.claims, null, 2) : 'None');
        console.log('[Document Parse] Is authenticated:', req.isAuthenticated ? req.isAuthenticated() : 'N/A');
        
        if (!hasReplitOIDC) {
          // For non-Replit environments, check if user has claims
          if (user?.claims?.sub) {
            console.log('[Document Parse] Auth passed (non-Replit), user ID:', user.claims.sub);
            return next();
          }
          // Return JSON error
          console.log('[Document Parse] Auth failed (non-Replit) - no user claims');
          console.log('[Document Parse] User object:', JSON.stringify(user || {}, null, 2));
          return res.status(401).json({ message: "Unauthorized", details: "No user claims found" });
        }
        
        // For Replit, check authentication explicitly
        if (!req.isAuthenticated() || !user?.expires_at) {
          console.log('[Document Parse] Auth failed (Replit)');
          console.log('[Document Parse] Is authenticated:', req.isAuthenticated());
          console.log('[Document Parse] Has expires_at:', !!user?.expires_at);
          return res.status(401).json({ message: "Unauthorized", details: "Not authenticated or token expired" });
        }
        
        // Check token expiration for Replit
        const now = Math.floor(Date.now() / 1000);
        if (now > user.expires_at) {
          console.log('[Document Parse] Token expired');
          return res.status(401).json({ message: "Unauthorized", details: "Token expired" });
        }
        
        // Authentication passed
        console.log('[Document Parse] Auth passed (Replit)');
        next();
      } catch (error) {
        console.error('[Document Parse] Auth check error:', error);
        console.error('[Document Parse] Auth check error stack:', error instanceof Error ? error.stack : 'No stack');
        return res.status(500).json({ 
          message: "Authentication check failed",
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    },
    // Step 3: Handle document parsing with comprehensive error handling
    async (req: any, res) => {
      console.log('[Document Parse] ----- Step 3: Document Parsing Handler -----');
      try {
        console.log('[Document Parse] Handler executing');
        console.log('[Document Parse] User:', req.user?.claims?.sub || 'No user');
        console.log('[Document Parse] File present:', !!req.file);
        
        if (!req.file) {
          console.log('[Document Parse] ERROR: No file in request');
          console.log('[Document Parse] Request body keys:', Object.keys(req.body || {}));
          console.log('[Document Parse] Request files:', Object.keys((req as any).files || {}));
          return res.status(400).json({ message: 'No file uploaded', details: 'File not found in request' });
        }

        const { buffer, originalname, mimetype } = req.file;
        console.log('[Document Parse] File details:', {
          originalname,
          mimetype,
          size: buffer.length,
          firstBytes: buffer.slice(0, 50).toString('hex')
        });
        
        console.log('[Document Parse] Starting document parsing...');
        // Parse the document
        const parsed = await documentParser.parseDocument(buffer, originalname, mimetype);
        console.log('[Document Parse] Parsed successfully');
        console.log('[Document Parse] Parsed type:', parsed.type);
        console.log('[Document Parse] Text length:', parsed.text.length);
        console.log('[Document Parse] Metadata:', JSON.stringify(parsed.metadata || {}, null, 2));
        
        // Return in the format expected by frontend
        const response = {
          text: parsed.text,
          textContent: parsed.text, // Also include textContent for compatibility
          type: parsed.type,
          metadata: parsed.metadata,
        };
        
        console.log('[Document Parse] Sending success response');
        res.json(response);
        console.log('[Document Parse] ===== SUCCESS =====');
      } catch (error) {
        console.error("[Document Parse] ERROR in handler:", error);
        console.error("[Document Parse] Error stack:", error instanceof Error ? error.stack : 'No stack');
        console.error("[Document Parse] Error name:", error instanceof Error ? error.name : 'Unknown');
        
        if (!res.headersSent) {
          res.status(500).json({ 
            message: "Failed to parse document",
            error: error instanceof Error ? error.message : 'Unknown error',
            details: error instanceof Error ? error.stack : undefined
          });
        } else {
          console.error("[Document Parse] Headers already sent, cannot send error response");
        }
      }
    }
  );

  // Generate solution from parsed document content
  app.post('/api/ai/generate-from-document', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const documentSchema = z.object({
        textContent: z.string().min(1),
        documentType: z.string().optional(),
      });
      
      const { textContent, documentType } = documentSchema.parse(req.body);
      
      // Log content length for debugging
      console.log(`[Generate from Document] Received textContent length: ${textContent?.length || 0} chars`);
      console.log(`[Generate from Document] Document type: ${documentType || 'unknown'}`);
      console.log(`[Generate from Document] Content preview: ${textContent?.substring(0, 200) || 'empty'}`);
      
      // Generate idea from document text using AI service (reuse HTML method as it works with any text)
      const generatedIdea = await aiService.generateIdeaFromHTML(textContent);
      
      // Enrich with comprehensive analysis to ensure accurate metrics, scores, and community signals
      try {
        console.log(`[Generate from Document] Enriching generated idea with comprehensive analysis: ${generatedIdea.title}`);
        const enrichedData = await aiService.enrichIdeaWithComprehensiveAnalysis({
          title: generatedIdea.title,
          description: generatedIdea.description,
          content: generatedIdea.content,
          type: generatedIdea.type,
          market: generatedIdea.market,
          targetAudience: generatedIdea.targetAudience,
          keyword: generatedIdea.keyword,
        });
        
        // Merge: generated idea takes precedence, enriched fills gaps
        const finalIdea = {
          ...enrichedData,
          ...generatedIdea, // Generated data overrides enriched defaults
          // Ensure comprehensive fields use enriched if missing from generated
          offerTiers: generatedIdea.offerTiers || enrichedData.offerTiers,
          whyNowAnalysis: generatedIdea.whyNowAnalysis || enrichedData.whyNowAnalysis,
          proofSignals: generatedIdea.proofSignals || enrichedData.proofSignals,
          marketGap: generatedIdea.marketGap || enrichedData.marketGap,
          executionPlan: generatedIdea.executionPlan || enrichedData.executionPlan,
          frameworkData: generatedIdea.frameworkData || enrichedData.frameworkData,
          keywordData: generatedIdea.keywordData || enrichedData.keywordData,
          communitySignals: generatedIdea.communitySignals || enrichedData.communitySignals,
          trendAnalysis: generatedIdea.trendAnalysis || enrichedData.trendAnalysis,
          signalBadges: generatedIdea.signalBadges || enrichedData.signalBadges,
        };
        
        console.log(`[Generate from Document] ✅ Comprehensive enrichment completed for: ${generatedIdea.title}`);
        res.json(finalIdea);
      } catch (enrichError) {
        console.error(`[Generate from Document] Enrichment failed, returning generated idea without enrichment:`, enrichError);
        // Return generated idea even if enrichment fails
      res.json(generatedIdea);
      }
    } catch (error) {
      console.error("Error generating idea from document:", error);
      res.status(500).json({ 
        message: "Failed to generate idea from document",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Generate solution from URL (fetch live website)
  app.post('/api/ai/generate-from-url', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const urlSchema = z.object({
        url: z.string().min(1),
      });
      
      let { url } = urlSchema.parse(req.body);
      
      // Normalize URL: add https:// if protocol is missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }
      
      // Validate the normalized URL
      try {
        new URL(url);
      } catch {
        throw new Error(`Invalid URL format: ${url}`);
      }
      
      console.log(`[Generate from URL] Fetching website with Puppeteer: ${url}`);
      
      let htmlContent;
      let browser;
      
      try {
        // Launch headless browser to bypass bot protection
        browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu',
          ],
        });
        
        const page = await browser.newPage();
        
        // Set a realistic viewport and user agent
        await page.setViewport({ width: 1920, height: 1080 });
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        // Navigate to the URL with timeout
        console.log(`[Generate from URL] Navigating to ${url}...`);
        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 30000, // 30 second timeout
        });
        
        // Wait a bit for any dynamic content to load
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get the full HTML content
        htmlContent = await page.content();
        console.log(`[Generate from URL] Fetched ${htmlContent.length} characters of HTML`);
        
        await browser.close();
        
        if (!htmlContent || htmlContent.length < 100) {
          return res.status(400).json({ 
            message: "Insufficient content",
            error: `Website returned insufficient content (${htmlContent.length} characters). Please try downloading the HTML file and uploading it directly instead.`
          });
        }
      } catch (puppeteerError: any) {
        // Ensure browser is closed even on error
        if (browser) {
          try {
            await browser.close();
          } catch (closeError) {
            console.error("Error closing browser:", closeError);
          }
        }
        
        console.error("Puppeteer error details:", puppeteerError);
        
        // Handle specific Puppeteer errors
        if (puppeteerError.name === 'TimeoutError') {
          return res.status(408).json({ 
            message: "Request timeout",
            error: "The website took too long to load (30 seconds). Please try again or upload the HTML file directly."
          });
        }
        if (puppeteerError.message && puppeteerError.message.includes('net::ERR')) {
          return res.status(400).json({ 
            message: "Network error",
            error: `Unable to connect to ${url}. Please check the URL and your internet connection.`
          });
        }
        // Re-throw for generic error handling below
        throw puppeteerError;
      }
      
      // Generate idea from fetched HTML
      const generatedIdea = await aiService.generateIdeaFromHTML(htmlContent);
      
      // Enrich with comprehensive analysis to ensure accurate metrics, scores, and community signals
      try {
        console.log(`[Generate from URL] Enriching generated idea with comprehensive analysis: ${generatedIdea.title}`);
        const enrichedData = await aiService.enrichIdeaWithComprehensiveAnalysis({
          title: generatedIdea.title,
          description: generatedIdea.description,
          content: generatedIdea.content,
          type: generatedIdea.type,
          market: generatedIdea.market,
          targetAudience: generatedIdea.targetAudience,
          keyword: generatedIdea.keyword,
        });
        
        // Merge: generated idea takes precedence, enriched fills gaps
        const finalIdea = {
          ...enrichedData,
          ...generatedIdea, // Generated data overrides enriched defaults
          // Ensure comprehensive fields use enriched if missing from generated
          offerTiers: generatedIdea.offerTiers || enrichedData.offerTiers,
          whyNowAnalysis: generatedIdea.whyNowAnalysis || enrichedData.whyNowAnalysis,
          proofSignals: generatedIdea.proofSignals || enrichedData.proofSignals,
          marketGap: generatedIdea.marketGap || enrichedData.marketGap,
          executionPlan: generatedIdea.executionPlan || enrichedData.executionPlan,
          frameworkData: generatedIdea.frameworkData || enrichedData.frameworkData,
          keywordData: generatedIdea.keywordData || enrichedData.keywordData,
          communitySignals: generatedIdea.communitySignals || enrichedData.communitySignals,
          trendAnalysis: generatedIdea.trendAnalysis || enrichedData.trendAnalysis,
          signalBadges: generatedIdea.signalBadges || enrichedData.signalBadges,
        };
        
        console.log(`[Generate from URL] ✅ Comprehensive enrichment completed for: ${generatedIdea.title}`);
        res.json(finalIdea);
      } catch (enrichError) {
        console.error(`[Generate from URL] Enrichment failed, returning generated idea without enrichment:`, enrichError);
        // Return generated idea even if enrichment fails
      res.json(generatedIdea);
      }
    } catch (error) {
      console.error("Error generating idea from URL:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ 
        message: "Failed to fetch or analyze URL",
        error: errorMessage
      });
    }
  });

  // Generate AI image for an idea
  app.post('/api/ai/generate-image', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      const imageSchema = z.object({
        title: z.string().min(1),
        description: z.string().optional(),
      });
      
      const { title, description } = imageSchema.parse(req.body);
      
      console.log(`[Generate Image] Generating image for: ${title}`);
      
      // Generate image using AI service
      const imageUrl = await aiService.generateIdeaImage(title, description);
      
      if (!imageUrl) {
        return res.status(500).json({ 
          message: "Failed to generate image",
          error: "Image generation service unavailable"
        });
      }
      
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ 
        message: "Failed to generate image",
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

  // Deep Research - Claude Sonnet 4.5 with Extended Thinking + Builder Prompts
  app.post('/api/ai/deep-research', isAuthenticated, async (req: any, res) => {
    console.log('[Deep Research] ===== ENDPOINT CALLED =====');
    console.log('[Deep Research] Timestamp:', new Date().toISOString());
    console.log('[Deep Research] req.user exists:', !!req.user);
    console.log('[Deep Research] req.user.claims exists:', !!req.user?.claims);
    console.log('[Deep Research] req.user.claims.sub:', req.user?.claims?.sub);
    console.log('[Deep Research] req.body keys:', Object.keys(req.body || {}));
    console.log('[Deep Research] req.body:', JSON.stringify(req.body, null, 2));
    
    try {
      const userId = req.user.claims.sub;
      console.log('[Deep Research] User ID extracted:', userId);

      // Validate request body
      const researchSchema = z.object({
        ideaTitle: z.string().min(1),
        ideaDescription: z.string().min(1),
        targetMarket: z.string().optional(),
        additionalContext: z.string().optional(),
        ideaId: z.string().optional(),
        type: z.string().optional(),
        market: z.string().optional(),
        targetAudience: z.string().optional(),
      });

      const params = researchSchema.parse(req.body);
      console.log('[Deep Research] ✅ Request validation passed');
      console.log(`[Deep Research] User ${userId} starting deep research for: ${params.ideaTitle}`);
      console.log('[Deep Research] Params:', JSON.stringify(params, null, 2));

      // Generate full idea using comprehensive AI analysis (same format as existing ideas)
      let generatedIdea, imageUrl;
      try {
        console.log('[Deep Research] 🚀 Starting AI idea generation...');
        console.log('[Deep Research] Calling aiService.generateIdea with params:', {
          industry: params.targetMarket || 'technology',
          type: params.type || 'web_app',
          market: params.market || 'B2C',
          targetAudience: params.targetAudience || 'general users',
          problemArea: params.ideaDescription.substring(0, 100),
          constraints: params.additionalContext || 'none'
        });
        const generateStartTime = Date.now();
        // Generate the full idea with all fields matching existing ideas
        generatedIdea = await aiService.generateIdea({
          industry: params.targetMarket || 'technology',
          type: params.type || 'web_app',
          market: params.market || 'B2C',
          targetAudience: params.targetAudience || 'general users',
          problemArea: params.ideaDescription.substring(0, 100),
          constraints: params.additionalContext || 'none'
        }).catch((error) => {
          const generateDuration = Date.now() - generateStartTime;
          logErrorToFile(error, 'Deep Research Generation (generateIdea)');
          console.error(`[Deep Research] ❌ Error in generateIdea after ${generateDuration}ms:`, error);
          console.error('[Deep Research] Error details:', {
            message: error?.message,
            status: error?.status,
            code: error?.code,
            name: error?.name,
            stack: error?.stack
          });
          throw error;
        });
        const generateDuration = Date.now() - generateStartTime;
        console.log(`[Deep Research] ✅ generateIdea completed in ${generateDuration}ms (${(generateDuration / 1000).toFixed(1)}s)`);

        // Override with user-provided title and description
        generatedIdea.title = params.ideaTitle;
        generatedIdea.description = params.ideaDescription;
        if (params.type) generatedIdea.type = params.type;
        if (params.market) generatedIdea.market = params.market;
        if (params.targetAudience) generatedIdea.targetAudience = params.targetAudience;

        // Enrich with comprehensive analysis to ensure accurate metrics, scores, and community signals
        try {
          console.log(`[Deep Research] Enriching generated idea with comprehensive AI analysis: ${generatedIdea.title}`);
          const enrichedData = await aiService.enrichIdeaWithComprehensiveAnalysis({
            title: generatedIdea.title,
            description: generatedIdea.description,
            content: generatedIdea.content,
            type: generatedIdea.type,
            market: generatedIdea.market,
            targetAudience: generatedIdea.targetAudience,
            keyword: generatedIdea.keyword,
          });
          
          // Merge: enriched data provides comprehensive fields, generated idea provides basic fields
          // Check if generated idea has meaningful comprehensive data, otherwise use enriched
          const hasMeaningfulOfferTiers = generatedIdea.offerTiers && 
                                         typeof generatedIdea.offerTiers === 'object' && 
                                         Object.keys(generatedIdea.offerTiers).length > 0;
          const hasMeaningfulWhyNow = generatedIdea.whyNowAnalysis && 
                                     typeof generatedIdea.whyNowAnalysis === 'string' && 
                                     generatedIdea.whyNowAnalysis.trim().length > 50;
          const hasMeaningfulProofSignals = generatedIdea.proofSignals && 
                                           typeof generatedIdea.proofSignals === 'string' && 
                                           generatedIdea.proofSignals.trim().length > 50;
          const hasMeaningfulMarketGap = generatedIdea.marketGap && 
                                        typeof generatedIdea.marketGap === 'string' && 
                                        generatedIdea.marketGap.trim().length > 50;
          const hasMeaningfulExecutionPlan = generatedIdea.executionPlan && 
                                            typeof generatedIdea.executionPlan === 'string' && 
                                            generatedIdea.executionPlan.trim().length > 50;
          const hasMeaningfulFramework = generatedIdea.frameworkData && 
                                        typeof generatedIdea.frameworkData === 'object' && 
                                        Object.keys(generatedIdea.frameworkData).length > 0;
          const hasMeaningfulKeywordData = generatedIdea.keywordData && 
                                          typeof generatedIdea.keywordData === 'object' && 
                                          Object.keys(generatedIdea.keywordData).length > 0;
          const hasMeaningfulCommunity = generatedIdea.communitySignals && 
                                       typeof generatedIdea.communitySignals === 'object' && 
                                       Object.keys(generatedIdea.communitySignals).length > 0;
          
          // Preserve builderPrompts from generated idea (it's specific to generateIdea)
          const hasBuilderPrompts = generatedIdea.builderPrompts && 
                                   typeof generatedIdea.builderPrompts === 'object' && 
                                   Object.keys(generatedIdea.builderPrompts).length > 0;
          
          generatedIdea = {
            ...enrichedData, // Start with enriched comprehensive data
            ...generatedIdea, // Override with generated basic fields (title, description, etc.)
            // Use enriched data for comprehensive fields unless generated has meaningful data
            offerTiers: hasMeaningfulOfferTiers ? generatedIdea.offerTiers : enrichedData.offerTiers,
            whyNowAnalysis: hasMeaningfulWhyNow ? generatedIdea.whyNowAnalysis : enrichedData.whyNowAnalysis,
            proofSignals: hasMeaningfulProofSignals ? generatedIdea.proofSignals : enrichedData.proofSignals,
            marketGap: hasMeaningfulMarketGap ? generatedIdea.marketGap : enrichedData.marketGap,
            executionPlan: hasMeaningfulExecutionPlan ? generatedIdea.executionPlan : enrichedData.executionPlan,
            frameworkData: hasMeaningfulFramework ? generatedIdea.frameworkData : enrichedData.frameworkData,
            keywordData: hasMeaningfulKeywordData ? generatedIdea.keywordData : enrichedData.keywordData,
            communitySignals: hasMeaningfulCommunity ? generatedIdea.communitySignals : enrichedData.communitySignals,
            trendAnalysis: (generatedIdea.trendAnalysis && typeof generatedIdea.trendAnalysis === 'string' && generatedIdea.trendAnalysis.trim().length > 50) 
              ? generatedIdea.trendAnalysis 
              : enrichedData.trendAnalysis,
            signalBadges: (generatedIdea.signalBadges && Array.isArray(generatedIdea.signalBadges) && generatedIdea.signalBadges.length > 0) 
              ? generatedIdea.signalBadges 
              : enrichedData.signalBadges,
            // Preserve builderPrompts from generated idea (enrichment doesn't generate this)
            builderPrompts: hasBuilderPrompts ? generatedIdea.builderPrompts : (generatedIdea.builderPrompts || {}),
          };
          
          console.log(`[Deep Research] ✅ Comprehensive enrichment completed for: ${generatedIdea.title}`);
          console.log(`[Deep Research] Comprehensive fields present:`, {
            offerTiers: {
              present: !!generatedIdea.offerTiers,
              complete: generatedIdea.offerTiers && typeof generatedIdea.offerTiers === 'object' && 
                       generatedIdea.offerTiers.leadMagnet && generatedIdea.offerTiers.frontend && 
                       generatedIdea.offerTiers.core && generatedIdea.offerTiers.backend && 
                       generatedIdea.offerTiers.continuity,
              tiers: generatedIdea.offerTiers ? Object.keys(generatedIdea.offerTiers).length : 0
            },
            whyNowAnalysis: {
              present: !!generatedIdea.whyNowAnalysis,
              length: generatedIdea.whyNowAnalysis ? generatedIdea.whyNowAnalysis.trim().length : 0,
              complete: !!generatedIdea.whyNowAnalysis && generatedIdea.whyNowAnalysis.trim().length > 50
            },
            proofSignals: {
              present: !!generatedIdea.proofSignals,
              length: generatedIdea.proofSignals ? generatedIdea.proofSignals.trim().length : 0,
              complete: !!generatedIdea.proofSignals && generatedIdea.proofSignals.trim().length > 50
            },
            marketGap: {
              present: !!generatedIdea.marketGap,
              length: generatedIdea.marketGap ? generatedIdea.marketGap.trim().length : 0,
              complete: !!generatedIdea.marketGap && generatedIdea.marketGap.trim().length > 50
            },
            executionPlan: {
              present: !!generatedIdea.executionPlan,
              length: generatedIdea.executionPlan ? generatedIdea.executionPlan.trim().length : 0,
              complete: !!generatedIdea.executionPlan && generatedIdea.executionPlan.trim().length > 50
            },
            frameworkData: {
              present: !!generatedIdea.frameworkData,
              complete: generatedIdea.frameworkData && typeof generatedIdea.frameworkData === 'object' &&
                       generatedIdea.frameworkData.valueEquation && generatedIdea.frameworkData.marketMatrix &&
                       generatedIdea.frameworkData.acpFramework,
              frameworks: generatedIdea.frameworkData ? Object.keys(generatedIdea.frameworkData).length : 0
            },
            keywordData: {
              present: !!generatedIdea.keywordData,
              complete: generatedIdea.keywordData && typeof generatedIdea.keywordData === 'object' &&
                       Array.isArray(generatedIdea.keywordData.fastestGrowing) &&
                       generatedIdea.keywordData.fastestGrowing.length >= 3,
              fastestGrowing: generatedIdea.keywordData?.fastestGrowing?.length || 0,
              highestVolume: generatedIdea.keywordData?.highestVolume?.length || 0,
              mostRelevant: generatedIdea.keywordData?.mostRelevant?.length || 0
            },
            communitySignals: {
              present: !!generatedIdea.communitySignals,
              complete: generatedIdea.communitySignals && typeof generatedIdea.communitySignals === 'object' &&
                       generatedIdea.communitySignals.reddit && generatedIdea.communitySignals.facebook &&
                       generatedIdea.communitySignals.youtube,
              platforms: generatedIdea.communitySignals ? Object.keys(generatedIdea.communitySignals).length : 0
            },
            trendAnalysis: {
              present: !!generatedIdea.trendAnalysis,
              length: generatedIdea.trendAnalysis ? generatedIdea.trendAnalysis.trim().length : 0,
              complete: !!generatedIdea.trendAnalysis && generatedIdea.trendAnalysis.trim().length > 50
            },
            builderPrompts: {
              present: !!generatedIdea.builderPrompts,
              complete: generatedIdea.builderPrompts && typeof generatedIdea.builderPrompts === 'object' &&
                       Object.keys(generatedIdea.builderPrompts).length >= 4,
              prompts: generatedIdea.builderPrompts ? Object.keys(generatedIdea.builderPrompts).length : 0
            },
            signalBadges: {
              present: Array.isArray(generatedIdea.signalBadges) && generatedIdea.signalBadges.length > 0,
              count: Array.isArray(generatedIdea.signalBadges) ? generatedIdea.signalBadges.length : 0
            }
          });
        } catch (enrichError) {
          console.error(`[Deep Research] Enrichment failed, using generated idea without enrichment:`, enrichError);
          // Continue with generated idea if enrichment fails
        }

        // Generate image for the idea
        try {
          imageUrl = await aiService.searchAppImage(generatedIdea.title, generatedIdea.description);
          if (imageUrl) {
            generatedIdea.imageUrl = imageUrl;
          }
        } catch (imageError) {
          console.error('Error generating image (non-critical):', imageError);
        }

        console.log('[Deep Research] ✅ Deep research idea generation completed successfully');
      } catch (genError: any) {
        console.error('[Deep Research] ❌ ERROR in generateIdea:', genError);
        console.error('[Deep Research] Error message:', genError?.message);
        console.error('[Deep Research] Error stack:', genError?.stack);
        logErrorToFile(genError, 'Deep Research Generation (generateIdea)');
        throw genError; // Re-throw to be caught by outer catch
      }

      // Generate slug from title
      const baseSlug = generatedIdea.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Generate unique slug
      const uniqueSlug = await slugService.generateUniqueSlug(baseSlug, new Set<string>());

      // Ensure signalBadges is an array
      const signalBadges = Array.isArray(generatedIdea.signalBadges) 
        ? generatedIdea.signalBadges 
        : (generatedIdea.signalBadges ? [generatedIdea.signalBadges] : []);

      // Create the idea in database - ensure all required fields match existing apps structure
      const ideaData = {
        // Basic required fields
        title: generatedIdea.title,
        subtitle: generatedIdea.subtitle || generatedIdea.description?.substring(0, 100) || '',
        description: generatedIdea.description,
        content: generatedIdea.content || generatedIdea.description || '',
        slug: uniqueSlug,
        type: generatedIdea.type || 'web_app',
        market: generatedIdea.market || 'B2C',
        targetAudience: generatedIdea.targetAudience || 'general users',
        keyword: generatedIdea.keyword || '',
        mainCompetitor: generatedIdea.mainCompetitor || '',
        // Required scores with defaults
        opportunityScore: generatedIdea.opportunityScore || 7,
        opportunityLabel: generatedIdea.opportunityLabel || 'Good Opportunity',
        problemScore: generatedIdea.problemScore || 7,
        problemLabel: generatedIdea.problemLabel || 'Clear Problem',
        feasibilityScore: generatedIdea.feasibilityScore || 6,
        feasibilityLabel: generatedIdea.feasibilityLabel || 'Moderate Complexity',
        timingScore: generatedIdea.timingScore || 7,
        timingLabel: generatedIdea.timingLabel || 'Good Timing',
        executionScore: generatedIdea.executionScore || 6,
        gtmScore: generatedIdea.gtmScore || 7,
        // Business metrics
        revenuePotential: generatedIdea.revenuePotential || 'TBD',
        revenuePotentialNum: generatedIdea.revenuePotentialNum || 1000000,
        executionDifficulty: generatedIdea.executionDifficulty || 'Medium',
        gtmStrength: generatedIdea.gtmStrength || 'TBD',
        keywordVolume: generatedIdea.keywordVolume || 0,
        keywordGrowth: String(generatedIdea.keywordGrowth || 0),
        // Comprehensive analysis sections (must match existing apps)
        offerTiers: generatedIdea.offerTiers,
        whyNowAnalysis: generatedIdea.whyNowAnalysis,
        proofSignals: generatedIdea.proofSignals,
        marketGap: generatedIdea.marketGap,
        executionPlan: generatedIdea.executionPlan,
        frameworkData: generatedIdea.frameworkData,
        trendAnalysis: generatedIdea.trendAnalysis,
        keywordData: generatedIdea.keywordData,
        communitySignals: generatedIdea.communitySignals,
        builderPrompts: generatedIdea.builderPrompts,
        signalBadges,
        // Image
        imageUrl: generatedIdea.imageUrl || null,
        // Metadata
        createdBy: userId,
        sourceType: 'user_generated' as const,
        sourceData: JSON.stringify({ researchType: 'deep', originalParams: params }),
        isPublished: true,
      };

      // Log comprehensive fields before saving with detailed validation
      console.log('[Deep Research] 💾 Preparing to save idea to database...');
      
      // Detailed field validation
      const offerTiersComplete = ideaData.offerTiers && 
        typeof ideaData.offerTiers === 'object' &&
        ideaData.offerTiers.leadMagnet &&
        ideaData.offerTiers.frontend &&
        ideaData.offerTiers.core &&
        ideaData.offerTiers.backend &&
        ideaData.offerTiers.continuity;
      
      const frameworkDataComplete = ideaData.frameworkData &&
        typeof ideaData.frameworkData === 'object' &&
        ideaData.frameworkData.valueEquation &&
        ideaData.frameworkData.marketMatrix &&
        ideaData.frameworkData.acpFramework;
      
      const keywordDataComplete = ideaData.keywordData &&
        typeof ideaData.keywordData === 'object' &&
        Array.isArray(ideaData.keywordData.fastestGrowing) &&
        ideaData.keywordData.fastestGrowing.length >= 3 &&
        Array.isArray(ideaData.keywordData.highestVolume) &&
        ideaData.keywordData.highestVolume.length >= 3 &&
        Array.isArray(ideaData.keywordData.mostRelevant) &&
        ideaData.keywordData.mostRelevant.length >= 3;
      
      const communitySignalsComplete = ideaData.communitySignals &&
        typeof ideaData.communitySignals === 'object' &&
        ideaData.communitySignals.reddit &&
        ideaData.communitySignals.facebook &&
        ideaData.communitySignals.youtube;
      
      const builderPromptsComplete = ideaData.builderPrompts &&
        typeof ideaData.builderPrompts === 'object' &&
        Object.keys(ideaData.builderPrompts).length >= 4;
      
      console.log(`[Deep Research] Saving idea with comprehensive fields:`, {
        title: ideaData.title,
        subtitle: ideaData.subtitle,
        comprehensiveFields: {
          offerTiers: {
            present: !!ideaData.offerTiers,
            complete: offerTiersComplete,
            tiers: ideaData.offerTiers ? Object.keys(ideaData.offerTiers).length : 0
          },
          whyNowAnalysis: {
            present: !!ideaData.whyNowAnalysis,
            length: ideaData.whyNowAnalysis ? ideaData.whyNowAnalysis.trim().length : 0,
            complete: !!ideaData.whyNowAnalysis && ideaData.whyNowAnalysis.trim().length > 50
          },
          proofSignals: {
            present: !!ideaData.proofSignals,
            length: ideaData.proofSignals ? ideaData.proofSignals.trim().length : 0,
            complete: !!ideaData.proofSignals && ideaData.proofSignals.trim().length > 50
          },
          marketGap: {
            present: !!ideaData.marketGap,
            length: ideaData.marketGap ? ideaData.marketGap.trim().length : 0,
            complete: !!ideaData.marketGap && ideaData.marketGap.trim().length > 50
          },
          executionPlan: {
            present: !!ideaData.executionPlan,
            length: ideaData.executionPlan ? ideaData.executionPlan.trim().length : 0,
            complete: !!ideaData.executionPlan && ideaData.executionPlan.trim().length > 50
          },
          frameworkData: {
            present: !!ideaData.frameworkData,
            complete: frameworkDataComplete,
            frameworks: ideaData.frameworkData ? Object.keys(ideaData.frameworkData).length : 0
          },
          keywordData: {
            present: !!ideaData.keywordData,
            complete: keywordDataComplete,
            fastestGrowing: ideaData.keywordData?.fastestGrowing?.length || 0,
            highestVolume: ideaData.keywordData?.highestVolume?.length || 0,
            mostRelevant: ideaData.keywordData?.mostRelevant?.length || 0
          },
          communitySignals: {
            present: !!ideaData.communitySignals,
            complete: communitySignalsComplete,
            platforms: ideaData.communitySignals ? Object.keys(ideaData.communitySignals).length : 0
          },
          trendAnalysis: {
            present: !!ideaData.trendAnalysis,
            length: ideaData.trendAnalysis ? ideaData.trendAnalysis.trim().length : 0,
            complete: !!ideaData.trendAnalysis && ideaData.trendAnalysis.trim().length > 50
          },
          builderPrompts: {
            present: !!ideaData.builderPrompts,
            complete: builderPromptsComplete,
            prompts: ideaData.builderPrompts ? Object.keys(ideaData.builderPrompts).length : 0
          },
          signalBadges: {
            present: signalBadges.length > 0,
            count: signalBadges.length,
            badges: signalBadges
          }
        },
        allRequiredFields: {
          title: !!ideaData.title,
          description: !!ideaData.description,
          content: !!ideaData.content,
          type: !!ideaData.type,
          market: !!ideaData.market,
          opportunityScore: ideaData.opportunityScore > 0,
          problemScore: ideaData.problemScore > 0,
          feasibilityScore: ideaData.feasibilityScore > 0,
          timingScore: ideaData.timingScore > 0,
          executionScore: ideaData.executionScore > 0,
          gtmScore: ideaData.gtmScore > 0,
        },
      });
      
      // Warn if critical fields are missing
      const missingComprehensiveFields = [];
      if (!offerTiersComplete) missingComprehensiveFields.push('offerTiers (incomplete)');
      if (!ideaData.whyNowAnalysis || ideaData.whyNowAnalysis.trim().length < 50) missingComprehensiveFields.push('whyNowAnalysis');
      if (!ideaData.proofSignals || ideaData.proofSignals.trim().length < 50) missingComprehensiveFields.push('proofSignals');
      if (!ideaData.marketGap || ideaData.marketGap.trim().length < 50) missingComprehensiveFields.push('marketGap');
      if (!ideaData.executionPlan || ideaData.executionPlan.trim().length < 50) missingComprehensiveFields.push('executionPlan');
      if (!frameworkDataComplete) missingComprehensiveFields.push('frameworkData (incomplete)');
      if (!keywordDataComplete) missingComprehensiveFields.push('keywordData (incomplete)');
      if (!communitySignalsComplete) missingComprehensiveFields.push('communitySignals (incomplete)');
      if (!ideaData.trendAnalysis || ideaData.trendAnalysis.trim().length < 50) missingComprehensiveFields.push('trendAnalysis');
      if (!builderPromptsComplete) missingComprehensiveFields.push('builderPrompts (incomplete)');
      if (signalBadges.length === 0) missingComprehensiveFields.push('signalBadges');
      
      if (missingComprehensiveFields.length > 0) {
        console.warn(`[Deep Research] ⚠️ Missing or incomplete comprehensive fields: ${missingComprehensiveFields.join(', ')}`);
      } else {
        console.log(`[Deep Research] ✅ All comprehensive fields present and complete`);
      }
      
      // Validate required fields before saving
      const requiredFields = {
        title: ideaData.title,
        slug: ideaData.slug,
        description: ideaData.description,
        content: ideaData.content,
        type: ideaData.type,
        market: ideaData.market,
        opportunityScore: ideaData.opportunityScore,
        opportunityLabel: ideaData.opportunityLabel,
        problemScore: ideaData.problemScore,
        problemLabel: ideaData.problemLabel,
        feasibilityScore: ideaData.feasibilityScore,
        feasibilityLabel: ideaData.feasibilityLabel,
        timingScore: ideaData.timingScore,
        timingLabel: ideaData.timingLabel,
        executionScore: ideaData.executionScore,
        gtmScore: ideaData.gtmScore,
      };
      
      const missingRequiredFields = Object.entries(requiredFields)
        .filter(([key, value]) => value === undefined || value === null || value === '')
        .map(([key]) => key);
      
      if (missingRequiredFields.length > 0) {
        console.error('[Deep Research] ❌ Missing required fields:', missingRequiredFields);
        throw new Error(`Missing required fields: ${missingRequiredFields.join(', ')}`);
      }
      
      // Validate types
      if (typeof ideaData.opportunityScore !== 'number' || ideaData.opportunityScore < 1 || ideaData.opportunityScore > 10) {
        console.error('[Deep Research] ❌ Invalid opportunityScore:', ideaData.opportunityScore);
        throw new Error(`Invalid opportunityScore: ${ideaData.opportunityScore}`);
      }
      
      console.log('[Deep Research] ✅ All required fields validated, types checked');

      try {
        console.log('[Deep Research] 💾 Calling storage.createIdea()...');
        const createdIdea = await storage.createIdea(ideaData);
        console.log(`[Deep Research] ✅✅✅ IDEA SAVED SUCCESSFULLY ✅✅✅`);
        console.log(`[Deep Research] Idea ID: ${createdIdea.id}`);
        console.log(`[Deep Research] Idea Title: ${createdIdea.title}`);
        console.log(`[Deep Research] Idea Slug: ${createdIdea.slug}`);
        console.log(`[Deep Research] Created At: ${createdIdea.createdAt}`);

        console.log('[Deep Research] 📤 Sending response to client...');
        // Return the created idea
        res.json(createdIdea);
        console.log('[Deep Research] ✅ Response sent successfully');
      } catch (saveError: any) {
        console.error(`[Deep Research] ❌❌❌ FAILED TO SAVE IDEA ❌❌❌`);
        console.error(`[Deep Research] Save error type:`, saveError?.constructor?.name);
        console.error(`[Deep Research] Save error message:`, saveError?.message);
        console.error(`[Deep Research] Save error code:`, saveError?.code);
        console.error(`[Deep Research] Save error detail:`, saveError?.detail);
        console.error(`[Deep Research] Save error constraint:`, saveError?.constraint);
        console.error(`[Deep Research] Save error table:`, saveError?.table);
        console.error(`[Deep Research] Save error column:`, saveError?.column);
        console.error(`[Deep Research] Full error:`, JSON.stringify(saveError, Object.getOwnPropertyNames(saveError), 2));
        
        // Handle specific database errors
        if (saveError?.code === '23505') { // Unique constraint violation
          console.error(`[Deep Research] Unique constraint violation - slug may already exist: ${ideaData.slug}`);
        } else if (saveError?.code === '23503') { // Foreign key violation
          console.error(`[Deep Research] Foreign key violation - user may not exist: ${userId}`);
        } else if (saveError?.code === '23502') { // Not null violation
          console.error(`[Deep Research] Not null violation - column: ${saveError?.column}`);
        } else if (saveError?.code === '42804') { // Type mismatch
          console.error(`[Deep Research] Type mismatch - column: ${saveError?.column}`);
        }
        
        logErrorToFile(saveError, 'Deep Research Save');
        throw saveError;
      }
    } catch (error) {
      console.error('[Deep Research] ❌❌❌ OUTER CATCH BLOCK - ERROR ❌❌❌');
      console.error('[Deep Research] Error type:', error?.constructor?.name);
      console.error('[Deep Research] Error message:', error instanceof Error ? error.message : String(error));
      console.error('[Deep Research] Error stack:', error instanceof Error ? error.stack : undefined);
      logErrorToFile(error, 'Deep Research Endpoint');
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Provide more specific error messages
      let userMessage = "Failed to generate deep research report";
      if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        userMessage = "AI service authentication error. Please check API configuration.";
      } else if (errorMessage.includes('timeout') || errorMessage.includes('time')) {
        userMessage = "Request timed out. Please try again with a simpler request.";
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        userMessage = "AI service rate limit exceeded. Please try again later.";
      } else if (errorMessage.includes('parse') || errorMessage.includes('JSON')) {
        userMessage = "Error parsing AI response. Please try again.";
      }
      
      res.status(500).json({
        message: userMessage,
        error: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      });
    }
  });

  // Rapid Research - Claude Haiku (fast, 5-10 minute response) + Builder Prompts
  app.post('/api/ai/rapid-research', isAuthenticated, async (req: any, res) => {
    // CRITICAL: This log MUST appear if endpoint is hit
    console.error('[RAPID RESEARCH] ===== ENDPOINT HIT - THIS MUST APPEAR =====');
    console.log('[Rapid Research] ===== ENDPOINT CALLED =====');
    console.log('[Rapid Research] Timestamp:', new Date().toISOString());
    console.log('[Rapid Research] req.user exists:', !!req.user);
    console.log('[Rapid Research] req.user.claims exists:', !!req.user?.claims);
    console.log('[Rapid Research] req.user.claims.sub:', req.user?.claims?.sub);
    console.log('[Rapid Research] req.body keys:', Object.keys(req.body || {}));
    console.log('[Rapid Research] req.body:', JSON.stringify(req.body, null, 2));
    
    try {
      const userId = req.user.claims.sub;
      console.log('[Rapid Research] User ID extracted:', userId);

      // Validate request body
      const researchSchema = z.object({
        ideaTitle: z.string().min(1),
        ideaDescription: z.string().min(1),
        targetMarket: z.string().optional(),
        ideaId: z.string().optional(),
        type: z.string().optional(),
        market: z.string().optional(),
        targetAudience: z.string().optional(),
      });

      const params = researchSchema.parse(req.body);
      console.log('[Rapid Research] ✅ Request validation passed');
      console.log(`[Rapid Research] User ${userId} starting rapid research for: ${params.ideaTitle}`);

      // Generate full idea using comprehensive AI analysis (same format as existing ideas)
      let generatedIdea, imageUrl;
      try {
        console.log('[Rapid Research] 🚀 Starting AI idea generation...');
        console.log('[Rapid Research] Calling aiService.generateIdea with params:', {
          industry: params.targetMarket || 'technology',
          type: params.type || 'web_app',
          market: params.market || 'B2C',
          targetAudience: params.targetAudience || 'general users',
          problemArea: params.ideaDescription.substring(0, 100),
          constraints: 'rapid_mode'
        });
        const generateStartTime = Date.now();
        // Generate the full idea with all fields matching existing ideas
        generatedIdea = await aiService.generateIdea({
          industry: params.targetMarket || 'technology',
          type: params.type || 'web_app',
          market: params.market || 'B2C',
          targetAudience: params.targetAudience || 'general users',
          problemArea: params.ideaDescription.substring(0, 100),
          constraints: 'rapid_mode'
        }).catch((error) => {
          const generateDuration = Date.now() - generateStartTime;
          logErrorToFile(error, 'Rapid Research Generation (generateIdea)');
          console.error(`[Rapid Research] ❌ Error in generateIdea after ${generateDuration}ms:`, error);
          console.error('[Rapid Research] Error details:', {
            message: error?.message,
            status: error?.status,
            code: error?.code,
            name: error?.name,
            stack: error?.stack
          });
          throw error;
        });
        const generateDuration = Date.now() - generateStartTime;
        console.log(`[Rapid Research] ✅ generateIdea completed in ${generateDuration}ms (${(generateDuration / 1000).toFixed(1)}s)`);

        console.log('[Rapid Research] ✅ AI idea generation completed');
        console.log('[Rapid Research] Generated idea title:', generatedIdea?.title);
        console.log('[Rapid Research] Generated idea has content:', !!generatedIdea?.content);
        
        // Override with user-provided title and description
        generatedIdea.title = params.ideaTitle;
        generatedIdea.description = params.ideaDescription;
        if (params.type) generatedIdea.type = params.type;
        if (params.market) generatedIdea.market = params.market;
        if (params.targetAudience) generatedIdea.targetAudience = params.targetAudience;
        console.log('[Rapid Research] ✅ User-provided fields applied');

        // Enrich with comprehensive analysis to ensure accurate metrics, scores, and community signals
        // Check if generated idea has all required comprehensive fields, enrich if missing
        let enrichedData;
        try {
          // Check if generated idea has meaningful comprehensive data
          const hasMeaningfulOfferTiers = generatedIdea.offerTiers && 
                                         typeof generatedIdea.offerTiers === 'object' && 
                                         Object.keys(generatedIdea.offerTiers).length > 0 &&
                                         generatedIdea.offerTiers.leadMagnet &&
                                         generatedIdea.offerTiers.frontend &&
                                         generatedIdea.offerTiers.core;
          const hasMeaningfulWhyNow = generatedIdea.whyNowAnalysis && 
                                     typeof generatedIdea.whyNowAnalysis === 'string' && 
                                     generatedIdea.whyNowAnalysis.trim().length > 50;
          const hasMeaningfulProofSignals = generatedIdea.proofSignals && 
                                           typeof generatedIdea.proofSignals === 'string' && 
                                           generatedIdea.proofSignals.trim().length > 50;
          const hasMeaningfulMarketGap = generatedIdea.marketGap && 
                                        typeof generatedIdea.marketGap === 'string' && 
                                        generatedIdea.marketGap.trim().length > 50;
          const hasMeaningfulExecutionPlan = generatedIdea.executionPlan && 
                                            typeof generatedIdea.executionPlan === 'string' && 
                                            generatedIdea.executionPlan.trim().length > 50;
          const hasMeaningfulFramework = generatedIdea.frameworkData && 
                                        typeof generatedIdea.frameworkData === 'object' && 
                                        Object.keys(generatedIdea.frameworkData).length > 0 &&
                                        generatedIdea.frameworkData.valueEquation &&
                                        generatedIdea.frameworkData.marketMatrix;
          const hasMeaningfulKeywordData = generatedIdea.keywordData && 
                                          typeof generatedIdea.keywordData === 'object' && 
                                          Object.keys(generatedIdea.keywordData).length > 0 &&
                                          Array.isArray(generatedIdea.keywordData.fastestGrowing) &&
                                          generatedIdea.keywordData.fastestGrowing.length > 0;
          const hasMeaningfulCommunity = generatedIdea.communitySignals && 
                                       typeof generatedIdea.communitySignals === 'object' && 
                                       Object.keys(generatedIdea.communitySignals).length > 0 &&
                                       generatedIdea.communitySignals.reddit;
          
          // Preserve builderPrompts from generated idea (it's specific to generateIdea)
          const hasBuilderPrompts = generatedIdea.builderPrompts && 
                                   typeof generatedIdea.builderPrompts === 'object' && 
                                   Object.keys(generatedIdea.builderPrompts).length > 0;
          
          // Check if we need enrichment (if any critical fields are missing)
          const needsEnrichment = !hasMeaningfulOfferTiers || !hasMeaningfulWhyNow || !hasMeaningfulProofSignals || 
                                 !hasMeaningfulMarketGap || !hasMeaningfulExecutionPlan || !hasMeaningfulFramework ||
                                 !hasMeaningfulKeywordData || !hasMeaningfulCommunity;
          
          if (needsEnrichment) {
            console.log(`[Rapid Research] Some comprehensive fields missing, enriching with AI...`);
            console.log(`[Rapid Research] Missing fields:`, {
              offerTiers: !hasMeaningfulOfferTiers,
              whyNowAnalysis: !hasMeaningfulWhyNow,
              proofSignals: !hasMeaningfulProofSignals,
              marketGap: !hasMeaningfulMarketGap,
              executionPlan: !hasMeaningfulExecutionPlan,
              frameworkData: !hasMeaningfulFramework,
              keywordData: !hasMeaningfulKeywordData,
              communitySignals: !hasMeaningfulCommunity,
            });
            
            enrichedData = await aiService.enrichIdeaWithComprehensiveAnalysis({
              title: generatedIdea.title,
              description: generatedIdea.description,
              content: generatedIdea.content,
              type: generatedIdea.type,
              market: generatedIdea.market,
              targetAudience: generatedIdea.targetAudience,
              keyword: generatedIdea.keyword,
            });
          } else {
            console.log(`[Rapid Research] All comprehensive fields present, using generated idea data directly`);
            // Use the generated idea's data as-is for rapid mode (it's already comprehensive)
            enrichedData = {
              offerTiers: generatedIdea.offerTiers,
              whyNowAnalysis: generatedIdea.whyNowAnalysis,
              proofSignals: generatedIdea.proofSignals,
              marketGap: generatedIdea.marketGap,
              executionPlan: generatedIdea.executionPlan,
              frameworkData: generatedIdea.frameworkData,
              trendAnalysis: generatedIdea.trendAnalysis,
              keywordData: generatedIdea.keywordData,
              communitySignals: generatedIdea.communitySignals,
              signalBadges: generatedIdea.signalBadges,
            };
          }
          
          // Merge: enriched data provides comprehensive fields, generated idea provides basic fields
          generatedIdea = {
            ...enrichedData, // Start with enriched comprehensive data
            ...generatedIdea, // Override with generated basic fields (title, description, etc.)
            // Use generated data for comprehensive fields if meaningful, otherwise use enriched
            offerTiers: hasMeaningfulOfferTiers ? generatedIdea.offerTiers : enrichedData.offerTiers,
            whyNowAnalysis: hasMeaningfulWhyNow ? generatedIdea.whyNowAnalysis : enrichedData.whyNowAnalysis,
            proofSignals: hasMeaningfulProofSignals ? generatedIdea.proofSignals : enrichedData.proofSignals,
            marketGap: hasMeaningfulMarketGap ? generatedIdea.marketGap : enrichedData.marketGap,
            executionPlan: hasMeaningfulExecutionPlan ? generatedIdea.executionPlan : enrichedData.executionPlan,
            frameworkData: hasMeaningfulFramework ? generatedIdea.frameworkData : enrichedData.frameworkData,
            keywordData: hasMeaningfulKeywordData ? generatedIdea.keywordData : enrichedData.keywordData,
            communitySignals: hasMeaningfulCommunity ? generatedIdea.communitySignals : enrichedData.communitySignals,
            trendAnalysis: (generatedIdea.trendAnalysis && typeof generatedIdea.trendAnalysis === 'string' && generatedIdea.trendAnalysis.trim().length > 50) 
              ? generatedIdea.trendAnalysis 
              : (enrichedData.trendAnalysis || generatedIdea.trendAnalysis),
            signalBadges: (generatedIdea.signalBadges && Array.isArray(generatedIdea.signalBadges) && generatedIdea.signalBadges.length > 0) 
              ? generatedIdea.signalBadges 
              : (enrichedData.signalBadges || generatedIdea.signalBadges || []),
            // Preserve builderPrompts from generated idea (enrichment doesn't generate this)
            builderPrompts: hasBuilderPrompts ? generatedIdea.builderPrompts : (generatedIdea.builderPrompts || {}),
          };
          
          console.log(`[Rapid Research] ✅ Comprehensive data merge completed for: ${generatedIdea.title}`);
          console.log(`[Rapid Research] Comprehensive fields present:`, {
            offerTiers: !!generatedIdea.offerTiers && typeof generatedIdea.offerTiers === 'object' && Object.keys(generatedIdea.offerTiers).length >= 3,
            whyNowAnalysis: !!generatedIdea.whyNowAnalysis && generatedIdea.whyNowAnalysis.trim().length > 50,
            proofSignals: !!generatedIdea.proofSignals && generatedIdea.proofSignals.trim().length > 50,
            marketGap: !!generatedIdea.marketGap && generatedIdea.marketGap.trim().length > 50,
            executionPlan: !!generatedIdea.executionPlan && generatedIdea.executionPlan.trim().length > 50,
            frameworkData: !!generatedIdea.frameworkData && typeof generatedIdea.frameworkData === 'object' && Object.keys(generatedIdea.frameworkData).length > 0,
            keywordData: !!generatedIdea.keywordData && typeof generatedIdea.keywordData === 'object' && Array.isArray(generatedIdea.keywordData.fastestGrowing),
            communitySignals: !!generatedIdea.communitySignals && typeof generatedIdea.communitySignals === 'object' && generatedIdea.communitySignals.reddit,
            trendAnalysis: !!generatedIdea.trendAnalysis && generatedIdea.trendAnalysis.trim().length > 50,
            builderPrompts: !!generatedIdea.builderPrompts && typeof generatedIdea.builderPrompts === 'object' && Object.keys(generatedIdea.builderPrompts).length > 0,
            signalBadges: Array.isArray(generatedIdea.signalBadges) && generatedIdea.signalBadges.length > 0,
          });
        } catch (enrichError) {
          console.error(`[Rapid Research] Enrichment failed, using generated idea without enrichment:`, enrichError);
          // Continue with generated idea if enrichment fails
        }

        // Generate image for the idea (non-blocking for rapid mode to save time)
        if (params.constraints === 'rapid_mode') {
          // For rapid mode, fetch image asynchronously after saving (don't block response)
          console.log('[Rapid Research] Image search will be done asynchronously after save');
        } else {
          // For deep/comprehensive mode, wait for image
          try {
            imageUrl = await aiService.searchAppImage(generatedIdea.title, generatedIdea.description);
            if (imageUrl) {
              generatedIdea.imageUrl = imageUrl;
            }
          } catch (imageError) {
            console.error('Error generating image (non-critical):', imageError);
          }
        }

        console.log('[Rapid Research] ✅ Rapid research idea generation completed successfully');
      } catch (genError: any) {
        console.error('[Rapid Research] ❌ ERROR in generateIdea:', genError);
        console.error('[Rapid Research] Error message:', genError?.message);
        console.error('[Rapid Research] Error stack:', genError?.stack);
        logErrorToFile(genError, 'Rapid Research Generation (generateIdea)');
        throw genError; // Re-throw to be caught by outer catch
      }

      console.log('[Rapid Research] 📝 Generating slug...');
      // Generate slug from title
      const baseSlug = generatedIdea.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      // Generate unique slug
      const uniqueSlug = await slugService.generateUniqueSlug(baseSlug, new Set<string>());
      console.log('[Rapid Research] ✅ Slug generated:', uniqueSlug);

      // Ensure signalBadges is an array
      const signalBadges = Array.isArray(generatedIdea.signalBadges) 
        ? generatedIdea.signalBadges 
        : (generatedIdea.signalBadges ? [generatedIdea.signalBadges] : []);

      // Create the idea in database - ensure all required fields match existing apps structure
      const ideaData = {
        // Basic required fields
        title: generatedIdea.title,
        subtitle: generatedIdea.subtitle || generatedIdea.description?.substring(0, 100) || '',
        description: generatedIdea.description,
        content: generatedIdea.content || generatedIdea.description || '',
        slug: uniqueSlug,
        type: generatedIdea.type || 'web_app',
        market: generatedIdea.market || 'B2C',
        targetAudience: generatedIdea.targetAudience || 'general users',
        keyword: generatedIdea.keyword || '',
        mainCompetitor: generatedIdea.mainCompetitor || '',
        // Required scores with defaults
        opportunityScore: generatedIdea.opportunityScore || 7,
        opportunityLabel: generatedIdea.opportunityLabel || 'Good Opportunity',
        problemScore: generatedIdea.problemScore || 7,
        problemLabel: generatedIdea.problemLabel || 'Clear Problem',
        feasibilityScore: generatedIdea.feasibilityScore || 6,
        feasibilityLabel: generatedIdea.feasibilityLabel || 'Moderate Complexity',
        timingScore: generatedIdea.timingScore || 7,
        timingLabel: generatedIdea.timingLabel || 'Good Timing',
        executionScore: generatedIdea.executionScore || 6,
        gtmScore: generatedIdea.gtmScore || 7,
        // Business metrics
        revenuePotential: generatedIdea.revenuePotential || 'TBD',
        revenuePotentialNum: generatedIdea.revenuePotentialNum || 1000000,
        executionDifficulty: generatedIdea.executionDifficulty || 'Medium',
        gtmStrength: generatedIdea.gtmStrength || 'TBD',
        keywordVolume: generatedIdea.keywordVolume || 0,
        keywordGrowth: String(generatedIdea.keywordGrowth || 0),
        // Comprehensive analysis sections (must match existing apps)
        offerTiers: generatedIdea.offerTiers,
        whyNowAnalysis: generatedIdea.whyNowAnalysis,
        proofSignals: generatedIdea.proofSignals,
        marketGap: generatedIdea.marketGap,
        executionPlan: generatedIdea.executionPlan,
        frameworkData: generatedIdea.frameworkData,
        trendAnalysis: generatedIdea.trendAnalysis,
        keywordData: generatedIdea.keywordData,
        communitySignals: generatedIdea.communitySignals,
        builderPrompts: generatedIdea.builderPrompts,
        signalBadges,
        // Image
        imageUrl: generatedIdea.imageUrl || null,
        // Metadata
        createdBy: userId,
        sourceType: 'user_generated' as const,
        sourceData: JSON.stringify({ researchType: 'rapid', originalParams: params }),
        isPublished: true,
      };

      // Log comprehensive fields before saving with detailed validation
      console.log('[Rapid Research] 💾 Preparing to save idea to database...');
      
      // Detailed field validation
      const offerTiersComplete = ideaData.offerTiers && 
        typeof ideaData.offerTiers === 'object' &&
        ideaData.offerTiers.leadMagnet &&
        ideaData.offerTiers.frontend &&
        ideaData.offerTiers.core &&
        ideaData.offerTiers.backend &&
        ideaData.offerTiers.continuity;
      
      const frameworkDataComplete = ideaData.frameworkData &&
        typeof ideaData.frameworkData === 'object' &&
        ideaData.frameworkData.valueEquation &&
        ideaData.frameworkData.marketMatrix &&
        ideaData.frameworkData.acpFramework;
      
      const keywordDataComplete = ideaData.keywordData &&
        typeof ideaData.keywordData === 'object' &&
        Array.isArray(ideaData.keywordData.fastestGrowing) &&
        ideaData.keywordData.fastestGrowing.length >= 3 &&
        Array.isArray(ideaData.keywordData.highestVolume) &&
        ideaData.keywordData.highestVolume.length >= 3 &&
        Array.isArray(ideaData.keywordData.mostRelevant) &&
        ideaData.keywordData.mostRelevant.length >= 3;
      
      const communitySignalsComplete = ideaData.communitySignals &&
        typeof ideaData.communitySignals === 'object' &&
        ideaData.communitySignals.reddit &&
        ideaData.communitySignals.facebook &&
        ideaData.communitySignals.youtube;
      
      const builderPromptsComplete = ideaData.builderPrompts &&
        typeof ideaData.builderPrompts === 'object' &&
        Object.keys(ideaData.builderPrompts).length >= 4;
      
      console.log(`[Rapid Research] Saving idea with comprehensive fields:`, {
        title: ideaData.title,
        subtitle: ideaData.subtitle,
        comprehensiveFields: {
          offerTiers: {
            present: !!ideaData.offerTiers,
            complete: offerTiersComplete,
            tiers: ideaData.offerTiers ? Object.keys(ideaData.offerTiers).length : 0
          },
          whyNowAnalysis: {
            present: !!ideaData.whyNowAnalysis,
            length: ideaData.whyNowAnalysis ? ideaData.whyNowAnalysis.trim().length : 0,
            complete: !!ideaData.whyNowAnalysis && ideaData.whyNowAnalysis.trim().length > 50
          },
          proofSignals: {
            present: !!ideaData.proofSignals,
            length: ideaData.proofSignals ? ideaData.proofSignals.trim().length : 0,
            complete: !!ideaData.proofSignals && ideaData.proofSignals.trim().length > 50
          },
          marketGap: {
            present: !!ideaData.marketGap,
            length: ideaData.marketGap ? ideaData.marketGap.trim().length : 0,
            complete: !!ideaData.marketGap && ideaData.marketGap.trim().length > 50
          },
          executionPlan: {
            present: !!ideaData.executionPlan,
            length: ideaData.executionPlan ? ideaData.executionPlan.trim().length : 0,
            complete: !!ideaData.executionPlan && ideaData.executionPlan.trim().length > 50
          },
          frameworkData: {
            present: !!ideaData.frameworkData,
            complete: frameworkDataComplete,
            frameworks: ideaData.frameworkData ? Object.keys(ideaData.frameworkData).length : 0
          },
          keywordData: {
            present: !!ideaData.keywordData,
            complete: keywordDataComplete,
            fastestGrowing: ideaData.keywordData?.fastestGrowing?.length || 0,
            highestVolume: ideaData.keywordData?.highestVolume?.length || 0,
            mostRelevant: ideaData.keywordData?.mostRelevant?.length || 0
          },
          communitySignals: {
            present: !!ideaData.communitySignals,
            complete: communitySignalsComplete,
            platforms: ideaData.communitySignals ? Object.keys(ideaData.communitySignals).length : 0
          },
          trendAnalysis: {
            present: !!ideaData.trendAnalysis,
            length: ideaData.trendAnalysis ? ideaData.trendAnalysis.trim().length : 0,
            complete: !!ideaData.trendAnalysis && ideaData.trendAnalysis.trim().length > 50
          },
          builderPrompts: {
            present: !!ideaData.builderPrompts,
            complete: builderPromptsComplete,
            prompts: ideaData.builderPrompts ? Object.keys(ideaData.builderPrompts).length : 0
          },
          signalBadges: {
            present: signalBadges.length > 0,
            count: signalBadges.length,
            badges: signalBadges
          }
        },
        allRequiredFields: {
          title: !!ideaData.title,
          description: !!ideaData.description,
          content: !!ideaData.content,
          type: !!ideaData.type,
          market: !!ideaData.market,
          opportunityScore: ideaData.opportunityScore > 0,
          problemScore: ideaData.problemScore > 0,
          feasibilityScore: ideaData.feasibilityScore > 0,
          timingScore: ideaData.timingScore > 0,
          executionScore: ideaData.executionScore > 0,
          gtmScore: ideaData.gtmScore > 0,
        },
      });
      
      // Warn if critical fields are missing
      const missingComprehensiveFields = [];
      if (!offerTiersComplete) missingComprehensiveFields.push('offerTiers (incomplete)');
      if (!ideaData.whyNowAnalysis || ideaData.whyNowAnalysis.trim().length < 50) missingComprehensiveFields.push('whyNowAnalysis');
      if (!ideaData.proofSignals || ideaData.proofSignals.trim().length < 50) missingComprehensiveFields.push('proofSignals');
      if (!ideaData.marketGap || ideaData.marketGap.trim().length < 50) missingComprehensiveFields.push('marketGap');
      if (!ideaData.executionPlan || ideaData.executionPlan.trim().length < 50) missingComprehensiveFields.push('executionPlan');
      if (!frameworkDataComplete) missingComprehensiveFields.push('frameworkData (incomplete)');
      if (!keywordDataComplete) missingComprehensiveFields.push('keywordData (incomplete)');
      if (!communitySignalsComplete) missingComprehensiveFields.push('communitySignals (incomplete)');
      if (!ideaData.trendAnalysis || ideaData.trendAnalysis.trim().length < 50) missingComprehensiveFields.push('trendAnalysis');
      if (!builderPromptsComplete) missingComprehensiveFields.push('builderPrompts (incomplete)');
      if (signalBadges.length === 0) missingComprehensiveFields.push('signalBadges');
      
      if (missingComprehensiveFields.length > 0) {
        console.warn(`[Rapid Research] ⚠️ Missing or incomplete comprehensive fields: ${missingComprehensiveFields.join(', ')}`);
      } else {
        console.log(`[Rapid Research] ✅ All comprehensive fields present and complete`);
      }
      
      // Validate required fields before saving
      const requiredFields = {
        title: ideaData.title,
        slug: ideaData.slug,
        description: ideaData.description,
        content: ideaData.content,
        type: ideaData.type,
        market: ideaData.market,
        opportunityScore: ideaData.opportunityScore,
        opportunityLabel: ideaData.opportunityLabel,
        problemScore: ideaData.problemScore,
        problemLabel: ideaData.problemLabel,
        feasibilityScore: ideaData.feasibilityScore,
        feasibilityLabel: ideaData.feasibilityLabel,
        timingScore: ideaData.timingScore,
        timingLabel: ideaData.timingLabel,
        executionScore: ideaData.executionScore,
        gtmScore: ideaData.gtmScore,
      };
      
      const missingRequiredFields = Object.entries(requiredFields)
        .filter(([key, value]) => value === undefined || value === null || value === '')
        .map(([key]) => key);
      
      if (missingRequiredFields.length > 0) {
        console.error('[Rapid Research] ❌ Missing required fields:', missingRequiredFields);
        throw new Error(`Missing required fields: ${missingRequiredFields.join(', ')}`);
      }
      
      // Validate types
      if (typeof ideaData.opportunityScore !== 'number' || ideaData.opportunityScore < 1 || ideaData.opportunityScore > 10) {
        console.error('[Rapid Research] ❌ Invalid opportunityScore:', ideaData.opportunityScore);
        throw new Error(`Invalid opportunityScore: ${ideaData.opportunityScore}`);
      }
      
      console.log('[Rapid Research] ✅ All required fields validated, types checked');

      try {
        console.log('[Rapid Research] 💾 Calling storage.createIdea()...');
        const createdIdea = await storage.createIdea(ideaData);
        console.log(`[Rapid Research] ✅✅✅ IDEA SAVED SUCCESSFULLY ✅✅✅`);
        console.log(`[Rapid Research] Idea ID: ${createdIdea.id}`);
        console.log(`[Rapid Research] Idea Title: ${createdIdea.title}`);
        console.log(`[Rapid Research] Idea Slug: ${createdIdea.slug}`);
        console.log(`[Rapid Research] Created At: ${createdIdea.createdAt}`);

        // For rapid mode, fetch image asynchronously after saving (don't block response)
        // This saves 10-30 seconds on the initial response time
        aiService.searchAppImage(createdIdea.title, createdIdea.description)
          .then(url => {
            if (url) {
              storage.updateIdea(createdIdea.id, { imageUrl: url });
              console.log(`[Rapid Research] Image URL updated asynchronously for idea ${createdIdea.id}`);
            }
          })
          .catch(err => console.error(`[Rapid Research] Async image search failed (non-critical) for ${createdIdea.id}:`, err));
        
        console.log('[Rapid Research] 📤 Sending response to client...');
        console.log('[Rapid Research] Response will contain:', {
          id: createdIdea.id,
          slug: createdIdea.slug,
          title: createdIdea.title,
          hasSlug: !!createdIdea.slug,
          type: typeof createdIdea
        });
        // CRITICAL: Verify we're returning an idea, not a report
        if (!createdIdea.slug) {
          console.error('[Rapid Research] ❌❌❌ ERROR: createdIdea has no slug! ❌❌❌');
          console.error('[Rapid Research] createdIdea keys:', Object.keys(createdIdea || {}));
          throw new Error('Created idea missing slug - cannot return invalid idea');
        }
        // Return the created idea
        res.json(createdIdea);
        console.log('[Rapid Research] ✅ Response sent successfully');
        console.log('[Rapid Research] Response object keys:', Object.keys(createdIdea || {}));
      } catch (saveError: any) {
        console.error(`[Rapid Research] ❌❌❌ FAILED TO SAVE IDEA ❌❌❌`);
        console.error(`[Rapid Research] Save error type:`, saveError?.constructor?.name);
        console.error(`[Rapid Research] Save error message:`, saveError?.message);
        console.error(`[Rapid Research] Save error code:`, saveError?.code);
        console.error(`[Rapid Research] Save error detail:`, saveError?.detail);
        console.error(`[Rapid Research] Save error constraint:`, saveError?.constraint);
        console.error(`[Rapid Research] Save error table:`, saveError?.table);
        console.error(`[Rapid Research] Save error column:`, saveError?.column);
        console.error(`[Rapid Research] Full error:`, JSON.stringify(saveError, Object.getOwnPropertyNames(saveError), 2));
        
        // Handle specific database errors
        if (saveError?.code === '23505') { // Unique constraint violation
          console.error(`[Rapid Research] Unique constraint violation - slug may already exist: ${ideaData.slug}`);
        } else if (saveError?.code === '23503') { // Foreign key violation
          console.error(`[Rapid Research] Foreign key violation - user may not exist: ${userId}`);
        } else if (saveError?.code === '23502') { // Not null violation
          console.error(`[Rapid Research] Not null violation - column: ${saveError?.column}`);
        } else if (saveError?.code === '42804') { // Type mismatch
          console.error(`[Rapid Research] Type mismatch - column: ${saveError?.column}`);
        }
        
        logErrorToFile(saveError, 'Rapid Research Save');
        throw saveError;
      }
    } catch (error) {
      console.error('[Rapid Research] ❌❌❌ OUTER CATCH BLOCK - ERROR ❌❌❌');
      console.error('[Rapid Research] Error type:', error?.constructor?.name);
      console.error('[Rapid Research] Error message:', error instanceof Error ? error.message : String(error));
      console.error('[Rapid Research] Error stack:', error instanceof Error ? error.stack : undefined);
      logErrorToFile(error, 'Rapid Research Endpoint');
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      // Provide more specific error messages
      let userMessage = "Failed to generate rapid research";
      if (errorMessage.includes('API key') || errorMessage.includes('authentication')) {
        userMessage = "AI service authentication error. Please check API configuration.";
      } else if (errorMessage.includes('timeout') || errorMessage.includes('time')) {
        userMessage = "Request timed out. Please try again with a simpler request.";
      } else if (errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
        userMessage = "AI service rate limit exceeded. Please try again later.";
      } else if (errorMessage.includes('parse') || errorMessage.includes('JSON')) {
        userMessage = "Error parsing AI response. Please try again.";
      }
      
      // CRITICAL: Make sure we're not returning a report object on error
      console.error('[Rapid Research] ❌ Sending error response (NOT a report object)');
      res.status(500).json({
        message: userMessage,
        error: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      });
    }
  });

  // Roast Idea - Get brutally honest feedback from different perspectives
  app.post('/api/ai/roast-idea', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      // Validate request body
      const roastSchema = z.object({
        ideaId: z.string().optional(),
        ideaTitle: z.string().min(1),
        ideaDescription: z.string().min(1),
        market: z.string().optional(),
        type: z.string().optional(),
        targetAudience: z.string().optional(),
        intensity: z.enum(['gentle', 'moderate', 'tough', 'savage']),
        perspective: z.enum(['vc', 'technical', 'competitor', 'customer']),
      });

      const params = roastSchema.parse(req.body);

      console.log(`User ${userId} roasting idea: ${params.ideaTitle} (${params.intensity}/${params.perspective})`);

      // Generate roast using AI service
      const roast = await aiService.generateRoast({
        ideaTitle: params.ideaTitle,
        ideaDescription: params.ideaDescription,
        market: params.market,
        type: params.type,
        targetAudience: params.targetAudience,
        intensity: params.intensity,
        perspective: params.perspective,
      });

      res.json(roast);
    } catch (error) {
      console.error("Error generating roast:", error);
      res.status(500).json({
        message: "Failed to generate roast",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Market Deep Research - AI-powered market analysis
  app.post('/api/ai/market-deep-research', async (req, res) => {
    try {
      const marketSchema = z.object({
        topic: z.string().min(1),
        description: z.string().min(1),
        category: z.string().optional(),
      });

      const params = marketSchema.parse(req.body);

      console.log(`Generating deep market research for: ${params.topic}`);

      // Use Claude to generate comprehensive market insights
      const response = await anthropic.messages.create({
        model: "claude-opus-4-5-20251101",
        max_tokens: 4000,
        messages: [{
          role: "user",
          content: `You are a market research expert. Generate comprehensive market insights for the following opportunity:

Topic: ${params.topic}
Description: ${params.description}
Category: ${params.category || 'General'}

Generate a detailed JSON response with the following structure. Be specific and include real-world examples, actual community names, realistic numbers, and actionable insights:

{
  "overview": {
    "summary": "2-3 paragraph detailed market overview",
    "marketSize": "Estimated market size (e.g., '$5.2B in 2024')",
    "growthRate": "Growth rate (e.g., '23% CAGR through 2028')",
    "competitionLevel": "Low/Moderate/High with explanation",
    "entryBarrier": "Low/Medium/High",
    "keyTrends": ["5 specific trends driving this market"],
    "targetAudience": ["5 specific target customer segments"]
  },
  "painPoints": {
    "score": 8,
    "severity": "severe/high/moderate",
    "items": [
      {
        "title": "Pain point name",
        "description": "Detailed description of the problem",
        "severity": "critical/high/moderate",
        "frequency": "How often this is mentioned (e.g., '75% of users report this')",
        "userQuotes": ["2-3 realistic user quotes from forums/communities"],
        "sources": ["r/relevantsubreddit", "Facebook Group Name", "Forum Name"]
      }
    ]
  },
  "solutionGaps": {
    "score": 7,
    "severity": "high/moderate",
    "items": [
      {
        "title": "Gap name",
        "description": "What's missing in current solutions",
        "opportunity": "massive/significant/moderate",
        "existingSolutions": ["Current tools/services"],
        "whyTheyFail": "Why existing solutions fall short",
        "idealSolution": "What the ideal solution would look like"
      }
    ]
  },
  "underservedSegments": {
    "score": 7,
    "segments": [
      {
        "name": "Segment name",
        "size": "Estimated size (e.g., '2.5M users')",
        "description": "Who they are and their specific needs",
        "painIntensity": 8,
        "willingnessToPay": "$X-Y/month",
        "currentAlternatives": "What they use now",
        "opportunity": "How to serve them better"
      }
    ]
  },
  "moneySignals": {
    "score": 8,
    "totalAddressableMarket": "$XB",
    "servicableMarket": "$XM-YM",
    "avgCustomerValue": "$X/year consumer, $Y/year business",
    "signals": [
      {
        "type": "spending/investment/growth/pricing",
        "title": "Signal name",
        "description": "What the signal indicates",
        "evidence": "Specific evidence or source",
        "strength": "strong/moderate/emerging"
      }
    ],
    "revenueModels": ["Viable business models"],
    "pricingBenchmarks": ["Competitor pricing examples"]
  }
}

Include at least:
- 3-4 pain points with real user quotes
- 2-3 solution gaps with specific analysis
- 2-3 underserved segments with sizing
- 4-5 money signals with evidence
- 3-4 revenue model options

Return ONLY valid JSON, no markdown or explanation.`
        }]
      });

      // Parse the response
      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response format');
      }

      // Clean and parse JSON
      let jsonText = content.text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7);
      }
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3);
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3);
      }

      const insights = JSON.parse(jsonText);

      res.json({ insights });
    } catch (error) {
      console.error("Error generating market research:", error);
      res.status(500).json({
        message: "Failed to generate market research",
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

  // Contact submission
  app.post('/api/contact', async (req, res) => {
    try {
      const contactSchema = z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Valid email is required"),
        subject: z.string().min(1, "Subject is required"),
        message: z.string().min(10, "Message must be at least 10 characters"),
      });

      const data = contactSchema.parse(req.body);
      const userId = (req as any).user?.claims?.sub;

      const submission = await storage.createContactSubmission({
        ...data,
        userId,
      });

      res.json({ 
        success: true,
        message: "Your message has been received! We'll get back to you within 24 hours.",
        id: submission.id 
      });
    } catch (error) {
      console.error("Error creating contact submission:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // Research request submission
  app.post('/api/research', isAuthenticated, async (req, res) => {
    try {
      const researchSchema = z.object({
        ideaId: z.string().optional(),
        title: z.string().min(1, "Title is required"),
        description: z.string().min(20, "Description must be at least 20 characters"),
        market: z.string().optional(),
        targetAudience: z.string().optional(),
        researchType: z.string().optional(),
        urgency: z.string().optional(),
        additionalNotes: z.string().optional(),
      });

      const data = researchSchema.parse(req.body);
      const userId = (req as any).user.claims.sub;

      const request = await storage.createResearchRequest({
        ideaId: data.ideaId,
        title: data.title,
        description: data.description,
        industry: data.market,
        targetMarket: data.targetAudience,
        userId,
      });

      res.json({ 
        success: true,
        message: "Research request submitted! We'll begin work within 24 hours.",
        request 
      });
    } catch (error) {
      console.error("Error creating research request:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to submit research request" });
    }
  });

  // Get user's saved research reports
  app.get('/api/research/my-reports', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reports = await storage.getUserResearchReports(userId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching research reports:", error);
      res.status(500).json({ message: "Failed to fetch research reports" });
    }
  });

  // Get a specific research report
  app.get('/api/research/reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const report = await storage.getResearchReportById(id);
      
      if (!report) {
        return res.status(404).json({ message: "Research report not found" });
      }
      
      // Verify user owns the report
      if (report.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error fetching research report:", error);
      res.status(500).json({ message: "Failed to fetch research report" });
    }
  });

  // Delete a research report
  app.delete('/api/research/reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      await storage.deleteResearchReport(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting research report:", error);
      res.status(500).json({ message: "Failed to delete research report" });
    }
  });

  // Get user's research requests
  app.get('/api/research/my-requests', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const requests = await storage.getUserResearchRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching research requests:", error);
      res.status(500).json({ message: "Failed to fetch research requests" });
    }
  });

  // AI Research Agent - 40-step comprehensive analysis
  app.post('/api/ai-research', async (req, res) => {
    try {
      const researchSchema = z.object({
        idea: z.string().min(20, "Idea description must be at least 20 characters"),
        targetMarket: z.string().optional(),
        skills: z.string().optional(),
        budget: z.string().optional(),
      });

      const data = researchSchema.parse(req.body);
      
      // Perform comprehensive AI research
      const result = await aiService.performComprehensiveResearch(data);
      
      res.json(result);
    } catch (error) {
      console.error("Error performing AI research:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to complete research analysis" });
    }
  });

  // Real-time market data endpoints
  
  // Get market validation data for a keyword
  app.get('/api/market/validation', async (req, res) => {
    try {
      const keyword = req.query.keyword as string;
      if (!keyword) {
        return res.status(400).json({ message: "Keyword is required" });
      }
      
      const validation = await externalDataService.getMarketValidation(keyword);
      res.json(validation);
    } catch (error) {
      console.error("Error fetching market validation:", error);
      res.status(500).json({ message: "Failed to fetch market validation data" });
    }
  });

  // Get trend data for a keyword
  app.get('/api/market/trends', async (req, res) => {
    try {
      const keyword = req.query.keyword as string;
      if (!keyword) {
        return res.status(400).json({ message: "Keyword is required" });
      }
      
      const trends = await externalDataService.getTrendData(keyword);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching trend data:", error);
      res.status(500).json({ message: "Failed to fetch trend data" });
    }
  });

  // Get market insights for a topic
  app.get('/api/market/insights', async (req, res) => {
    try {
      const topic = req.query.topic as string;
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }
      
      const insights = await externalDataService.getMarketInsights(topic);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching market insights:", error);
      res.status(500).json({ message: "Failed to fetch market insights" });
    }
  });

  // Search Reddit for a topic
  app.get('/api/market/reddit', async (req, res) => {
    try {
      const query = req.query.query as string;
      const subreddit = req.query.subreddit as string | undefined;
      
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }
      
      const results = await externalDataService.searchReddit(query, subreddit);
      res.json(results);
    } catch (error) {
      console.error("Error searching Reddit:", error);
      res.status(500).json({ message: "Failed to search Reddit" });
    }
  });

  // Get community insights
  app.get('/api/market/community', async (req, res) => {
    try {
      const topic = req.query.topic as string;
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }
      
      const insights = await externalDataService.getCommunityInsights(topic);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching community insights:", error);
      res.status(500).json({ message: "Failed to fetch community insights" });
    }
  });

  // Google Trends - Get trend data for a single keyword
  app.get('/api/google-trends/keyword', async (req, res) => {
    try {
      const keyword = req.query.keyword as string;
      const growth = req.query.growth ? parseInt(req.query.growth as string) : undefined;
      const timeRange = (req.query.timeRange as '30d' | '60d' | '90d' | '6m' | '1y' | 'all') || '1y';
      
      if (!keyword) {
        return res.status(400).json({ message: "Keyword is required" });
      }

      const trendData = await getTrendData(keyword, growth, timeRange);
      res.json(trendData);
    } catch (error) {
      console.error("Error fetching trend data:", error);
      res.status(500).json({ message: "Failed to fetch trend data" });
    }
  });

  // Google Trends - Get trend data for multiple keywords
  app.post('/api/google-trends/batch', async (req, res) => {
    try {
      const { keywords } = req.body;
      if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({ message: "Keywords array is required" });
      }

      // Limit to 10 keywords to avoid rate limiting
      const limitedKeywords = keywords.slice(0, 10);
      const trendsMap = await getMultipleTrends(limitedKeywords);
      
      // Convert Map to object for JSON response
      const result: Record<string, any> = {};
      trendsMap.forEach((value, key) => {
        result[key] = value;
      });

      res.json(result);
    } catch (error) {
      console.error("Error fetching batch Google Trends data:", error);
      res.status(500).json({ message: "Failed to fetch trend data" });
    }
  });

  // Google Trends - Get related queries for a keyword
  app.get('/api/google-trends/related', async (req, res) => {
    try {
      const keyword = req.query.keyword as string;
      if (!keyword) {
        return res.status(400).json({ message: "Keyword is required" });
      }

      const relatedQueries = await getRelatedQueries(keyword);
      res.json({ keyword, relatedQueries });
    } catch (error) {
      console.error("Error fetching related queries:", error);
      res.status(500).json({ message: "Failed to fetch related queries" });
    }
  });

  // AI Idea Generator - Personalized idea generation
  app.post('/api/generate-ideas', async (req, res) => {
    try {
      const generatorSchema = z.object({
        skills: z.string().min(10, "Please describe your skills"),
        budget: z.string().optional(),
        timeCommitment: z.string().optional(),
        industryInterests: z.string().optional(),
        experience: z.string().optional(),
      });

      const data = generatorSchema.parse(req.body);
      
      // Generate personalized ideas
      const result = await aiService.generatePersonalizedIdeas(data);
      
      res.json(result);
    } catch (error) {
      console.error("Error generating ideas:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to generate ideas" });
    }
  });

  // Get FAQ questions
  app.get('/api/faq', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const questions = await storage.getFaqQuestions(category);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching FAQ questions:", error);
      res.status(500).json({ message: "Failed to fetch FAQ questions" });
    }
  });

  // Vote on FAQ helpfulness
  app.post('/api/faq/:id/vote', async (req, res) => {
    try {
      const { id } = req.params;
      const { helpful } = z.object({ helpful: z.boolean() }).parse(req.body);
      
      await storage.voteFaqQuestion(id, helpful);
      res.json({ success: true });
    } catch (error) {
      console.error("Error voting on FAQ:", error);
      res.status(500).json({ message: "Failed to submit vote" });
    }
  });

  // Get tools library
  app.get('/api/tools', async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      const tools = await storage.getTools(category, search);
      res.json(tools);
    } catch (error) {
      console.error("Error fetching tools:", error);
      res.status(500).json({ message: "Failed to fetch tools" });
    }
  });

  // Toggle tool favorite
  app.post('/api/tools/:id/favorite', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.claims.sub;
      
      const isFavorite = await storage.toggleToolFavorite(userId, id);
      res.json({ success: true, isFavorite });
    } catch (error) {
      console.error("Error toggling tool favorite:", error);
      res.status(500).json({ message: "Failed to update favorite" });
    }
  });

  // Get user's favorite tools
  app.get('/api/tools/favorites', isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const tools = await storage.getUserFavoriteTools(userId);
      res.json(tools);
    } catch (error) {
      console.error("Error fetching favorite tools:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // External data integration routes

  // Get real trend data for a keyword
  app.get('/api/external/trend', async (req, res) => {
    try {
      // Support both query parameter and path parameter for backward compatibility
      const keyword = (req.query.keyword as string) || req.params.keyword;
      if (!keyword) {
        return res.status(400).json({ message: "Keyword parameter is required" });
      }
      const decodedKeyword = decodeURIComponent(keyword);
      const trendData = await externalDataService.getTrendData(decodedKeyword);
      res.json(trendData);
    } catch (error) {
      console.error("Error fetching trend data:", error);
      res.status(500).json({ message: "Failed to fetch trend data" });
    }
  });

  // Get market insights for a topic
  app.get('/api/external/insights/:topic', async (req, res) => {
    try {
      const { topic } = req.params;
      const insights = await externalDataService.getMarketInsights(topic);
      res.json(insights);
    } catch (error) {
      console.error("Error fetching market insights:", error);
      res.status(500).json({ message: "Failed to fetch market insights" });
    }
  });

  // Get detailed explanation for optimistic analysis
  app.get('/api/external/score-details/:scoreType', async (req, res) => {
    try {
      const { scoreType } = req.params;
      const { score, context } = req.query;
      
      const scoreNum = parseInt(score as string);
      if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 10) {
        return res.status(400).json({ message: "Invalid score value" });
      }

      const details = await externalDataService.getOpportunityScoreDetails(
        scoreType as any,
        scoreNum,
        context as string
      );
      res.json(details);
    } catch (error) {
      console.error("Error fetching score details:", error);
      res.status(500).json({ message: "Failed to fetch score details" });
    }
  });

  // Generate Builder Prompts on-demand
  app.post('/api/ai/generate-build-prompts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      // Validate request body
      const promptsSchema = z.object({
        ideaId: z.string().optional(),
        ideaTitle: z.string().min(1),
        ideaDescription: z.string().min(1),
        type: z.string().optional(),
        market: z.string().optional(),
        targetAudience: z.string().optional(),
      });

      const params = promptsSchema.parse(req.body);

      console.log(`User ${userId} generating builder prompts for: ${params.ideaTitle}`);

      // Generate builder prompts using AI service
      const builderPrompts = await aiService.generateBuilderPrompts(params);

      // If ideaId is provided, save the prompts to the idea
      if (params.ideaId) {
        await storage.updateIdea(params.ideaId, { builderPrompts });
        console.log(`Builder prompts saved to idea ${params.ideaId}`);
      }

      res.json(builderPrompts);
    } catch (error) {
      console.error("Error generating builder prompts:", error);
      res.status(500).json({
        message: "Failed to generate builder prompts",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Claude AI building prompts - Interactive chat
  app.post('/api/ai/build-chat', isAuthenticated, async (req, res) => {
    try {
      const { messages, ideaContext } = req.body;

      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({ message: "Anthropic API key not configured" });
      }

      // System prompt for building assistance
      const systemPrompt = `You are an expert startup builder and technical architect. Help the user build their startup idea with practical, actionable guidance.

${ideaContext ? `Context: The user is working on the following idea:
${JSON.stringify(ideaContext, null, 2)}

Use this context to provide specific, tailored advice.` : ''}

Provide:
- Concrete technical recommendations
- Step-by-step implementation guidance
- Best practices and common pitfalls
- Tool and framework suggestions
- Code examples when relevant
- Resource recommendations

Be practical, encouraging, and focus on helping them make real progress.`;

      const response = await anthropic.messages.create({
        model: "claude-opus-4-5-20251101", // Latest Claude model
        max_tokens: 4000,
        system: systemPrompt,
        messages: messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      });

      const assistantMessage = response.content[0];
      res.json({
        role: 'assistant',
        content: assistantMessage.type === 'text' ? assistantMessage.text : ''
      });
    } catch (error) {
      console.error("Error in Claude chat:", error);
      res.status(500).json({ message: "Failed to get AI response" });
    }
  });

  // Helper: Sleep/delay function
  function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Helper: Retry with exponential backoff
  async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts: number,
    delays: number[]
  ): Promise<T> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        if (attempt === maxAttempts - 1) throw error;
        
        // Handle 529 Overloaded errors with much longer backoff
        if (error?.status === 529 || error?.error?.error?.type === 'overloaded_error') {
          const delay = delays[attempt] || 30000; // Default 30 seconds for overloaded
          await sleep(delay);
          continue;
        }
        
        // Handle rate limit errors (429)
        if (error?.status === 429 || error?.message?.includes('rate limit')) {
          const delay = delays[attempt] || 10000; // Default 10 seconds for rate limit
          await sleep(delay);
          continue;
        }
        
        // Handle connection timeouts
        if (error?.code === 'ETIMEDOUT' || error?.cause?.code === 'ETIMEDOUT') {
          const delay = delays[attempt] || 5000; // Default 5 seconds for timeout
          await sleep(delay);
          continue;
        }
        
        // For other errors, retry with delay
        if (attempt < maxAttempts - 1) {
          await sleep(delays[attempt] || 2000);
        } else {
          throw error;
        }
      }
    }
    throw new Error('Max attempts reached');
  }

  // Helper: Limit concurrency
  async function limitConcurrency<T>(
    promises: Promise<T>[],
    limit: number
  ): Promise<PromiseSettledResult<T>[]> {
    const results: PromiseSettledResult<T>[] = [];
    
    for (let i = 0; i < promises.length; i += limit) {
      const batch = promises.slice(i, i + limit);
      const batchResults = await Promise.allSettled(batch);
      results.push(...batchResults);
    }
    
    return results;
  }

  // Background processing function for bulk import
  async function processBulkImport(jobId: string, fileBuffer: Buffer, userId: string, filename?: string) {
    // Optimized settings for Sonnet 4 - faster model allows higher concurrency
    const batchSize = 20; // Keep same batch size
    const aiConcurrency = 4; // Increased from 2 to 4 (Sonnet handles more concurrent requests)
    const delayBetweenBatches = 3000; // Reduced from 5000 to 3000ms (Sonnet is faster)
    const delayBetweenItems = 1000; // Reduced from 2000 to 1000ms (faster processing)
    
    const jobStartTime = Date.now();
    console.log(`[Bulk Import ${jobId}] 🚀 Starting bulk import at ${new Date().toISOString()}`);
    
    try {
      // Parse spreadsheet
      const parseStartTime = Date.now();
      const rows = await spreadsheetParser.parse(fileBuffer, filename);
      const parseDuration = Date.now() - parseStartTime;
      console.log(`[Bulk Import ${jobId}] 📊 Parsed ${rows.length} rows in ${parseDuration}ms`);
      await storage.updateImportJob(jobId, { totalRows: rows.length });
      
      const existingSlugs = new Set<string>();
      const results: string[] = [];
      const errors: Array<{row: number, error: string}> = [];
      
      // Process in batches
      for (let i = 0; i < rows.length; i += batchSize) {
        const batchStartTime = Date.now();
        const batchNumber = Math.floor(i/batchSize) + 1;
        const batch = rows.slice(i, i + batchSize);
        console.log(`[Bulk Import ${jobId}] 📦 Batch ${batchNumber}/${Math.ceil(rows.length/batchSize)}: Processing rows ${i+1}-${Math.min(i+batchSize, rows.length)}`);
        
        // Process batch with concurrency limit AND delay between items
        const batchPromises = batch.map(async (row, batchIndex) => {
          const rowNumber = i + batchIndex + 1;
          const rowStartTime = Date.now();
          
          // Add delay between items to avoid overwhelming API
          if (batchIndex > 0) {
            await sleep(delayBetweenItems);
          }
          
          try {
            // Extract and validate data
            const mappingStartTime = Date.now();
            const mappedData = await spreadsheetMapper.mapRow(row);
            const mappingDuration = Date.now() - mappingStartTime;
            console.log(`[Bulk Import ${jobId}] Row ${rowNumber}: ✅ Mapped in ${mappingDuration}ms | Title: "${(mappedData.title || 'N/A').substring(0, 40)}" | URL: ${mappedData.previewUrl ? '✓' : '✗'}`);
            
            // Validate mapped data
            const validation = spreadsheetMapper.validateMappedData(mappedData);
            if (!validation.valid) {
              throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }
            
            // Generate unique slug - use title if available, otherwise extract from URL or use timestamp
            const slugStartTime = Date.now();
            const slugBase = mappedData.title || 
              mappedData.previewUrl?.split('/').pop()?.split('?')[0] || 
              `idea-${Date.now()}`;
            const slug = await slugService.generateUniqueSlug(
              slugBase,
              existingSlugs
            );
            const slugDuration = Date.now() - slugStartTime;
            console.log(`[Bulk Import ${jobId}] Row ${rowNumber}: 🔗 Slug generated in ${slugDuration}ms: "${slug}"`);
            
            // AI generation with retry (handles 529 errors and timeouts with longer backoff)
            const aiStartTime = Date.now();
            console.log(`[Bulk Import ${jobId}] Row ${rowNumber}: 🤖 Starting AI generation...`);
            const generatedIdea = await retryWithBackoff(
              () => aiService.generateIdeaFromSpreadsheetRow(mappedData),
              5, // Increased attempts from 3 to 5
              [5000, 10000, 30000, 60000, 120000] // Much longer delays, especially for 529 errors
            );
            const aiDuration = Date.now() - aiStartTime;
            console.log(`[Bulk Import ${jobId}] Row ${rowNumber}: ✅ AI complete in ${aiDuration}ms (${(aiDuration/1000).toFixed(1)}s) | Title: "${generatedIdea.title?.substring(0, 40)}"`);
            
            // Enrich with comprehensive analysis to ensure accurate metrics, scores, and community signals
            let enrichedIdea = generatedIdea;
            try {
              const enrichStartTime = Date.now();
              console.log(`[Bulk Import ${jobId}] Row ${rowNumber}: 🔄 Enriching with comprehensive analysis...`);
              const enrichedData = await aiService.enrichIdeaWithComprehensiveAnalysis({
                title: generatedIdea.title,
                description: generatedIdea.description,
                content: generatedIdea.content,
                type: generatedIdea.type,
                market: generatedIdea.market,
                targetAudience: generatedIdea.targetAudience,
                keyword: generatedIdea.keyword,
              });
              
              // Merge: generated idea takes precedence, enriched fills gaps
              enrichedIdea = {
                ...enrichedData,
                ...generatedIdea, // Generated data overrides enriched defaults
                // Ensure comprehensive fields use enriched if missing from generated
                offerTiers: generatedIdea.offerTiers || enrichedData.offerTiers,
                whyNowAnalysis: generatedIdea.whyNowAnalysis || enrichedData.whyNowAnalysis,
                proofSignals: generatedIdea.proofSignals || enrichedData.proofSignals,
                marketGap: generatedIdea.marketGap || enrichedData.marketGap,
                executionPlan: generatedIdea.executionPlan || enrichedData.executionPlan,
                frameworkData: generatedIdea.frameworkData || enrichedData.frameworkData,
                keywordData: generatedIdea.keywordData || enrichedData.keywordData,
                communitySignals: generatedIdea.communitySignals || enrichedData.communitySignals,
                trendAnalysis: generatedIdea.trendAnalysis || enrichedData.trendAnalysis,
                signalBadges: generatedIdea.signalBadges || enrichedData.signalBadges,
              };
              
              const enrichDuration = Date.now() - enrichStartTime;
              console.log(`[Bulk Import ${jobId}] Row ${rowNumber}: ✅ Enrichment complete in ${enrichDuration}ms (${(enrichDuration/1000).toFixed(1)}s)`);
            } catch (enrichError) {
              console.error(`[Bulk Import ${jobId}] Row ${rowNumber}: ⚠️ Enrichment failed, using generated idea without enrichment:`, enrichError);
              // Continue with generated idea if enrichment fails
            }
            
            // Validate and create idea
            const dbStartTime = Date.now();
            const ideaData = {
              ...enrichedIdea,
              slug,
              createdBy: userId,
              previewUrl: mappedData.previewUrl || null,
              imageUrl: mappedData.imageUrl || null, // From spreadsheet or null
              sourceType: 'user_import' as const,
              sourceData: JSON.stringify(row), // Store original row data
            };
            
            const createdIdea = await storage.createIdea(ideaData);
            const dbDuration = Date.now() - dbStartTime;
            console.log(`[Bulk Import ${jobId}] Row ${rowNumber}: 💾 Saved to DB in ${dbDuration}ms | ID: ${createdIdea.id}`);
            
            results.push(createdIdea.id);
            
            const rowDuration = Date.now() - rowStartTime;
            console.log(`[Bulk Import ${jobId}] Row ${rowNumber}: ✅✅ SUCCESS in ${rowDuration}ms (${(rowDuration/1000).toFixed(1)}s) | Progress: ${results.length}/${rows.length} successful`);
            
            // Update progress
            await storage.updateImportJob(jobId, {
              processedRows: rowNumber,
              successfulRows: results.length,
            });
            
          } catch (error: any) {
            const rowDuration = Date.now() - rowStartTime;
            const errorMessage = error.message || 'Unknown error';
            const errorType = error?.status === 529 ? 'OVERLOADED' : 
                            error?.status === 429 ? 'RATE_LIMIT' :
                            error?.code === 'ETIMEDOUT' ? 'TIMEOUT' : 'ERROR';
            
            console.error(`[Bulk Import ${jobId}] Row ${rowNumber}: ❌❌ FAILED in ${rowDuration}ms (${(rowDuration/1000).toFixed(1)}s) | ${errorType} | ${errorMessage.substring(0, 100)}`);
            
            errors.push({
              row: rowNumber,
              error: errorMessage
            });
            
            await storage.updateImportJob(jobId, {
              processedRows: rowNumber,
              failedRows: errors.length,
              errors: errors,
            });
          }
        });
        
        // Wait for batch with concurrency limit
        await limitConcurrency(batchPromises, aiConcurrency);
        
        const batchDuration = Date.now() - batchStartTime;
        const batchSuccessRate = ((results.length / (results.length + errors.length)) * 100).toFixed(1);
        console.log(`[Bulk Import ${jobId}] 📦 Batch ${batchNumber} complete in ${batchDuration}ms (${(batchDuration/1000).toFixed(1)}s) | ✅ ${results.length} successful | ❌ ${errors.length} failed | Success rate: ${batchSuccessRate}%`);
        
        // Delay between batches
        if (i + batchSize < rows.length) {
          console.log(`[Bulk Import ${jobId}] ⏳ Waiting ${delayBetweenBatches}ms before next batch...`);
          await sleep(delayBetweenBatches);
        }
      }
      
      const totalDuration = Date.now() - jobStartTime;
      const totalSuccessRate = ((results.length / rows.length) * 100).toFixed(1);
      console.log(`[Bulk Import ${jobId}] 🎉🎉 COMPLETED in ${totalDuration}ms (${(totalDuration/1000/60).toFixed(1)} minutes) | ✅ ${results.length}/${rows.length} successful (${totalSuccessRate}%) | ❌ ${errors.length} failed`);
      
      // Mark job as completed
      await storage.updateImportJob(jobId, {
        status: 'completed',
        completedAt: new Date(),
        results: results,
        errors: errors,
      });
      
    } catch (error: any) {
      const totalDuration = Date.now() - jobStartTime;
      console.error(`[Bulk Import ${jobId}] 💥💥 JOB FAILED after ${totalDuration}ms:`, error);
      await storage.updateImportJob(jobId, {
        status: 'failed',
        completedAt: new Date(),
        errors: [{ row: 0, error: error.message || 'Unknown error' }],
      });
    }
  }

  // Bulk import endpoint
  app.post('/api/ideas/bulk-import', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Validate file type
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const fileExtension = file.originalname?.toLowerCase().match(/\.[^.]+$/)?.[0];
      if (!fileExtension || !validExtensions.includes(fileExtension)) {
        return res.status(400).json({ 
          message: `Invalid file type. Supported formats: ${validExtensions.join(', ')}` 
        });
      }
      
      // Create job record
      const job = await storage.createImportJob({
        userId,
        status: 'processing',
        totalRows: 0, // Will be updated after parsing
      });
      
      // Start background processing (don't await)
      processBulkImport(job.id, file.buffer, userId, file.originalname).catch(error => {
        console.error(`[Bulk Import] Job ${job.id} failed:`, error);
        storage.updateImportJob(job.id, {
          status: 'failed',
          completedAt: new Date(),
        });
      });
      
      // Return job ID immediately
      res.json({ jobId: job.id, status: 'processing' });
    } catch (error: any) {
      console.error("Error starting bulk import:", error);
      res.status(500).json({ message: "Failed to start bulk import", error: error.message });
    }
  });

  // Get job status endpoint
  app.get('/api/import-jobs/:jobId', isAuthenticated, async (req: any, res) => {
    try {
      const job = await storage.getImportJob(req.params.jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Verify user owns the job
      if (job.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(job);
    } catch (error: any) {
      console.error("Error fetching import job:", error);
      res.status(500).json({ message: "Failed to fetch import job" });
    }
  });

  // Bulk image generation endpoint
  app.post('/api/ideas/bulk-generate-images', isAuthenticated, async (req: any, res) => {
    try {
      const { batchSize = 50, delay = 2000, limit } = req.body;
      
      // Start background processing (don't await)
      if (limit) {
        imageProcessor.processLimited(limit, batchSize, delay).catch(error => {
          console.error('[Bulk Image Generation] Failed:', error);
        });
        res.json({ 
          message: `Started processing ${limit} ideas for images`,
          batchSize,
          delay 
        });
      } else {
        imageProcessor.processAll(batchSize, delay).catch(error => {
          console.error('[Bulk Image Generation] Failed:', error);
        });
        res.json({ 
          message: 'Started processing all ideas without images',
          batchSize,
          delay 
        });
      }
    } catch (error: any) {
      console.error("Error starting bulk image generation:", error);
      res.status(500).json({ message: "Failed to start image generation", error: error.message });
    }
  });

  // Add missing database columns (works with current deployment)
  app.post('/api/admin/add-missing-columns', async (req: any, res) => {
    try {
      // Simple token check
      const token = req.query?.token || req.body?.token;
      if (token !== 'iotd-fix-2024') {
        return res.status(401).json({ message: "Invalid token" });
      }

      console.log("[Add Columns] Starting to add missing columns...");
      
      // Use the pool directly from db.ts - it's already connected to Render's database
      const { pool } = await import('./db.js');
      const client = await pool.connect();
      
      const columns = [
        { name: 'preview_url', type: 'VARCHAR' },
        { name: 'offer_tiers', type: 'JSONB' },
        { name: 'why_now_analysis', type: 'TEXT' },
        { name: 'proof_signals', type: 'TEXT' },
        { name: 'market_gap', type: 'TEXT' },
        { name: 'execution_plan', type: 'TEXT' },
        { name: 'framework_data', type: 'JSONB' },
        { name: 'trend_analysis', type: 'TEXT' },
        { name: 'keyword_data', type: 'JSONB' },
        { name: 'builder_prompts', type: 'JSONB' },
        { name: 'community_signals', type: 'JSONB' },
        { name: 'signal_badges', type: 'TEXT[]' },
      ];
      
      const results = { added: [], existing: [], errors: [] };
      
      try {
        for (const col of columns) {
          try {
            const checkQuery = `SELECT column_name FROM information_schema.columns WHERE table_name = 'ideas' AND column_name = $1`;
            const check = await client.query(checkQuery, [col.name]);
            
            if (check.rows.length === 0) {
              await client.query(`ALTER TABLE ideas ADD COLUMN ${col.name} ${col.type}`);
              results.added.push(col.name);
              console.log(`[Add Columns] ✅ Added: ${col.name}`);
            } else {
              results.existing.push(col.name);
              console.log(`[Add Columns] ✓ Already exists: ${col.name}`);
            }
          } catch (error: any) {
            results.errors.push({ column: col.name, error: error.message });
            console.error(`[Add Columns] ❌ Error adding ${col.name}:`, error.message);
          }
        }
      } finally {
        client.release();
      }
      
      console.log(`[Add Columns] Complete: ${results.added.length} added, ${results.existing.length} existing, ${results.errors.length} errors`);
      
      res.json({
        success: true,
        message: `Added ${results.added.length} columns, ${results.existing.length} already existed`,
        added: results.added,
        existing: results.existing,
        errors: results.errors
      });
    } catch (error: any) {
      console.error("[Add Columns] Fatal error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to add columns",
        error: error.message 
      });
    }
  });

  // Export all ideas to JSON
  app.get('/api/admin/export-ideas', async (req: any, res) => {
    try {
      // In production, require auth and explicit flag
      if (process.env.NODE_ENV === 'production') {
        // Check auth
        if (!req.user) {
          return res.status(401).json({ message: "Authentication required" });
        }
        // Check flag
        if (!process.env.ALLOW_BULK_EXPORT) {
          return res.status(403).json({ 
            message: "Bulk export is disabled in production. Set ALLOW_BULK_EXPORT=true to enable." 
          });
        }
      }
      // In development, allow without auth for easier testing

      console.log("[Bulk Export] Starting export...");
      
      // Get all ideas (including unpublished)
      const allIdeas = await db.select().from(ideas);
      console.log(`[Bulk Export] Found ${allIdeas.length} ideas`);
      
      // Get all tags
      const allTags = await db.select().from(tags);
      console.log(`[Bulk Export] Found ${allTags.length} tags`);
      
      // Get all idea-tag relationships
      const allIdeaTags = await db.select().from(ideaTags);
      console.log(`[Bulk Export] Found ${allIdeaTags.length} idea-tag relationships`);
      
      // Get all community signals
      const allSignals = await db.select().from(communitySignals);
      console.log(`[Bulk Export] Found ${allSignals.length} community signals`);
      
      // Build export data structure
      const exportData = {
        exportedAt: new Date().toISOString(),
        totalIdeas: allIdeas.length,
        ideas: allIdeas.map(idea => {
          // Get tags for this idea
          const ideaTagIds = allIdeaTags
            .filter(it => it.ideaId === idea.id)
            .map(it => it.tagId);
          const ideaTags = allTags
            .filter(t => ideaTagIds.includes(t.id))
            .map(t => ({ id: t.id, name: t.name, color: t.color }));
          
          // Get community signals for this idea
          const ideaSignals = allSignals
            .filter(s => s.ideaId === idea.id)
            .map(s => ({
              platform: s.platform,
              signalType: s.signalType,
              name: s.name,
              memberCount: s.memberCount,
              engagementScore: s.engagementScore,
              url: s.url,
              description: s.description,
            }));
          
          return {
            ...idea,
            tags: ideaTags,
            communitySignals: ideaSignals,
          };
        }),
        tags: allTags,
      };
      
      console.log(`[Bulk Export] Export complete: ${allIdeas.length} ideas`);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="ideas-export-${Date.now()}.json"`);
      res.json(exportData);
    } catch (error: any) {
      console.error("Error exporting ideas:", error);
      res.status(500).json({ 
        message: "Failed to export ideas",
        error: error.message 
      });
    }
  });

  // Fix database schema (add missing columns)
  app.post('/api/admin/fix-schema', async (req: any, res) => {
    try {
      // One-time token for schema fix
      const SCHEMA_FIX_TOKEN = 'iotd-schema-fix-2024-12-17';
      const providedToken = req.query?.token || req.headers['x-schema-token'] || req.body?.token;
      
      if (process.env.NODE_ENV === 'production') {
        const hasValidToken = providedToken === SCHEMA_FIX_TOKEN;
        const hasAuth = !!req.user;
        
        if (!hasValidToken && !hasAuth) {
          return res.status(401).json({ message: "Authentication or token required" });
        }
      }
      
      console.log("[Schema Fix] Starting manual schema fix...");
      
      // Import and run the schema fix logic inline
      const pg = await import('pg');
      const { Pool } = pg.default;
      
      if (!process.env.DATABASE_URL) {
        return res.status(500).json({ message: "DATABASE_URL not set" });
      }
      
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
      
      const columnsToAdd = [
        { name: 'preview_url', type: 'VARCHAR' },
        { name: 'offer_tiers', type: 'JSONB' },
        { name: 'why_now_analysis', type: 'TEXT' },
        { name: 'proof_signals', type: 'TEXT' },
        { name: 'market_gap', type: 'TEXT' },
        { name: 'execution_plan', type: 'TEXT' },
        { name: 'framework_data', type: 'JSONB' },
        { name: 'trend_analysis', type: 'TEXT' },
        { name: 'keyword_data', type: 'JSONB' },
        { name: 'builder_prompts', type: 'JSONB' },
        { name: 'community_signals', type: 'JSONB' },
        { name: 'signal_badges', type: 'TEXT[]' },
      ];
      
      const client = await pool.connect();
      const results = { added: [], existing: [], errors: [] };
      
      try {
        for (const col of columnsToAdd) {
          try {
            const checkQuery = `
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = 'ideas' AND column_name = $1;
            `;
            const result = await client.query(checkQuery, [col.name]);
            
            if (result.rows.length === 0) {
              await client.query(`ALTER TABLE ideas ADD COLUMN ${col.name} ${col.type};`);
              results.added.push(col.name);
              console.log(`[Schema Fix] Added column: ${col.name}`);
            } else {
              results.existing.push(col.name);
            }
          } catch (error: any) {
            results.errors.push({ column: col.name, error: error.message });
            console.error(`[Schema Fix] Error adding ${col.name}:`, error.message);
          }
        }
      } finally {
        client.release();
        await pool.end();
      }
      
      console.log(`[Schema Fix] Complete: ${results.added.length} added, ${results.existing.length} existing, ${results.errors.length} errors`);
      
      res.json({
        success: true,
        message: `Schema fix complete: ${results.added.length} columns added`,
        added: results.added,
        existing: results.existing,
        errors: results.errors
      });
    } catch (error: any) {
      console.error("[Schema Fix] Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fix schema",
        error: error.message
      });
    }
  });

  // Update first page of ideas with genspark previewUrls from export file (matching reference apps)
  app.post('/api/admin/update-first-page-genspark-preview-urls', upload.single('file'), async (req: any, res) => {
    try {
      const IMPORT_TOKEN = 'iotd-initial-sync-2024-12-17';
      const providedToken = req.query?.importToken || req.headers['x-import-token'] || req.body?.importToken;
      
      if (process.env.NODE_ENV === 'production') {
        const hasValidToken = providedToken === IMPORT_TOKEN;
        const hasAuth = !!req.user;
        
        if (!hasValidToken && !hasAuth) {
          return res.status(401).json({ message: "Authentication or token required" });
        }
      }
      
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileContent = file.buffer.toString('utf-8');
      const exportData = JSON.parse(fileContent);
      
      if (!exportData.ideas || !Array.isArray(exportData.ideas)) {
        return res.status(400).json({ message: "Invalid export file format" });
      }
      
      // Get first page of ideas (50 most recent)
      const firstPageIdeas = await db.select()
        .from(ideas)
        .where(eq(ideas.isPublished, true))
        .orderBy(desc(ideas.createdAt))
        .limit(50);
      
      console.log(`[Update First Page Genspark] Found ${firstPageIdeas.length} ideas on first page`);
      
      // Create a map of slug -> previewUrl from export file (only gensparkspace.com URLs)
      // Exclude genspark.ai URLs as they are CSP blocked and cause errors
      const exportMap = new Map<string, string>();
      for (const ideaData of exportData.ideas) {
        if (ideaData.slug && ideaData.previewUrl) {
          const previewUrl = ideaData.previewUrl;
          // Only include gensparkspace.com URLs (genspark.ai is CSP blocked)
          if (previewUrl.includes('gensparkspace.com')) {
            exportMap.set(ideaData.slug, previewUrl);
          }
        }
      }
      
      console.log(`[Update First Page Genspark] Export file has ${exportMap.size} ideas with gensparkspace.com previewUrl`);
      
      // Also check for genspark.ai URLs that need to be replaced
      let removedGensparkAi = 0;
      const gensparkAiSlugs: string[] = [];
      
      let updatedCount = 0;
      let skippedCount = 0;
      let replacedCount = 0;
      const updatedSlugs: string[] = [];
      
      for (const idea of firstPageIdeas) {
        const currentPreview = idea.previewUrl || '';
        
        // Remove genspark.ai URLs (CSP blocked)
        if (currentPreview.includes('genspark.ai')) {
          const gensparkspaceUrl = exportMap.get(idea.slug);
          if (gensparkspaceUrl) {
            try {
              await db.update(ideas)
                .set({ previewUrl: gensparkspaceUrl })
                .where(eq(ideas.slug, idea.slug));
              removedGensparkAi++;
              gensparkAiSlugs.push(idea.slug);
              updatedCount++;
              updatedSlugs.push(idea.slug);
              console.log(`[Update First Page Genspark] Replaced genspark.ai with gensparkspace.com for ${idea.slug}`);
            } catch (error: any) {
              console.error(`[Update First Page Genspark] Error replacing genspark.ai for ${idea.slug}:`, error.message);
              skippedCount++;
            }
            continue;
          }
        }
        
        const gensparkspacePreviewUrl = exportMap.get(idea.slug);
        
        if (gensparkspacePreviewUrl) {
          // Check if current previewUrl is not a gensparkspace URL or is missing
          const needsUpdate = !currentPreview || !currentPreview.includes('gensparkspace.com');
          
          if (needsUpdate) {
            try {
              await db.update(ideas)
                .set({ previewUrl: gensparkspacePreviewUrl })
                .where(eq(ideas.slug, idea.slug));
              updatedCount++;
              updatedSlugs.push(idea.slug);
              
              if (currentPreview) {
                replacedCount++;
                console.log(`[Update First Page Genspark] Replaced ${idea.slug}: ${currentPreview.substring(0, 50)} -> gensparkspace URL`);
              } else {
                console.log(`[Update First Page Genspark] Added ${idea.slug} with gensparkspace previewUrl`);
              }
              
              if (updatedCount % 10 === 0) {
                console.log(`[Update First Page Genspark] Progress: ${updatedCount} updated`);
              }
            } catch (error: any) {
              console.error(`[Update First Page Genspark] Error updating ${idea.slug}:`, error.message);
              skippedCount++;
            }
          } else {
            skippedCount++;
          }
        } else {
          skippedCount++;
        }
      }
      
      console.log(`[Update First Page Genspark] Complete: ${updatedCount} updated (${replacedCount} replaced, ${removedGensparkAi} genspark.ai removed), ${skippedCount} skipped`);
      
      res.json({
        success: true,
        message: `Updated ${updatedCount} ideas on first page with gensparkspace.com previewUrl (removed ${removedGensparkAi} CSP-blocked genspark.ai URLs)`,
        updated: updatedCount,
        replaced: replacedCount,
        removedGensparkAi: removedGensparkAi,
        skipped: skippedCount,
        updatedSlugs: updatedSlugs.slice(0, 20) // Return first 20 for verification
      });
    } catch (error: any) {
      console.error("[Update First Page] Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update preview URLs",
        error: error.message
      });
    }
  });

  // Update existing ideas with previewUrl from export file
  app.post('/api/admin/update-preview-urls', upload.single('file'), async (req: any, res) => {
    try {
      const IMPORT_TOKEN = 'iotd-initial-sync-2024-12-17';
      const providedToken = req.query?.importToken || req.headers['x-import-token'] || req.body?.importToken;
      
      if (process.env.NODE_ENV === 'production') {
        const hasValidToken = providedToken === IMPORT_TOKEN;
        const hasAuth = !!req.user;
        
        if (!hasValidToken && !hasAuth) {
          return res.status(401).json({ message: "Authentication or token required" });
        }
      }
      
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      const fileContent = file.buffer.toString('utf-8');
      const exportData = JSON.parse(fileContent);
      
      if (!exportData.ideas || !Array.isArray(exportData.ideas)) {
        return res.status(400).json({ message: "Invalid export file format" });
      }
      
      console.log(`[Update Preview URLs] Updating ${exportData.ideas.length} ideas...`);
      
      let updatedCount = 0;
      let skippedCount = 0;
      
      for (const ideaData of exportData.ideas) {
        const { slug, previewUrl } = ideaData;
        
        if (!slug || !previewUrl) {
          skippedCount++;
          continue;
        }
        
        try {
          const [existingIdea] = await db.select().from(ideas).where(eq(ideas.slug, slug));
          
          // Update if idea exists and previewUrl is missing or empty
          if (existingIdea && (!existingIdea.previewUrl || existingIdea.previewUrl.trim() === '')) {
            await db.update(ideas)
              .set({ previewUrl })
              .where(eq(ideas.slug, slug));
            updatedCount++;
            
            if (updatedCount % 100 === 0) {
              console.log(`[Update Preview URLs] Progress: ${updatedCount} updated`);
            }
          } else {
            skippedCount++;
          }
        } catch (error: any) {
          console.error(`[Update Preview URLs] Error updating ${slug}:`, error.message);
          skippedCount++;
        }
      }
      
      console.log(`[Update Preview URLs] Complete: ${updatedCount} updated, ${skippedCount} skipped`);
      
      res.json({
        success: true,
        message: `Updated ${updatedCount} ideas with previewUrl`,
        updated: updatedCount,
        skipped: skippedCount
      });
    } catch (error: any) {
      console.error("[Update Preview URLs] Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update preview URLs",
        error: error.message
      });
    }
  });

  // Update first page ideas using sourceData as previewUrl fallback
  app.post('/api/admin/update-preview-from-sourcedata', async (req: any, res) => {
    try {
      const IMPORT_TOKEN = 'iotd-initial-sync-2024-12-17';
      const providedToken = req.query?.importToken || req.headers['x-import-token'] || req.body?.importToken;
      
      if (process.env.NODE_ENV === 'production') {
        const hasValidToken = providedToken === IMPORT_TOKEN;
        const hasAuth = !!req.user;
        
        if (!hasValidToken && !hasAuth) {
          return res.status(401).json({ message: "Authentication or token required" });
        }
      }
      
      // Get first page of ideas
      const firstPageIdeas = await db.select()
        .from(ideas)
        .where(eq(ideas.isPublished, true))
        .orderBy(desc(ideas.createdAt))
        .limit(50);
      
      let updatedCount = 0;
      const updatedSlugs: string[] = [];
      
      for (const idea of firstPageIdeas) {
        // If no previewUrl but sourceData is a URL, use it
        if (!idea.previewUrl && idea.sourceData) {
          const sourceData = idea.sourceData.trim();
          const isUrl = sourceData.startsWith('http://') || 
                       sourceData.startsWith('https://') ||
                       /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(\/.*)?$/i.test(sourceData);
          
          if (isUrl) {
            const previewUrl = sourceData.startsWith('http') ? sourceData : `https://${sourceData}`;
            try {
              await db.update(ideas)
                .set({ previewUrl })
                .where(eq(ideas.slug, idea.slug));
              updatedCount++;
              updatedSlugs.push(idea.slug);
              console.log(`[Update from sourceData] Updated ${idea.slug}`);
            } catch (error: any) {
              console.error(`[Update from sourceData] Error updating ${idea.slug}:`, error.message);
            }
          }
        }
      }
      
      res.json({
        success: true,
        message: `Updated ${updatedCount} ideas with previewUrl from sourceData`,
        updated: updatedCount,
        updatedSlugs: updatedSlugs.slice(0, 20)
      });
    } catch (error: any) {
      console.error("[Update from sourceData] Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update preview URLs",
        error: error.message
      });
    }
  });

  // Remove genspark.ai previewUrls from first page (CSP blocked)
  app.post('/api/admin/remove-genspark-ai-preview-urls', async (req: any, res) => {
    try {
      const IMPORT_TOKEN = 'iotd-initial-sync-2024-12-17';
      const providedToken = req.query?.importToken || req.headers['x-import-token'] || req.body?.importToken;
      
      if (process.env.NODE_ENV === 'production') {
        const hasValidToken = providedToken === IMPORT_TOKEN;
        const hasAuth = !!req.user;
        
        if (!hasValidToken && !hasAuth) {
          return res.status(401).json({ message: "Authentication or token required" });
        }
      }
      
      // Get first page of ideas
      const firstPageIdeas = await db.select()
        .from(ideas)
        .where(eq(ideas.isPublished, true))
        .orderBy(desc(ideas.createdAt))
        .limit(50);
      
      let removedCount = 0;
      const removedSlugs: string[] = [];
      
      for (const idea of firstPageIdeas) {
        const previewUrl = idea.previewUrl || '';
        if (previewUrl.includes('genspark.ai')) {
          try {
            // Set to null so modal shows fallback message
            await db.update(ideas)
              .set({ previewUrl: null })
              .where(eq(ideas.slug, idea.slug));
            removedCount++;
            removedSlugs.push(idea.slug);
            console.log(`[Remove Genspark AI] Removed CSP-blocked previewUrl from ${idea.slug}`);
          } catch (error: any) {
            console.error(`[Remove Genspark AI] Error removing previewUrl from ${idea.slug}:`, error.message);
          }
        }
      }
      
      res.json({
        success: true,
        message: `Removed ${removedCount} CSP-blocked genspark.ai previewUrls from first page`,
        removed: removedCount,
        removedSlugs: removedSlugs
      });
    } catch (error: any) {
      console.error("[Remove Genspark AI] Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to remove genspark.ai previewUrls",
        error: error.message
      });
    }
  });

  // Update a specific idea's previewUrl
  app.post('/api/admin/update-idea-preview', async (req: any, res) => {
    try {
      const IMPORT_TOKEN = 'iotd-initial-sync-2024-12-17';
      const providedToken = req.query?.importToken || req.headers['x-import-token'] || req.body?.importToken;
      
      if (process.env.NODE_ENV === 'production') {
        const hasValidToken = providedToken === IMPORT_TOKEN;
        const hasAuth = !!req.user;
        
        if (!hasValidToken && !hasAuth) {
          return res.status(401).json({ message: "Authentication or token required" });
        }
      }
      
      const { slug, previewUrl } = req.body;
      
      if (!slug || !previewUrl) {
        return res.status(400).json({ message: "slug and previewUrl are required" });
      }
      
      const [updated] = await db.update(ideas)
        .set({ previewUrl })
        .where(eq(ideas.slug, slug))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ message: "Idea not found" });
      }
      
      res.json({
        success: true,
        message: `Updated previewUrl for ${slug}`,
        idea: updated
      });
    } catch (error: any) {
      console.error("[Update Idea Preview] Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update previewUrl",
        error: error.message
      });
    }
  });

  // Bulk import ideas from JSON export file
  app.post('/api/admin/import-ideas', upload.single('file'), async (req: any, res) => {
    try {
      // One-time import token (for initial data sync)
      const IMPORT_TOKEN = 'iotd-initial-sync-2024-12-17';
      const providedToken = req.query?.importToken || req.headers['x-import-token'] || req.body?.importToken;
      
      // In production, require auth and explicit flag OR one-time token
      if (process.env.NODE_ENV === 'production') {
        const hasValidToken = providedToken === IMPORT_TOKEN;
        const hasAuth = !!req.user;
        const hasFlag = !!process.env.ALLOW_BULK_IMPORT;
        
        // Allow if: (has auth AND has flag) OR (has valid token)
        if (!hasValidToken && (!hasAuth || !hasFlag)) {
          if (!hasAuth) {
            return res.status(401).json({ message: "Authentication required" });
          }
          if (!hasFlag) {
            return res.status(403).json({ 
              message: "Bulk import is disabled in production. Set ALLOW_BULK_IMPORT=true to enable, or use importToken." 
            });
          }
        }
        
        if (hasValidToken) {
          console.log("[Bulk Import] Using one-time import token");
        }
      }
      // In development, allow without auth for easier testing

      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      if (!file.mimetype.includes('json') && !file.originalname.endsWith('.json')) {
        return res.status(400).json({ message: "File must be JSON format" });
      }

      console.log(`[Bulk Import] Received file: ${file.originalname}, size: ${file.size} bytes`);

      // Parse JSON from buffer
      const fileContent = file.buffer.toString('utf-8');
      const exportData = JSON.parse(fileContent);

      if (!exportData.ideas || !Array.isArray(exportData.ideas)) {
        return res.status(400).json({ message: "Invalid export file format" });
      }

      console.log(`[Bulk Import] File contains ${exportData.ideas.length} ideas`);

      // Inline import logic (to avoid build issues with script imports)
      const allTags = await db.select().from(tags);
      const existingTagNames = new Set(allTags.map(t => t.name));
      
      // Import tags first
      if (exportData.tags && Array.isArray(exportData.tags)) {
        const tagsToInsert = exportData.tags.filter((t: any) => !existingTagNames.has(t.name));
        if (tagsToInsert.length > 0) {
          await db.insert(tags).values(tagsToInsert);
          console.log(`[Bulk Import] Imported ${tagsToInsert.length} new tags`);
        }
      }
      
      // Get all tags again (including newly inserted) for mapping
      const allTagsAfter = await db.select().from(tags);
      const tagMap = new Map(allTagsAfter.map(t => [t.name, t.id]));
      
      // Get existing ideas
      const existingIdeas = await db.select().from(ideas);
      const existingSlugs = new Set(existingIdeas.map(i => i.slug));
      const existingRelationships = await db.select().from(ideaTags);
      const existingRelationshipKeys = new Set(
        existingRelationships.map(r => `${r.ideaId}-${r.tagId}`)
      );
      const existingSignals = await db.select().from(communitySignals);
      const existingSignalKeys = new Set(
        existingSignals.map(s => `${s.ideaId}-${s.platform}-${s.name}`)
      );
      
      let importedCount = 0;
      let skippedCount = 0;
      
      // Import ideas
      for (const ideaData of exportData.ideas) {
        const { tags: ideaTagsData, communitySignals: ideaSignalsData, ...ideaFields } = ideaData;
        const { id, createdAt, updatedAt, ...ideaToInsert } = ideaFields;
        
        // Ensure isPublished is true
        ideaToInsert.isPublished = true;
        
        // previewUrl is now included since the column exists
        
        if (existingSlugs.has(ideaToInsert.slug)) {
          skippedCount++;
          continue;
        }
        
        // Insert new idea
        const [insertedIdea] = await db.insert(ideas).values(ideaToInsert).returning();
        importedCount++;
        
        // Import tags for this idea
        if (ideaTagsData && Array.isArray(ideaTagsData) && ideaTagsData.length > 0) {
          const tagRelationships = ideaTagsData
            .map((tag: any) => {
              const tagId = tagMap.get(tag.name);
              return tagId ? { ideaId: insertedIdea.id, tagId } : null;
            })
            .filter((r: any) => r !== null)
            .filter((r: any) => {
              const key = `${r.ideaId}-${r.tagId}`;
              return !existingRelationshipKeys.has(key);
            });
          
          if (tagRelationships.length > 0) {
            await db.insert(ideaTags).values(tagRelationships);
            tagRelationships.forEach((r: any) => {
              existingRelationshipKeys.add(`${r.ideaId}-${r.tagId}`);
            });
          }
        }
        
        // Import community signals
        if (ideaSignalsData && Array.isArray(ideaSignalsData) && ideaSignalsData.length > 0) {
          const signalsToInsert = ideaSignalsData
            .map((signal: any) => ({
              ideaId: insertedIdea.id,
              platform: signal.platform,
              signalType: signal.signalType,
              name: signal.name,
              memberCount: signal.memberCount,
              engagementScore: signal.engagementScore,
              url: signal.url,
              description: signal.description,
            }))
            .filter((signal: any) => {
              const key = `${signal.ideaId}-${signal.platform}-${signal.name}`;
              return !existingSignalKeys.has(key);
            });
          
          if (signalsToInsert.length > 0) {
            await db.insert(communitySignals).values(signalsToInsert);
            signalsToInsert.forEach((s: any) => {
              existingSignalKeys.add(`${s.ideaId}-${s.platform}-${s.name}`);
            });
          }
        }
        
        // Log progress every 50 ideas
        if (importedCount % 50 === 0) {
          console.log(`[Bulk Import] Progress: ${importedCount} imported, ${skippedCount} skipped`);
        }
      }
      
      console.log(`[Bulk Import] Complete: ${importedCount} imported, ${skippedCount} skipped`);
      
      res.json({
        message: "Bulk import completed successfully",
        imported: importedCount,
        skipped: skippedCount,
        updated: 0,
        total: exportData.ideas.length,
      });
    } catch (error: any) {
      console.error("Error bulk importing ideas:", error);
      res.status(500).json({ 
        message: "Failed to bulk import ideas",
        error: error.message 
      });
    }
  });

  // Update preview URL for an idea
  app.put('/api/ideas/:id/preview-url', async (req: any, res) => {
    try {
      const { id } = req.params;
      const { previewUrl } = req.body;
      
      if (!previewUrl || typeof previewUrl !== 'string') {
        return res.status(400).json({ message: "previewUrl is required" });
      }
      
      const [updated] = await db
        .update(ideas)
        .set({ 
          previewUrl: previewUrl.trim(),
          updatedAt: new Date()
        })
        .where(eq(ideas.id, id))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ message: "Idea not found" });
      }
      
      res.json({ 
        message: "Preview URL updated successfully",
        idea: updated 
      });
    } catch (error: any) {
      console.error("Error updating preview URL:", error);
      res.status(500).json({ 
        message: "Failed to update preview URL",
        error: error?.message 
      });
    }
  });

  // Find and update preview URL by old URL pattern
  app.post('/api/admin/update-preview-url', async (req: any, res) => {
    try {
      const { oldUrlPattern, newUrl } = req.body;
      
      if (!oldUrlPattern || !newUrl) {
        return res.status(400).json({ 
          message: "oldUrlPattern and newUrl are required" 
        });
      }
      
      // Get all ideas
      const allIdeas = await db.select().from(ideas);
      
      // Find matching ideas
      const matchingIdeas = allIdeas.filter(idea => 
        (idea.previewUrl && idea.previewUrl.includes(oldUrlPattern)) ||
        (idea.sourceData && idea.sourceData.includes(oldUrlPattern))
      );
      
      if (matchingIdeas.length === 0) {
        return res.status(404).json({ 
          message: "No ideas found with matching URL pattern",
          searched: oldUrlPattern
        });
      }
      
      // Update all matching ideas
      const updated = [];
      for (const idea of matchingIdeas) {
        const [updatedIdea] = await db
          .update(ideas)
          .set({ 
            previewUrl: newUrl,
            updatedAt: new Date()
          })
          .where(eq(ideas.id, idea.id))
          .returning();
        updated.push(updatedIdea);
      }
      
      res.json({
        message: `Updated ${updated.length} idea(s)`,
        updated: updated.map(i => ({ id: i.id, title: i.title, slug: i.slug, previewUrl: i.previewUrl }))
      });
    } catch (error: any) {
      console.error("Error updating preview URLs:", error);
      res.status(500).json({ 
        message: "Failed to update preview URLs",
        error: error?.message 
      });
    }
  });

  // Database diagnostic endpoint
  app.get('/api/admin/db-status', async (req: any, res) => {
    try {
      // Check database connection
      const totalIdeas = await db.select({ count: sql<number>`count(*)` }).from(ideas);
      const publishedIdeas = await db.select({ count: sql<number>`count(*)` }).from(ideas).where(eq(ideas.isPublished, true));
      const totalTags = await db.select({ count: sql<number>`count(*)` }).from(tags);
      
      // Get sample idea to check structure
      const sampleIdea = await db.select().from(ideas).limit(1);
      
      res.json({
        status: 'connected',
        database: {
          totalIdeas: Number(totalIdeas[0]?.count || 0),
          publishedIdeas: Number(publishedIdeas[0]?.count || 0),
          totalTags: Number(totalTags[0]?.count || 0),
          hasSampleIdea: sampleIdea.length > 0,
          sampleIdeaFields: sampleIdea[0] ? Object.keys(sampleIdea[0]) : [],
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Database diagnostic error:", error);
      res.status(500).json({
        status: 'error',
        error: error?.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      });
    }
  });

  // Manual re-seed endpoint (for emergencies - use with caution)
  app.post('/api/admin/reseed', isAuthenticated, async (req: any, res) => {
    try {
      // Only allow in development or if explicitly enabled
      if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_RESEED) {
        return res.status(403).json({ 
          message: "Re-seeding is disabled in production. Set ALLOW_RESEED=true to enable." 
        });
      }

      const { seedDatabaseSafe } = await import('./seedCheck');
      await seedDatabaseSafe();
      
      res.json({ 
        message: "Database re-seeded successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Error re-seeding database:", error);
      res.status(500).json({ 
        message: "Failed to re-seed database",
        error: error.message 
      });
    }
  });

  // Collaboration Portal routes
  app.get('/api/ideas/:ideaId/collaboration/messages', async (req: any, res) => {
    try {
      const { ideaId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const messages = await db.select({
        id: collaborationMessages.id,
        ideaId: collaborationMessages.ideaId,
        userId: collaborationMessages.userId,
        content: collaborationMessages.content,
        createdAt: collaborationMessages.createdAt,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
        .from(collaborationMessages)
        .leftJoin(users, eq(collaborationMessages.userId, users.id))
        .where(eq(collaborationMessages.ideaId, ideaId))
        .orderBy(desc(collaborationMessages.createdAt))
        .limit(limit)
        .offset(offset);

      // Reverse to show oldest first (for chat UI)
      const reversedMessages = messages.reverse().map(msg => ({
        id: msg.id,
        ideaId: msg.ideaId,
        userId: msg.userId,
        userName: msg.userId === null ? 'AI Assistant' : (msg.user?.firstName || 'Anonymous'),
        userImage: msg.userId === null ? null : (msg.user?.profileImageUrl || null),
        content: msg.content,
        createdAt: msg.createdAt,
        isAI: msg.userId === null, // Flag to identify AI messages
      }));

      res.json({ messages: reversedMessages });
    } catch (error: any) {
      console.error("Error fetching collaboration messages:", error);
      res.status(500).json({ message: "Failed to fetch messages", error: error.message });
    }
  });

  app.get('/api/ideas/:ideaId/collaboration/active-users', async (req: any, res) => {
    try {
      const { ideaId } = req.params;

      const activeSessions = await db.select({
        userId: collaborationSessions.userId,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImageUrl: users.profileImageUrl,
        },
      })
        .from(collaborationSessions)
        .leftJoin(users, eq(collaborationSessions.userId, users.id))
        .where(eq(collaborationSessions.ideaId, ideaId));

      // Get unique users
      const uniqueUsers = new Map();
      activeSessions.forEach(session => {
        if (session.userId && !uniqueUsers.has(session.userId)) {
          uniqueUsers.set(session.userId, {
            userId: session.userId,
            userName: session.user?.firstName || 'Anonymous',
            userImage: session.user?.profileImageUrl || null,
          });
        }
      });

      res.json({ 
        count: uniqueUsers.size,
        users: Array.from(uniqueUsers.values()),
      });
    } catch (error: any) {
      console.error("Error fetching active users:", error);
      res.status(500).json({ message: "Failed to fetch active users", error: error.message });
    }
  });

  app.post('/api/ideas/:ideaId/collaboration/ai-insight', isAuthenticated, async (req: any, res) => {
    try {
      const { ideaId } = req.params;

      // Get idea info
      const idea = await storage.getIdeaById(ideaId);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      // Get recent messages (last 30)
      const messages = await db.select({
        userId: collaborationMessages.userId,
        content: collaborationMessages.content,
        createdAt: collaborationMessages.createdAt,
        user: {
          firstName: users.firstName,
        },
      })
        .from(collaborationMessages)
        .leftJoin(users, eq(collaborationMessages.userId, users.id))
        .where(eq(collaborationMessages.ideaId, ideaId))
        .orderBy(desc(collaborationMessages.createdAt))
        .limit(30);

      const conversationHistory = messages.reverse().map(msg => ({
        userName: msg.user?.firstName || 'Anonymous',
        content: msg.content,
        createdAt: msg.createdAt,
      }));

      // Generate AI insight
      const insight = await aiService.generateCollaborationInsight(
        ideaId,
        idea.title,
        conversationHistory
      );

      // Save AI insight as a message (userId = null identifies it as AI)
      const [savedMessage] = await db.insert(collaborationMessages).values({
        ideaId: ideaId,
        userId: null, // null userId identifies this as an AI message
        content: insight,
      }).returning();

      // Broadcast AI message via Socket.io to all users in the room
      const io = (global as any).socketIO;
      if (io) {
        io.to(`idea:${ideaId}`).emit('new_message', {
          id: savedMessage.id,
          ideaId: savedMessage.ideaId,
          userId: null,
          userName: 'AI Assistant',
          userImage: null,
          content: savedMessage.content,
          createdAt: savedMessage.createdAt,
          isAI: true,
        });
      }

      res.json({ insight });
    } catch (error: any) {
      console.error("Error generating AI insight:", error);
      console.error("Error stack:", error?.stack);
      const errorMessage = error?.message || 'Unknown error';
      res.status(500).json({ message: "Failed to generate AI insight", error: errorMessage });
    }
  });

  // Collaboration Portal - Send user message
  app.post('/api/ideas/:ideaId/collaboration/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { ideaId } = req.params;
      const userId = req.user.claims.sub;
      const { content } = req.body;

      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ message: "Message content is required" });
      }

      // Verify idea exists
      const idea = await storage.getIdeaById(ideaId);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      // Create collaboration session if it doesn't exist
      const existingSession = await db.select()
        .from(collaborationSessions)
        .where(and(
          eq(collaborationSessions.ideaId, ideaId),
          eq(collaborationSessions.userId, userId)
        ))
        .limit(1);

      if (existingSession.length === 0) {
        await db.insert(collaborationSessions).values({
          ideaId: ideaId,
          userId: userId,
        });
      }

      // Save user message
      const [savedMessage] = await db.insert(collaborationMessages).values({
        ideaId: ideaId,
        userId: userId,
        content: content.trim(),
      }).returning();

      // Get user info for the response
      const [user] = await db.select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        profileImageUrl: users.profileImageUrl,
      })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const messageResponse = {
        id: savedMessage.id,
        ideaId: savedMessage.ideaId,
        userId: savedMessage.userId,
        userName: user?.firstName || 'Anonymous',
        userImage: user?.profileImageUrl || null,
        content: savedMessage.content,
        createdAt: savedMessage.createdAt,
        isAI: false,
      };

      // Broadcast message via Socket.io to all users in the room
      const io = (global as any).socketIO;
      if (io) {
        io.to(`idea:${ideaId}`).emit('new_message', messageResponse);
      }

      res.json(messageResponse);
    } catch (error: any) {
      console.error("Error sending collaboration message:", error);
      res.status(500).json({ message: "Failed to send message", error: error.message });
    }
  });

  // Collaboration Portal - Interactive AI Chat
  app.post('/api/ideas/:ideaId/collaboration/ai-chat', isAuthenticated, async (req: any, res) => {
    try {
      const { ideaId } = req.params;
      const { messageId, question, conversationContext, synthesizeState, synthesizeData } = req.body;

      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({ message: "Question is required" });
      }

      // Get idea info
      const idea = await storage.getIdeaById(ideaId);
      if (!idea) {
        return res.status(404).json({ message: "Idea not found" });
      }

      // If in synthesize flow, use synthesize service
      if (synthesizeState && synthesizeState !== 'idle') {
        // Fetch ALL messages for synthesize flow (not just recent)
        const allMessages = await db.select({
          id: collaborationMessages.id,
          userId: collaborationMessages.userId,
          content: collaborationMessages.content,
          createdAt: collaborationMessages.createdAt,
          user: {
            firstName: users.firstName,
            lastName: users.lastName,
          },
        })
          .from(collaborationMessages)
          .leftJoin(users, eq(collaborationMessages.userId, users.id))
          .where(eq(collaborationMessages.ideaId, ideaId))
          .orderBy(asc(collaborationMessages.createdAt));

        const allContext = allMessages.map(msg => ({
          id: msg.id,
          userName: msg.userId === null ? 'AI Assistant' : (`${msg.user?.firstName || ''} ${msg.user?.lastName || ''}`.trim() || 'Anonymous'),
          content: msg.content,
          createdAt: msg.createdAt,
        }));

        const result = await aiService.generateSynthesizeResponse(
          ideaId,
          idea,
          allContext,
          synthesizeState,
          synthesizeData || {},
          question.trim()
        );

        // Save AI response to database as a message (userId = null identifies it as AI)
        const [savedMessage] = await db.insert(collaborationMessages).values({
          ideaId: ideaId,
          userId: null, // null userId identifies this as an AI message
          content: result.response,
        }).returning();

        // Broadcast AI message via Socket.io to all users in the room
        const io = (global as any).socketIO;
        if (io) {
          io.to(`idea:${ideaId}`).emit('new_message', {
            id: savedMessage.id,
            ideaId: savedMessage.ideaId,
            userId: null,
            userName: 'AI Assistant',
            userImage: null,
            content: savedMessage.content,
            createdAt: savedMessage.createdAt,
            isAI: true,
          });
        }

        res.json({
          response: result.response,
          messageId: savedMessage.id, // Return the saved message ID
          synthesizeState: result.nextState,
          synthesizeData: result.data,
        });
        return;
      }

      // Get the specific message if messageId is provided
      let messageContent: string | undefined;
      if (messageId) {
        const message = await db.select({
          content: collaborationMessages.content,
        })
          .from(collaborationMessages)
          .where(eq(collaborationMessages.id, messageId))
          .limit(1);

        if (message.length > 0) {
          messageContent = message[0].content;
        }
      }

      // Use provided conversation context or fetch recent messages
      let context: Array<{ id: string; userName: string; content: string; createdAt: Date }>;
      if (conversationContext && Array.isArray(conversationContext)) {
        context = conversationContext.map((msg: any) => ({
          id: msg.id,
          userName: msg.userName || 'Anonymous',
          content: msg.content,
          createdAt: new Date(msg.createdAt),
        }));
      } else {
        // Fallback: fetch recent messages
        const messages = await db.select({
          id: collaborationMessages.id,
          userId: collaborationMessages.userId,
          content: collaborationMessages.content,
          createdAt: collaborationMessages.createdAt,
          user: {
            firstName: users.firstName,
          },
        })
          .from(collaborationMessages)
          .leftJoin(users, eq(collaborationMessages.userId, users.id))
          .where(eq(collaborationMessages.ideaId, ideaId))
          .orderBy(desc(collaborationMessages.createdAt))
          .limit(10);

        context = messages.reverse().map(msg => ({
          id: msg.id,
          userName: msg.userId === null ? 'AI Assistant' : (msg.user?.firstName || 'Anonymous'),
          content: msg.content,
          createdAt: msg.createdAt,
        }));
      }

      // Generate AI response
      const response = await aiService.generateMessageAnalysis(
        ideaId,
        idea.title,
        messageId,
        messageContent,
        question.trim(),
        context
      );

      // Save AI response to database as a message (userId = null identifies it as AI)
      const [savedMessage] = await db.insert(collaborationMessages).values({
        ideaId: ideaId,
        userId: null, // null userId identifies this as an AI message
        content: response,
      }).returning();

      // Broadcast AI message via Socket.io to all users in the room
      const io = (global as any).socketIO;
      if (io) {
        io.to(`idea:${ideaId}`).emit('new_message', {
          id: savedMessage.id,
          ideaId: savedMessage.ideaId,
          userId: null,
          userName: 'AI Assistant',
          userImage: null,
          content: savedMessage.content,
          createdAt: savedMessage.createdAt,
          isAI: true,
        });
      }

      res.json({ 
        response,
        messageId: savedMessage.id, // Return the saved message ID
        referencedMessage: messageId && messageContent ? {
          id: messageId,
          content: messageContent,
        } : undefined,
      });
    } catch (error: any) {
      logErrorToFile(error, 'AI Chat Collaboration Endpoint');
      console.error("Error generating AI chat response:", error);
      console.error("Error stack:", error?.stack);
      console.error("Full error details:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      res.status(500).json({ 
        message: "Failed to generate AI chat response", 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      });
    }
  });

  // Password-based login endpoint
  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('[Login] Attempting login for email:', email);
      
      if (!email || !password) {
        console.log('[Login] Missing email or password');
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      console.log('[Login] Normalized email:', normalizedEmail);

      // Find user by email
      const [user] = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
      
      if (!user) {
        console.log('[Login] User not found for email:', normalizedEmail);
        // Check if any users exist
        const allUsers = await db.select({ email: users.email, id: users.id }).from(users).limit(10);
        console.log('[Login] Existing users in DB:', allUsers.map(u => ({ id: u.id, email: u.email })));
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      if (!user.passwordHash) {
        console.log('[Login] User found but no password hash:', user.id, user.email);
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      console.log('[Login] User found:', user.id, user.email, 'Password hash exists:', !!user.passwordHash);

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      console.log('[Login] Password valid:', isValidPassword);
      
      if (!isValidPassword) {
        console.log('[Login] Invalid password for user:', user.email);
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Create session user object
      const sessionUser = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          profile_image_url: user.profileImageUrl,
        }
      };

      // Log in user
      req.login(sessionUser, (err: any) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ message: 'Failed to create session' });
        }
        res.json({ 
          success: true,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
          }
        });
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  });

  // Logout endpoint (supports both GET and POST for compatibility)
  app.post('/api/auth/logout', (req: any, res) => {
    const sessionCookieName = req.session?.cookie?.name || 'connect.sid';
    const cookieOptions: any = {
      path: '/',
      httpOnly: true,
    };

    // Get cookie options from session if available
    if (req.session?.cookie) {
      cookieOptions.secure = req.session.cookie.secure;
      cookieOptions.sameSite = req.session.cookie.sameSite;
      cookieOptions.domain = req.session.cookie.domain;
    }

    req.logout((err: any) => {
      if (err) {
        console.error('Logout error:', err);
        // Still try to destroy session and clear cookie
      }
      
      req.session.destroy((destroyErr: any) => {
        if (destroyErr) {
          console.error('Session destroy error:', destroyErr);
        }
        
        // Clear the cookie with proper options
        res.clearCookie(sessionCookieName, cookieOptions);
        
        // Also try clearing with default name in case
        res.clearCookie('connect.sid', cookieOptions);
        
        if (err || destroyErr) {
          return res.status(500).json({ message: 'Logout completed with errors' });
        }
        res.json({ success: true });
      });
    });
  });

  // GET logout for backward compatibility
  app.get('/api/logout', (req: any, res) => {
    const sessionCookieName = req.session?.cookie?.name || 'connect.sid';
    const cookieOptions: any = {
      path: '/',
      httpOnly: true,
    };

    // Get cookie options from session if available
    if (req.session?.cookie) {
      cookieOptions.secure = req.session.cookie.secure;
      cookieOptions.sameSite = req.session.cookie.sameSite;
      cookieOptions.domain = req.session.cookie.domain;
    }

    req.logout((err: any) => {
      if (err) {
        console.error('Logout error:', err);
      }
      
      req.session.destroy((destroyErr: any) => {
        // Clear the cookie with proper options
        res.clearCookie(sessionCookieName, cookieOptions);
        res.clearCookie('connect.sid', cookieOptions);
        res.redirect('/login');
      });
    });
  });

  const httpServer = createServer(app);
  
  // Setup Socket.io server for Collaboration Portal
  // Use the session middleware from setupAuth (already applied to Express)
  const io = setupSocketServer(httpServer, sessionMiddleware);
  
  // Store io instance globally for broadcasting AI messages
  (global as any).socketIO = io;
  
  // Admin endpoint to delete test ideas (matching various test patterns)
  app.delete('/api/admin/delete-test-ideas', isAuthenticated, async (req: any, res) => {
    try {
      console.log('[Admin] Deleting test ideas...');
      
      // Find all ideas matching these patterns (case insensitive):
      // 1. "test" followed by optional space and a number (e.g., "test 3", "test5")
      // 2. Exact match "test" (e.g., "Test")
      // 3. Exact match "test app" (e.g., "Test App")
      const testIdeas = await db
        .select({
          id: ideas.id,
          title: ideas.title,
          slug: ideas.slug,
        })
        .from(ideas)
        .where(
          sql`LOWER(${ideas.title}) ~ '^test\\s*\\d+$' OR LOWER(${ideas.title}) = 'test' OR LOWER(${ideas.title}) = 'test app'`
        );
      
      console.log(`[Admin] Found ${testIdeas.length} ideas matching patterns`);
      
      if (testIdeas.length === 0) {
        return res.json({ 
          success: true, 
          message: 'No ideas found matching the patterns',
          deleted: 0 
        });
      }
      
      // Get IDs to delete
      const idsToDelete = testIdeas.map(idea => idea.id);
      
      console.log(`[Admin] Deleting ${idsToDelete.length} ideas:`, testIdeas.map(i => i.title));
      
      // Delete ideas (cascade will handle related records like tags, votes, etc.)
      await db
        .delete(ideas)
        .where(inArray(ideas.id, idsToDelete));
      
      console.log(`[Admin] Successfully deleted ${idsToDelete.length} ideas`);
      
      res.json({ 
        success: true, 
        message: `Successfully deleted ${idsToDelete.length} test ideas`,
        deleted: idsToDelete.length,
        deletedIdeas: testIdeas.map(idea => ({ title: idea.title, slug: idea.slug }))
      });
    } catch (error) {
      console.error('[Admin] Error deleting test ideas:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to delete test ideas',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  return { server: httpServer, sessionMiddleware };
}
