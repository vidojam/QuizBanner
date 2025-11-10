# Learning Reinforcement Banner Application

## Overview

This is a learning reinforcement application that helps users memorize information through timed screensaver banners. Users create question-answer pairs that are displayed in full-screen, vibrant banners with configurable durations and positions. The application supports both a traditional screensaver mode and an overlay mode, with features like shuffling, playback controls, and comprehensive customization.

### Current Status (November 10, 2025)

**Production Ready Features:**
- ✅ User authentication with Replit Auth (OpenID Connect)
- ✅ Two-tier system: Free (10 questions) and Premium (50 questions)
- ✅ Server-side tier limit enforcement with helpful error messages
- ✅ User-specific questions and preferences with data isolation
- ✅ PostgreSQL database with full CRUD operations
- ✅ Pause/resume controls (Space key)
- ✅ Skip button to advance questions
- ✅ Adjustable scroll duration (5-60 seconds)
- ✅ Customizable banner height (32-128px) and font size (24-96px)
- ✅ WCAG AA compliant color contrast validation
- ✅ Import/export to JSON
- ✅ Progress indicator with position tracking
- ✅ Real-time banner updates when questions change
- ✅ Sound notifications on question transitions (Web Audio API)
- ✅ Larger default text (48px) for better visibility
- ✅ ESC key hint in overlay mode

**Pending Features:**
- ⏳ Stripe integration for $1.99 premium upgrade (12-month subscription)
- ⏳ Premium upgrade UI showing feature comparison
- ⏳ Restrict import features to premium users
- ⏳ Spaced repetition algorithm
- ⏳ Category/tag filtering
- ⏳ Quiz template system
- ⏳ Drag-and-drop question reordering
- ⏳ Study history analytics
- ⏳ Preview mode for banner animations

### Recent Changes (November 10, 2025)

**Major Features Added:**
1. **User Authentication System** (architect-reviewed, production-ready)
   - Replit Auth integration with OpenID Connect
   - Secure session management with PostgreSQL storage
   - Environment-aware cookie security (dev/prod)
   - Landing page for unauthenticated users
   - User avatar, email, and tier status display

2. **Two-Tier System with Question Limits** (architect-reviewed, production-ready)
   - Free tier: 10 questions maximum
   - Premium tier: 50 questions maximum (requires $1.99 for 12 months)
   - Server-side limit enforcement prevents bypassing via API
   - Clear error messages when limit reached
   - Upgrade prompts for free users

3. **User Data Isolation** (architect-reviewed, production-ready)
   - Questions and preferences are user-specific
   - Foreign keys with cascade delete on user removal
   - All API endpoints protected with authentication
   - Proper userId scoping in all database queries

**Security Enhancements:**
- All question/preference endpoints require authentication
- Server-side tier limit enforcement (403 on quota exceeded)
- Insert schemas omit server-managed fields (userId)
- No cross-user data leakage possible
- Direct API calls properly validated and scoped

**Previous Enhancements (November 3, 2025):**
- Migrated from localStorage to PostgreSQL database
- Comprehensive playback controls (pause/resume with Space, skip button)
- Adjustable settings via sliders (duration, height, font size)
- Import/export functionality for JSON backup/sharing
- Progress indicator with position tracking
- Sound notifications using Web Audio API
- Increased default font size to 48px
- ESC key hint in overlay mode
- Real-time banner updates when questions change
- WCAG AA color contrast compliance from first render

**Testing:**
- Architect-reviewed for security and correctness
- Authentication flow verified (login/logout/session)
- Tier limits tested with proper 403 responses
- User data isolation confirmed

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side routing)
- **State Management:** TanStack Query (React Query) for server state
- **UI Components:** shadcn/ui (Radix UI primitives + Tailwind CSS)
- **Styling:** Tailwind CSS with custom design tokens
- **Build Tool:** Vite

