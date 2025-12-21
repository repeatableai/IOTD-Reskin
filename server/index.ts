// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

// Validate critical environment variables
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('⚠️  WARNING: ANTHROPIC_API_KEY is not set. AI features will not work.');
} else {
  const keyPreview = process.env.ANTHROPIC_API_KEY.substring(0, 15) + '...';
  const keyLength = process.env.ANTHROPIC_API_KEY.length;
  console.log(`✓ ANTHROPIC_API_KEY is set (${keyPreview}, length: ${keyLength})`);
}

// Polyfill File API for Node.js < 20 (required by undici)
if (typeof globalThis.File === 'undefined') {
  // Simple File polyfill - undici just needs the constructor to exist
  globalThis.File = class File {
    constructor(public parts: any[], public name: string, public options?: any) {}
  } as any;
}

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { checkAndSeedDatabase } from "./seedCheck";

const app = express();

// CRITICAL FIX: Conditionally apply body parsers to skip multipart/form-data
// express.json() and express.urlencoded() will fail on multipart requests
// Multer needs to handle multipart data, so we skip body parsing for those requests
app.use((req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  
  // Skip body parsing for multipart/form-data (let multer handle it)
  if (contentType.includes('multipart/form-data')) {
    log(`[Body Parser] Skipping multipart request: ${req.method} ${req.path}`);
    return next();
  }
  
  // Apply JSON parser for JSON requests
  if (contentType.includes('application/json')) {
    return express.json()(req, res, next);
  }
  
  // Apply URL-encoded parser for form-urlencoded requests
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return express.urlencoded({ extended: false })(req, res, next);
  }
  
  // For other content types or no content type (GET requests, etc.), try both parsers
  // But they will gracefully skip if body is empty or wrong type
  express.json()(req, res, () => {
    express.urlencoded({ extended: false })(req, res, next);
  });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Check and seed database if empty
  await checkAndSeedDatabase();

  log('Registering routes...');
  const { server } = await registerRoutes(app);
  log('Routes registered successfully');

  // Early API route handler - MUST be before Vite to catch all API routes
  app.use((req: Request, res: Response, next: NextFunction) => {
    // This will only be called if no route matched
    if (req.path.startsWith('/api/') || req.originalUrl.startsWith('/api/')) {
      // Check if this is an unmatched route (shouldn't happen if routes are registered)
      log(`[Middleware Order] Unmatched API route handler: ${req.method} ${req.path}`);
      log(`[Middleware Order] This means the route was not found in registered routes`);
      
      // Set JSON content type
      res.setHeader('Content-Type', 'application/json');
      res.status(404).json({ message: "API route not found", path: req.path });
      return; // Don't call next() - we've handled it
    }
    next();
  });
  
  // Explicit API route protection - catch any API routes before Vite
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/')) {
      log(`[API Protection] API route detected: ${req.method} ${req.path} - ensuring JSON response`);
      // Ensure JSON content type for all API routes
      const originalJson = res.json;
      res.json = function(body: any) {
        res.setHeader('Content-Type', 'application/json');
        return originalJson.call(this, body);
      };
    }
    next();
  });

  // Global error handler - MUST be before Vite setup
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    log(`[Error Handler] Error caught: ${err.message}`);
    log(`[Error Handler] Path: ${_req.path}`);
    log(`[Error Handler] Is API route: ${_req.path.startsWith('/api/')}`);
    
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Ensure API errors return JSON
    if (_req.path.startsWith('/api/')) {
      if (!res.headersSent) {
        res.status(status).json({ message, error: err.stack });
      } else {
        log(`[Error Handler] Headers already sent, cannot send JSON error`);
      }
    } else {
      if (!res.headersSent) {
        res.status(status).json({ message });
      }
    }
    // Don't throw - we've handled it
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  log('Setting up Vite middleware (after routes)...');
  if (app.get("env") === "development") {
    await setupVite(app, server);
    log('Vite middleware setup complete');
  } else {
    serveStatic(app);
    log('Static serving setup complete');
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
