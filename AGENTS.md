# Bible Soom - AI Agent Codebase Guide

## Project Overview

**Bible Soom** is a modern Bible meditation web application built with Next.js 15 (App Router), React 18, and TypeScript. It uses Supabase as the backend and provides Bible reading, highlighting, notes, and bookmarking features with a multi-panel architecture for parallel translation viewing.

**Stack**: Next.js 15 + React 18 + TypeScript + Tailwind CSS + Supabase PostgreSQL

## Purpose

This is the root documentation for AI agents working with the Bible Soom codebase. The project enables users to:
- Read Bible passages in multiple translations simultaneously
- Highlight verses with different colors
- Add personal notes to passages
- Bookmark favorite verses
- Search across Bible translations
- Switch between Blue/Beige/Neutral themes with dark mode support

## Architecture Overview

### 5-Layer Structure

1. **Pages (Routes)** - `app/` - Next.js App Router routes
2. **Components (UI)** - `components/` - React components
3. **API** - `app/api/v1/*` - Next.js route handlers
4. **Services/Utilities** - `lib/` - Supabase clients, auth, constants
5. **Database** - Supabase PostgreSQL (schema: `supabase/migrations/*.sql`)

### Critical Architectural Decisions

**Schema Evolution (In Progress)**:
- **From**: Wide table (`verses` with translation columns: korhrv, niv, etc.)
- **To**: Normalized schema (`translations` + `verse_translations` tables)
- **Current**: Both schemas coexist during migration
- **New Translations**: Add via `INSERT` into `translations` + `verse_translations` (no schema change needed)

**Multi-Panel Architecture**:
- `PassageClient` orchestrates N parallel Bible panels
- Each panel shows a different translation
- Panels can be added/removed dynamically
- Independent navigation per panel

**Server vs Client Supabase**:
- `lib/supabase/client.ts` - Browser/client components
- `lib/supabase/server.ts` - Server components/API routes
- Never mix these - auth will fail

## Key Directories

### Application Layer
- **app/** - [Next.js App Router pages and API routes](app/AGENTS.md)
  - `app/api/v1/` - REST API endpoints (passages, search, highlights, notes, bookmarks)
  - `app/bible/[translation]/[book]/[chapter]/` - Dynamic Bible reading routes
  - Route-based file system navigation

### Component Layer
- **components/** - [Reusable React components](components/AGENTS.md)
  - `components/passage/` - Multi-panel Bible reading interface
  - `components/auth/` - Authentication (AuthProvider, useAuth hook)
  - `components/theme/` - Theme system (Blue/Beige/Neutral + dark mode)
  - `components/ui/` - Atomic UI components

### Service Layer
- **lib/** - [Utilities and shared logic](lib/AGENTS.md)
  - `lib/supabase/` - Supabase client wrappers
  - `lib/auth.ts` - authGuard() server-side middleware
  - `lib/constants.ts` - Central constants (translations, colors, fonts)

### Data Layer
- **supabase/** - [Database schema and migrations](supabase/AGENTS.md)
  - `supabase/migrations/` - SQL migration files (chronological)
  - Current schema: `20260116_normalized_schema.sql`
  - RLS policies protect user data (notes, highlights, bookmarks)

### Tooling
- **scripts/** - [Data import and utility scripts](scripts/AGENTS.md)
  - Python scripts for importing Bible translations
  - Migration runners
  - Requires `SUPABASE_SERVICE_ROLE_KEY`

- **.claude/** - [Multi-agent system configuration](/.claude/AGENTS.md)
  - Agent definitions (backend, frontend, fullstack specialists)
  - Specialized skills (feature planning, UI/UX, git mastery)
  - Sisyphus orchestration system

### Supporting Files
- **types/** - TypeScript type definitions
- **hooks/** - Custom React hooks (useAuth, useLocalStorage, useClickOutside)
- **public/** - Static assets
- **HRV(ver.4)/** - Legacy Bible text data files

## For AI Agents

### Common Tasks

**Adding a New Translation**:
1. Insert into `translations` table (metadata)
2. Run import script to populate `verse_translations`
3. UI automatically picks up from `/api/v1/translations`
4. No code changes needed

**Modifying User Data Features**:
1. Create migration with RLS policies
2. Add API route in `app/api/v1/`
3. Update `PassageClient` state management
4. Add UI in `components/passage/`

**Theme Customization**:
1. Edit `tailwind.config.ts` for color palettes
2. Update `components/theme/theme-provider.tsx` if needed
3. Dark mode uses `dark:` variants

### Critical Rules

- ✅ Use `createServerSupabase()` in API routes/server components
- ✅ Use `createBrowserSupabase()` in client components
- ✅ Always call `authGuard()` in protected API routes
- ✅ Read files before editing them
- ✅ Preserve TODO tracking during complex tasks
- ❌ Never mix server/client Supabase instances
- ❌ Never skip RLS policy creation for user data
- ❌ Never hardcode translations list (use `/api/v1/translations` API)

### Entry Points

**Main Reading Interface**:
- `app/bible/[translation]/[book]/[chapter]/page.tsx` - Renders PassageClient
- `components/passage/passage-client.tsx` - Multi-panel orchestrator (500+ lines)

**API Endpoints**:
- `/api/v1/passages` - Fetch Bible text
- `/api/v1/translations` - List available translations
- `/api/v1/search` - Full-text search
- `/api/v1/highlights`, `/notes`, `/bookmarks` - User data CRUD

**Authentication Flow**:
```
AuthProvider (components/auth/auth-provider.tsx)
  ↓ provides useAuth() hook
  ↓ { user, loading, signOut }
  ↓
Used by: Header, PassageClient, MyPage
```

### Data Flow Example

**Reading a Bible Chapter**:
1. User navigates to `/bible/korHRV/Gen/1`
2. `page.tsx` renders `PassageClient` with initial panel config
3. `PassageClient` fetches from `/api/v1/passages?translation=korHRV&book=Gen&chapter=1`
4. API route uses `createServerSupabase()` to query `verse_translations` table
5. Data flows to `BiblePanel` → `VerseDisplay` components
6. User interactions (highlights, notes) POST to respective API endpoints
7. State updates trigger re-renders

### Migration Status

**Current Phase**: Dual-schema coexistence
- Legacy `verses` table with wide columns (korhrv, niv, etc.)
- New `translations` + `verse_translations` normalized structure
- Both are queryable; new code should use normalized schema
- See `MIGRATION_GUIDE.md` for transition plan

## Dependencies

**Runtime**:
- `next` (15.x) - App Router, Server Components
- `react` (18.x) - UI library
- `@supabase/supabase-js` - Database client
- `tailwindcss` - Styling system

**Development**:
- `typescript` - Type safety
- `eslint` - Code linting

**Python Scripts**:
- `supabase-py` - Import scripts

## Environment Setup

Required `.env.local` variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Development Commands

```bash
npm install        # Install dependencies
npm run dev        # Dev server (port 3000)
npm run build      # Production build
npm start          # Production server
npm run lint       # ESLint
```

## Further Reading

- `CLAUDE.md` - Detailed project instructions for Claude AI
- `MIGRATION_GUIDE.md` - Schema migration procedures
- `README.md` - User-facing project overview
- `.claude/CLAUDE.md` - Sisyphus multi-agent system guide