**Design System:**
- Material Design principles adapted for productivity/learning tools
- Typography: Inter/Roboto fonts via Google Fonts CDN
- Color scheme: Random accessible colors with WCAG AA compliance (4.5:1 contrast ratio)
  - Uses `getRandomAccessibleColor()` to generate vibrant backgrounds
  - Uses `getAccessibleTextColor(bgColor)` to auto-select black or white text
  - Initial banner colors seeded from same random value for guaranteed contrast
- Responsive layout with mobile-first approach
- Tabbed interface for organization (Questions, Settings, Import/Export)

**Key Components:**
- `QuestionForm`: Input interface for creating question-answer pairs
- `QuestionList`: CRUD interface for managing questions with delete functionality
- `ScreensaverBanner`: Individual banner display with:
  - Timed transitions (question → answer → next)
  - Pause/resume state handling
  - Position-based scroll animations (bottom, top, left, right, random)
  - Accessible color contrast with WCAG validation
- `ScreensaverMode`: Orchestrates banner sequence with:
  - Progress indicator (current question, position cycle)
  - Pause/resume (Space key)
  - Skip button
  - Sound notifications (optional beep on transitions)
  - Live updates when questions change
  - ESC key to exit overlay mode

**State Management Strategy:**
- Server state via React Query with optimistic updates
- Local state for UI interactions (edit mode, pause state)
- LocalStorage for display mode preference persistence

### Backend Architecture

**Technology Stack:**
- **Runtime:** Node.js with Express
- **Language:** TypeScript (ESNext modules)
- **ORM:** Drizzle ORM
- **Database Driver:** Neon serverless PostgreSQL with WebSocket support
- **Validation:** Zod schemas

**API Design:**
- RESTful endpoints following resource-based conventions
- CRUD operations for: questions, preferences, templates, study sessions
- JSON request/response bodies
- Zod schema validation on all inputs

**Middleware:**
- JSON body parsing with raw body preservation
- Request/response logging for API routes
- Error handling with structured error responses

### Data Storage

**Database:** PostgreSQL (via Neon serverless)

**Schema Design:**

1. **questions table:**
   - Question-answer pairs with metadata
   - Categories and tags for organization
   - Performance tracking (times_reviewed, performance_score, last_reviewed)
   - Custom colors and durations per question
   - Order field for manual sequencing

2. **preferences table:**
   - Global user settings (singleton pattern)
   - Display configuration (duration, banner height, font size)
   - Feature toggles (sound notifications, shuffle, spaced repetition)
   - Color scheme preferences (random vs. custom palette)
   - Category filtering

3. **templates table:**
   - Pre-built question sets by category
   - Bulk import functionality

4. **study_sessions table:**
   - Session tracking for analytics
   - Performance metrics (questions reviewed, total duration)

**Data Access Pattern:**
- Storage abstraction layer (`IStorage` interface)
- `DatabaseStorage` implementation using Drizzle ORM
- Prepared for future storage backends (in-memory, file-based)

### Authentication and Authorization

**Current State:** No authentication implemented
**Rationale:** Single-user desktop application (screensaver utility)
**Future Consideration:** May add user accounts if deployed as multi-tenant SaaS

### External Dependencies

**Development Tools:**
- Replit-specific plugins for development (vite-plugin-runtime-error-modal, cartographer, dev-banner)
- ESBuild for server bundling in production

**UI Libraries:**
- Radix UI primitives (18+ components): Provides accessible, unstyled components
- Embla Carousel: For potential future carousel features
- cmdk: Command palette functionality (likely unused)
- date-fns: Date formatting and manipulation
- class-variance-authority (CVA): Type-safe component variants
- tailwind-merge + clsx: Utility class merging

**Backend Libraries:**
- ws (WebSocket): Required for Neon serverless database connections
- connect-pg-simple: PostgreSQL session store (imported but sessions not implemented)

**Deployment Strategy:**
- Development: Vite dev server with HMR
- Production: Static build served by Express with client-side routing fallback
- Database migrations: Drizzle Kit push command