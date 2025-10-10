# Overview

This is a startup idea discovery platform that helps entrepreneurs find data-driven business opportunities. The application provides a curated database of startup ideas with comprehensive scoring, market analysis, and community engagement features. Users can browse ideas, view detailed analysis including opportunity scores and market validation data, save favorites, and interact with the community through voting and signals.

## Recent Updates (October 10, 2025)

**Latest Enhancements (Just Completed)**:
- **Ad Creatives Builder** (`/idea/:slug/build/ad-creatives`) - Comprehensive ad copy generator for Facebook/Instagram, Google Ads, LinkedIn, TikTok with A/B testing strategies, CTAs, budget allocation, and success metrics tailored to market type
- **Brand Package Builder** (`/idea/:slug/build/brand-package`) - Complete brand identity framework including positioning, visual identity, logo concepts, color palette, typography, voice/tone, messaging framework, and application guidelines
- **Community Signals Platform Pages** - Platform-specific signal breakdowns for Reddit, Facebook, YouTube with proper JSONB null safety checks, trend analysis, and engagement metrics
- **Multi-Format Download Data** - Dialog-based format selector (JSON/TXT) for exporting idea data with proper serializers, MIME types, and filenames
- **Claim Idea Reactivity** - Fixed immediate UI updates using refetchQueries for instant claimed ideas visibility
- **Greg's Picks Filter** - Fixed toggle logic to use undefined instead of false when deactivating, ensuring proper filter removal and result updates

**Major AI-Powered Features (Completed & Tested)**:
- **AI Research Agent** (`/idea-agent`) - Flagship feature performing 40-step comprehensive startup analysis using GPT-4o. Users input an idea description (+ optional context) and receive detailed analysis across 6 sections: Market Opportunity, Competitor Analysis, Community Insights, Business Strategy, Financial Projections, Actionable Recommendations. Includes 4 validation scores (1-10). Features download report (.txt) and copy functionality.

- **AI Idea Generator** (`/idea-generator`) - Personalized startup idea generation based on user profile (skills, budget, time commitment, industry interests, experience level). Uses GPT-4o to generate 3 tailored ideas, each with scores, target audience, personalization explanation, next steps, revenue estimates, and time to launch.

**Framework Analysis Pages (Completed & Tested)**: Four dedicated deep-dive analytical frameworks:
- `/idea/:slug/acp-framework` - A.C.P. (Awareness-Consideration-Purchase) Framework analyzing customer journey through 3 phases with channels, strategies, and conversion optimization
- `/idea/:slug/value-matrix` - 4-quadrant value analysis (Dream Come True, Expensive But Worth It, Status Quo, Major Hassle) with strategic recommendations
- `/idea/:slug/value-ladder` - 5-tier pricing strategy (Lead Magnet → Frontend → Core → Backend → Continuity) with LTV/CAC metrics
- `/idea/:slug/keywords` - Comprehensive SEO keyword research with primary keyword analysis, related keywords, long-tail opportunities, competitor analysis, and SEO strategy

**Founder Fit Analysis (Completed & Tested)**:
- `/idea/:slug/founder-fit` - Comprehensive founder-idea matching with overall fit score (0-100%), skill requirements analysis (5 skills with match scores), ideal founder profile, critical success factors, time/budget requirements, challenges, and competitive advantages

**Idea Detail Sub-Pages (Completed & Tested)**: Market analysis deep-dive pages:
- `/idea/:slug/why-now` - Market timing analysis
- `/idea/:slug/proof-signals` - Market validation evidence  
- `/idea/:slug/market-gap` - Market opportunity analysis
- `/idea/:slug/execution-plan` - Implementation roadmap
- All pages include TypeScript slug guards, loading states, and graceful fallback messages
- Navigation flow maintained across all analysis pages
- All features tested end-to-end with Playwright

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern React application using functional components and hooks
- **Routing**: Wouter for client-side routing with support for authenticated and public routes
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Build Tool**: Vite for fast development and optimized production builds
- **Component Structure**: Modular components with reusable UI elements, custom hooks, and utility functions

## Backend Architecture
- **Express.js**: Node.js web framework handling API routes and middleware
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **Authentication**: OpenID Connect (OIDC) integration with Replit Auth using Passport.js
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **API Design**: RESTful endpoints for ideas, users, tags, and community interactions

## Database Design
- **PostgreSQL**: Primary database with Neon serverless hosting
- **Schema**: Comprehensive schema including users, ideas, tags, votes, saved items, and community signals
- **Relationships**: Proper foreign key relationships between entities with junction tables for many-to-many relationships
- **Scoring System**: Built-in fields for opportunity scores, problem scores, execution difficulty, and market data

## Authentication & Authorization
- **Replit Auth Integration**: Seamless authentication using Replit's OIDC provider
- **Session-based Authentication**: Secure session management with PostgreSQL storage
- **Route Protection**: Middleware-based route protection with graceful handling of unauthenticated users
- **User Management**: Complete user profile management with social login capabilities

## Data Architecture
- **Idea Management**: Comprehensive idea storage with metadata, content, images, and scoring
- **Tagging System**: Flexible tagging with color-coded categories for filtering and organization
- **Community Features**: User voting, saving, and community signal tracking for engagement
- **Content Structure**: Rich text content with markdown support and structured metadata

# External Dependencies

## Database & Hosting
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Replit Hosting**: Development and deployment platform with integrated tooling

## Authentication
- **Replit OIDC**: OAuth 2.0/OpenID Connect authentication provider
- **Passport.js**: Authentication middleware for Node.js applications

## UI & Styling
- **Radix UI**: Headless component library for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Typography with Inter font family

## Development Tools
- **TypeScript**: Type safety across frontend and backend
- **Vite**: Build tool with HMR and optimized bundling
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: JavaScript bundler for server-side code

## Frontend Libraries
- **TanStack Query**: Data fetching, caching, and synchronization
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation for forms and API data
- **Class Variance Authority**: Type-safe CSS class composition
- **Date-fns**: Date manipulation and formatting utilities