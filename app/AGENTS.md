# app/ - Next.js App Router

<!-- Parent: ../AGENTS.md -->

## Purpose

This directory contains the Next.js 15 App Router implementation, including all pages, layouts, and API routes for the Bible Soom application. It serves as the routing layer and entry point for both client-facing pages and backend API endpoints.

## Key Files

- **layout.tsx** - Root layout component
  - Wraps entire application with `AuthProvider` and `ThemeProvider`
  - Sets up global HTML structure and metadata
  - Imports global styles

- **page.tsx** - Home page (landing page)
  - Entry point for the application at `/`
  - Typically shows welcome screen or redirects to Bible reading interface

## Subdirectories

- **api/v1/** - REST API endpoints (see [api/AGENTS.md](./api/AGENTS.md))
  - `/api/v1/translations` - Bible translation metadata
  - `/api/v1/passages` - Bible text retrieval
  - `/api/v1/search` - Full-text search
  - `/api/v1/highlights` - User highlight CRUD
  - `/api/v1/notes` - User notes CRUD
  - `/api/v1/bookmarks` - User bookmarks CRUD

- **bible/[translation]/[book]/[chapter]/** - Dynamic Bible reading routes
  - Dynamic segments: `translation` (korHRV, NIV), `book` (Gen, Exo), `chapter` (1-150)
  - Renders `PassageClient` component with URL parameters
  - Example: `/bible/korHRV/Gen/1`

- **books/** - Book catalog page
  - Lists all 66 books of the Bible (Old Testament + New Testament)
  - Navigation interface for selecting books

- **search/** - Search results page
  - Full-text search across Bible translations
  - Displays search results with context

- **login/** - Login page
  - User authentication (email/password, OAuth)
  - Redirects to home after successful login

- **signup/** - Sign-up page
  - New user registration
  - Creates user account in Supabase Auth

- **mypage/** - User dashboard
  - User profile management
  - View saved highlights, notes, bookmarks

- **components/** - UI component showcase (optional dev page)
  - Demonstrates reusable UI components
  - Useful for development and design system documentation

## For AI Agents

### Routing Conventions

- **File-based routing**: Directory structure defines URL paths
- **Dynamic routes**: Use bracket syntax `[param]` for dynamic segments
- **API routes**: Must be named `route.ts` (not `page.tsx`)
- **Layouts**: `layout.tsx` files wrap child routes
- **Loading states**: `loading.tsx` for suspense boundaries
- **Error handling**: `error.tsx` for error boundaries

### Common Patterns

**Server Components (default)**:
```typescript
// app/bible/[translation]/[book]/[chapter]/page.tsx
import { createServerSupabase } from '@/lib/supabase/server';

export default async function BiblePage({ params }: { params: { translation: string, book: string, chapter: string } }) {
  const supabase = createServerSupabase();
  // Fetch data server-side
  return <PassageClient initialData={data} />;
}
```

**Client Components** (use `'use client'` directive):
```typescript
'use client';
import { useState, useEffect } from 'react';
```

**API Routes**:
```typescript
// app/api/v1/resource/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authGuard } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const guard = await authGuard();
  if (!guard.ok) return guard.response;
  // ... implementation
}
```

### Data Fetching Strategy

- **Server Components**: Fetch data at build/request time (preferred for SEO)
- **Client Components**: Fetch via API routes or use `createBrowserSupabase()`
- **API Routes**: Always use `createServerSupabase()` or `authGuard()`

### Authentication

- Protected routes should check `useAuth()` hook in client components
- API routes use `authGuard()` helper for server-side auth
- Redirect to `/login` if unauthenticated

## Dependencies

### Internal Dependencies

- **Components**: `@/components/*` - All UI components (PassageClient, Header, etc.)
- **Lib**: `@/lib/supabase/*` - Database client factories
- **Lib**: `@/lib/auth` - Authentication utilities
- **Lib**: `@/lib/constants` - App-wide constants (books, translations, colors)

### External Dependencies

- **Next.js 15**: App Router, Server Components, API Routes
- **React 18**: Client-side interactivity
- **Supabase**: Backend (auth, database)
- **Tailwind CSS**: Styling (via global styles)

### Key Imports Pattern

```typescript
// Components
import { PassageClient } from '@/components/passage/passage-client';
import { Header } from '@/components/header';

// Supabase
import { createServerSupabase } from '@/lib/supabase/server';
import { createBrowserSupabase } from '@/lib/supabase/client';

// Auth
import { authGuard } from '@/lib/auth';
import { useAuth } from '@/components/auth/auth-provider';

// Constants
import { BOOK_CHAPTERS, TRANSLATIONS } from '@/lib/constants';
```

## Migration Notes

**Schema Evolution**: The app is transitioning from legacy wide table (`verses.korhrv`, `verses.niv`) to normalized schema (`verse_translations` table). API routes in `api/v1/` are being updated to support both schemas during migration.

**Key Migration Impacts**:
- `/api/v1/passages` - Will use `verse_translations` JOIN queries
- `/api/v1/translations` - Will read from `translations` table (not hardcoded constants)
- Dynamic routes will continue to work with translation codes (korHRV, NIV, etc.)

See [../MIGRATION_GUIDE.md](../MIGRATION_GUIDE.md) for details.
