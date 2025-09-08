# Overview

This is a startup idea discovery platform that helps entrepreneurs find data-driven business opportunities. The application provides a curated database of startup ideas with comprehensive scoring, market analysis, and community engagement features. Users can browse ideas, view detailed analysis including opportunity scores and market validation data, save favorites, and interact with the community through voting and signals.

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