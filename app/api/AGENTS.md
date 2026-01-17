# API Routes Directory

<!-- Parent: ../AGENTS.md -->

## Purpose

REST API route handlers for the Bible Soom application using Next.js App Router.

## Key Files

None at this level. All API implementations are in subdirectories.

## Subdirectories

- **v1/** - Version 1 API endpoints (see [v1/AGENTS.md](./v1/AGENTS.md))
  - `/api/v1/translations` - Available Bible translations metadata
  - `/api/v1/passages` - Bible passage retrieval
  - `/api/v1/search` - Full-text search across verses
  - `/api/v1/highlights` - User highlight CRUD operations
  - `/api/v1/notes` - User notes CRUD operations
  - `/api/v1/bookmarks` - User bookmarks CRUD operations

## For AI Agents

### Route Handler Pattern

API routes use Next.js 13+ App Router conventions:

```typescript
// route.ts - Named exports for HTTP methods
export async function GET(request: Request) { ... }
export async function POST(request: Request) { ... }
export async function DELETE(request: Request) { ... }
export async function PATCH(request: Request) { ... }
```

### Authentication Pattern

**CRITICAL**: All protected endpoints must use `authGuard()`:

```typescript
import { authGuard } from '@/lib/auth';
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const guard = await authGuard();
  if (!guard.ok) return guard.response; // 401 Unauthorized

  const { supabase, user } = guard;
  // ... use authenticated supabase client
}
```

### Supabase Client Usage

**DO**:
- ✅ Use `createServerSupabase()` from `@/lib/supabase/server`
- ✅ Use the `supabase` instance returned by `authGuard()`

**DON'T**:
- ❌ Never use `createBrowserSupabase()` in API routes
- ❌ Don't create unauthenticated server clients for protected routes

### Common Patterns

**Error Handling**:
```typescript
const { data, error } = await supabase.from('table').select('*');
if (error) {
  return NextResponse.json({ error: error.message }, { status: 500 });
}
return NextResponse.json(data);
```

**Query Parameters**:
```typescript
const { searchParams } = new URL(request.url);
const book = searchParams.get('book');
const chapter = searchParams.get('chapter');
```

**Request Body**:
```typescript
const body = await request.json();
const { verse_id, color } = body;
```

### Schema Architecture Notes

The API is transitioning from a **wide table** schema to a **normalized schema**:

**Legacy (Wide Table)**:
- `verses` table with columns: `korhrv`, `niv`, `kornrsv`, etc.
- Adding translations requires schema changes

**Normalized (Current)**:
- `translations` table - Metadata for each translation
- `verse_translations` table - Actual translated text
- `new_verses` table - Canonical verse structure
- Adding translations only requires data inserts

**API Impact**:
- `/api/v1/translations` uses normalized `translations` table
- `/api/v1/passages` may still use legacy schema (migration in progress)
- Always check current schema usage in route implementation

### Row Level Security (RLS)

User data tables (`notes`, `highlights`, `bookmarks`) are protected by Postgres RLS policies:

```sql
-- Policy example
CREATE POLICY "Users can only access their own data"
ON notes FOR ALL USING (auth.uid() = user_id);
```

Even with `authGuard()`, RLS provides defense-in-depth. No manual `user_id` filtering needed in queries.

## Dependencies

- **lib/auth** - `authGuard()` function for authentication
- **lib/supabase/server** - `createServerSupabase()` for server-side Supabase client
- **lib/constants** - Shared constants (translations, book metadata)
- **next/server** - `NextResponse` for API responses

## Version Strategy

- **v1**: Current stable API version
- Future versions (v2, v3) can be added as sibling directories
- Versioning in URL path allows backward compatibility during schema migrations
