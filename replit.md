# MojoTX Gambling Streamer Website

## Overview

MojoTX is a gambling streamer rewards platform built for the Kick.com streamer MojoTX. The application provides a comprehensive gamification system featuring monthly leaderboards, tiered level milestones, multiplier-based challenges, free spins offers, and a referral program. Users can track their progress, compete for prizes, and claim exclusive rewards through an admin-managed content system.

The platform is designed with a dark, high-energy aesthetic inspired by modern gambling platforms (Stake, Gamdom) and streaming services (Kick.com), emphasizing competitive elements, data clarity, and visual excitement through glowing effects and bold typography.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, providing fast HMR and optimized production builds
- **Wouter** for lightweight client-side routing
- **TanStack Query (React Query)** for server state management, caching, and data synchronization

**UI Component System**
- **shadcn/ui** component library built on Radix UI primitives, providing accessible, customizable components
- **Tailwind CSS** for utility-first styling with a custom design system
- **Class Variance Authority (CVA)** for managing component variants
- Custom design tokens defined in CSS variables for colors, spacing, and effects (dark mode optimized)

**Design System**
- Dark theme with gambling/streaming platform aesthetics
- High-energy visual language with gradient effects, glowing borders, and elevated cards
- Typography hierarchy using Inter/Poppins for competitive data display
- Consistent spacing scale (4, 6, 8, 12, 16, 24px units)
- Responsive grid layouts for leaderboards, milestone cards, and challenges

**State Management Strategy**
- Server state managed via TanStack Query with optimistic updates
- Form state handled by React Hook Form with Zod validation
- UI state (modals, sidebar) managed locally with React hooks
- No global client state management library (Redux/Zustand) - intentionally kept simple

### Backend Architecture

**Server Framework**
- **Express.js** on Node.js for RESTful API endpoints
- TypeScript for type safety across the entire stack
- Custom middleware for request logging and JSON parsing
- Development mode uses Vite middleware for SSR and HMR

**API Design**
- RESTful endpoints organized by feature domain:
  - `/api/leaderboard/*` - Leaderboard entries and settings
  - `/api/milestones/*` - Level milestone management
  - `/api/challenges/*` - Challenge CRUD operations
  - `/api/free-spins/*` - Free spins offer management
- Consistent response format with error handling
- Request validation using Zod schemas shared between client and server

**Data Layer**
- **Drizzle ORM** for type-safe database queries and schema management
- Schema-first design with TypeScript inference for full type safety
- Storage abstraction layer (`storage.ts`) providing a clean interface for data operations
- Separation of concerns: routes → storage → database

**Database Seeding**
- Automatic database seeding on startup for initial data (level milestones, sample entries)
- Idempotent seed logic that checks for existing data before inserting
- Milestone data pre-populated with 24 tier levels (Bronze through Opal)

### Data Storage

**Database Technology**
- **Neon Serverless PostgreSQL** as the primary database
- WebSocket-based connection pooling for serverless environments
- Environment-based configuration via `DATABASE_URL`

**Schema Design**
- **leaderboard_entries**: Tracks user rankings, wagered amounts, and prize allocations
- **leaderboard_settings**: Stores monthly competition configuration (prize pool, end date)
- **level_milestones**: Defines the 24-tier progression system with rewards
- **challenges**: Manages multiplier-based game challenges with requirements
- **free_spins_offers**: Tracks promotional offers with claim limits and expiration

**Data Model Characteristics**
- UUID primary keys for all entities
- Decimal type for monetary values (precision 15, scale 2) ensuring accurate financial calculations
- Timestamp tracking for creation and updates
- Array fields for storing multiple rewards per milestone
- Boolean flags for active/inactive state management

### Authentication & User Management

**OAuth Integration**
- **Discord OAuth 2.0** - Primary authentication method for user login
  - Users must log in with Discord to access the platform
  - Provides user identification and profile information
  - Credentials stored in environment variables: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
  - Note: Not using Replit's Discord connector - using direct OAuth with environment variables
  
- **Kick OAuth 2.0** - Optional account linking for Kick integration
  - PKCE flow for secure authorization
  - Allows users to link their Kick account after Discord login
  - Credentials stored in environment variables: `KICK_CLIENT_ID`, `KICK_CLIENT_SECRET`
  - Note: Not using Replit integrations - using direct OAuth with environment variables

**User Flow**
1. User visits site → redirected to login page
2. User clicks "Login with Discord" → Discord OAuth flow
3. After successful Discord login → redirected to dashboard with 1000 points
4. User can optionally link Kick account via OAuth button
5. User can manually enter Gamdom username
6. All linked accounts displayed on dashboard and visible to admin

**User Schema**
- Users table tracks session IDs, points, and linked accounts
- Discord account (required): username, user ID, avatar, access tokens
- Kick account (optional): username, user ID, access tokens
- Gamdom account (optional): username only (manual entry)

### External Dependencies

**Third-Party Services**
- **Neon Database** - Serverless PostgreSQL hosting with WebSocket support
- **Image Hosting (ibb.co)** - External CDN for milestone tier badge images
- **Discord OAuth** - User authentication and identification
- **Kick OAuth** - Optional account linking for streaming platform
- **Gamdom** - Gambling platform username tracking (manual entry)

**UI Component Libraries**
- **Radix UI** - Accessible component primitives (dialogs, popovers, tooltips, etc.)
- **Lucide React** - Icon library for consistent iconography
- **date-fns** - Date manipulation and formatting utilities
- **Embla Carousel** - Touch-friendly carousel component

**Development Tools**
- **Replit Plugins** - Vite plugins for development banner, error overlay, and cartographer
- **ESBuild** - Fast JavaScript bundler for production builds
- **Drizzle Kit** - Database migration and schema management CLI

**Form & Validation**
- **React Hook Form** - Performant form state management
- **Zod** - Runtime type validation and schema generation
- **@hookform/resolvers** - Integration between React Hook Form and Zod

**Styling & Animation**
- **Tailwind CSS** with PostCSS for processing
- **Autoprefixer** for cross-browser CSS compatibility
- **clsx & tailwind-merge** - Conditional class name utilities