import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Check if we're running on Replit (has OIDC) or elsewhere (Render, local, etc.)
const isReplitEnvironment = !!process.env.REPLIT_DOMAINS && !!process.env.REPL_ID;
const isLocalDevelopment = process.env.NODE_ENV === 'development' || !isReplitEnvironment;

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  
  // Check if we're actually running on Replit (not just local dev with vars set)
  // Only use Replit OIDC if we're actually on a Replit domain
  const isActuallyReplit = process.env.REPLIT_DOMAINS && 
                           process.env.REPL_ID && 
                           !process.env.REPLIT_DOMAINS.includes('localhost') &&
                           !process.env.REPLIT_DOMAINS.includes('127.0.0.1');
  const hasReplitOIDC = !!isActuallyReplit;
  
  console.log(`[setupAuth] Starting auth setup - hasReplitOIDC: ${hasReplitOIDC}, REPLIT_DOMAINS: ${process.env.REPLIT_DOMAINS}`);

  if (!hasReplitOIDC) {
    console.log(`[setupAuth] Setting up non-Replit auth (demo mode)`);
    // Use session-based auth for non-Replit environments (Render, local, etc.)
    const isProduction = process.env.NODE_ENV === 'production';
    const MemoryStore = (await import('memorystore')).default(session);
    
    app.use(session({
      secret: process.env.SESSION_SECRET || 'local-dev-secret',
      store: new MemoryStore({ checkPeriod: 86400000 }),
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: isProduction, 
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: isProduction ? 'lax' : 'lax'
      }
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    // Create or get demo user
    const demoUser = {
      id: 'demo-user-public',
      email: 'demo@iotd.app',
      firstName: 'Demo',
      lastName: 'User',
      profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
    };

    try {
      await storage.upsertUser(demoUser);
    } catch (e) {
      console.log('Note: Could not create demo user (database may need migration)');
    }

    // Auto-login middleware for demo mode
    // This MUST run after passport.session() but before routes
    console.log(`[setupAuth] Adding auto-login middleware`);
    app.use((req: any, res, next) => {
      // Always log for debugging
      if (req.path.startsWith('/api/')) {
        console.log(`[Auth Middleware] ${req.method} ${req.path} - req.user:`, req.user ? 'Present' : 'Missing');
      }
      
      // Check if user is missing or doesn't have claims (except for logout)
      const needsDemoUser = !req.path.startsWith('/api/logout') && 
                            (!req.user || !req.user.claims || !req.user.claims.sub);
      
      if (needsDemoUser) {
        console.log(`[Auth] Setting demo user for ${req.method} ${req.path}`);
        req.user = {
          claims: {
            sub: demoUser.id,
            email: demoUser.email,
            first_name: demoUser.firstName,
            last_name: demoUser.lastName,
            profile_image_url: demoUser.profileImageUrl,
          }
        };
        // Also mark as authenticated for passport
        req.login(req.user, () => {});
        console.log(`[Auth] Demo user set - ID: ${req.user.claims.sub}`);
      }
      next();
    });
    console.log(`[setupAuth] Auto-login middleware added`);

    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    // Stub auth routes for demo mode
    app.get("/api/login", (req, res) => res.redirect('/'));
    app.get("/api/callback", (req, res) => res.redirect('/'));
    app.get("/api/logout", (req, res) => res.redirect('/'));
    
    return; // Skip Replit OIDC setup
  }

  // Production Replit auth setup
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  // Check if we're actually running on Replit (not just local dev with vars set)
  // Only use Replit OIDC if we're actually on a Replit domain
  const isActuallyReplit = process.env.REPLIT_DOMAINS && 
                           process.env.REPL_ID && 
                           !process.env.REPLIT_DOMAINS.includes('localhost') &&
                           !process.env.REPLIT_DOMAINS.includes('127.0.0.1');
  const hasReplitOIDC = !!isActuallyReplit;
  
  // For non-Replit environments, just check if user has claims
  if (!hasReplitOIDC) {
    console.log(`[isAuthenticated] Non-Replit check - user:`, user ? 'Present' : 'Missing', 'claims:', user?.claims?.sub || 'None');
    if (user?.claims?.sub) {
      console.log(`[isAuthenticated] Auth passed - user ID: ${user.claims.sub}`);
      return next();
    }
    console.log(`[isAuthenticated] Auth failed - no user claims`);
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Replit OIDC flow
  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
