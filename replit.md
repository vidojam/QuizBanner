# Learning Reinforcement Banner Application

## Overview

This is a learning reinforcement application that helps users memorize information through timed screensaver banners. Users create question-answer pairs that are displayed in full-screen, vibrant banners with configurable durations and positions. The application supports both a traditional screensaver mode and an overlay mode, with features like shuffling, playback controls, and comprehensive customization.

### Current Status (November 3, 2025)

**Production Ready Features:**
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

**Planned Features:**
- ⏳ Spaced repetition algorithm
- ⏳ Category/tag filtering
- ⏳ Quiz template system
- ⏳ Drag-and-drop question reordering
- ⏳ Study history analytics
- ⏳ Preview mode for banner animations

### Recent Changes (November 3, 2025)

**Critical Fixes:**
1. **Initial Banner Color Contrast Bug** (architect-reviewed, production-ready)
   - Problem: First banner could render dark text on dark background or light on light
   - Root cause: `backgroundColor` and `textColor` were seeded from different random values
   - Solution: Created `getInitialColors()` helper to seed both states from same random color
   - Impact: First banner now guaranteed WCAG AA compliant from first render

2. **Unused Timer Reference Cleanup** (architect-reviewed, production-ready)
   - Removed dead `answerTimerRef` logic from ScreensaverBanner component
   - Timer was being cleared but never assigned, creating confusing code
   - Cleanup ensures maintenance clarity without functional impact

**Enhancements Implemented:**
- Migrated from localStorage to PostgreSQL database for cloud sync
- Added comprehensive playback controls (pause/resume with Space, skip button)
- Implemented adjustable settings via sliders (duration, height, font size)
- Created import/export functionality for JSON backup/sharing
- Added progress indicator showing question number and position cycle
- Implemented sound notifications using Web Audio API
- Increased default font size from 20px to 48px for better visibility
- Added ESC key hint in overlay mode for better UX
- Fixed live updates: banners now react when questions are added/deleted

**Testing:**
- End-to-end tests passed successfully (playwright-based validation)
- All core features verified: CRUD, playback controls, settings persistence
- Color contrast compliance confirmed from first render through all transitions

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