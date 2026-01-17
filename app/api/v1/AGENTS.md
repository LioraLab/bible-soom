# API v1 Directory

<!-- Parent: ../AGENTS.md -->

## Purpose

Version 1 REST API endpoints for Bible data retrieval and user annotation management. All endpoints follow RESTful conventions and use Next.js App Router route handlers.

## Key Files

None at this level. All API implementations are in subdirectories.

## Subdirectories

- **books/** - Book metadata endpoints (66 books, testament info)
- **passages/** - Bible passage retrieval (main reading endpoint, supports multiple translations)
- **translations/** - Available translations list (dynamic from normalized DB schema)
- **search/** - Full-text search across Bible text (supports multiple translations)
- **highlights/** - Highlight CRUD operations (requires authentication)
- **notes/** - Note CRUD operations (requires authentication)
- **bookmarks/** - Bookmark CRUD operations (requires authentication)

## For AI Agents

### Endpoint Classification

**Public Endpoints** (no auth required):
- `GET /api/v1/books` - List all 66 books
- `GET /api/v1/passages` - Retrieve Bible text (may show more data if authenticated)
- `GET /api/v1/translations` - List available translations
- `GET /api/v1/search` - Search Bible text

**Protected Endpoints** (MUST use `authGuard()`):
- All endpoints under `/highlights`, `/notes`, `/bookmarks`
- Require valid Supabase auth token in request

### Common API Pattern

All endpoints follow this structure:

```typescript
// Public endpoint example
export async function GET(request: Request) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);

  const { data, error } = await supabase
    .from('table')
    .select('*');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// Protected endpoint example
export async function POST(request: Request) {
  const guard = await authGuard();
  if (!guard.ok) return guard.response; // Returns 401

  const { supabase, user } = guard;
  const body = await request.json();

  const { data, error } = await supabase
    .from('user_data_table')
    .insert({ ...body, user_id: user.id });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

### Schema Usage - Normalized Architecture

**CRITICAL**: All v1 endpoints use the **normalized schema**:

**Core Tables**:
- `translations` - Translation metadata (code, name, language, year, etc.)
- `verse_translations` - Actual verse text (verse_id + translation_id + text)
- `new_verses` - Canonical verse structure (book_id, chapter, verse)
- `new_books` - Book metadata (66 books, testament, abbr_eng)
- `book_names` - Multi-language book names

**User Data Tables** (RLS-protected):
- `highlights` - User highlights (user_id, verse_id, color)
- `notes` - User notes (user_id, verse_id, content)
- `bookmarks` - User bookmarks (user_id, verse_id)

**Legacy Tables** (deprecated, for backward compatibility only):
- `verses` - Wide table with translation columns (korhrv, niv, etc.)
- `books` - Old book table with Korean names

### Query Patterns

**Fetch passage with translation**:
```typescript
const { data } = await supabase
  .from('verse_translations')
  .select(`
    text,
    verse:new_verses!inner(chapter, verse, book:new_books!inner(abbr_eng))
  `)
  .eq('verse.book.abbr_eng', 'Gen')
  .eq('verse.chapter', 1)
  .eq('translation.code', 'korHRV')
  .order('verse.verse', { ascending: true });
```

**Fetch available translations**:
```typescript
const { data } = await supabase
  .from('translations')
  .select('code, name, language, year')
  .eq('available', true)
  .order('display_order');
```

**User data with RLS**:
```typescript
// RLS automatically filters by auth.uid() = user_id
// No need to manually add .eq('user_id', user.id)
const { data } = await supabase
  .from('highlights')
  .select('*')
  .eq('verse_id', verseId);
```

### Security - Defense in Depth

**Two-layer security for user data endpoints**:

1. **authGuard()** - Application-level check
   - Validates Supabase auth token
   - Returns authenticated supabase client
   - Returns 401 if token invalid/missing

2. **Row Level Security (RLS)** - Database-level enforcement
   - Postgres policies enforce `auth.uid() = user_id`
   - Prevents data leaks even if authGuard bypassed
   - Automatically applied to all queries

**DO NOT** manually filter by `user_id` in protected endpoints - RLS handles this automatically.

### Error Handling

**Standard error response format**:
```typescript
return NextResponse.json(
  { error: 'Human-readable error message' },
  { status: 400 | 401 | 404 | 500 }
);
```

**Status codes**:
- `200` - Success
- `400` - Bad request (invalid parameters)
- `401` - Unauthorized (authGuard failed)
- `404` - Not found
- `500` - Server error (database error, unexpected exception)

### Migration Notes

**Current State**: Fully migrated to normalized schema for v1 endpoints.

**Legacy Support**: `lib/constants.ts` contains `TRANSLATION_COLUMNS` for backward compatibility, but should NOT be used in new code.

**Adding New Translations**:
1. Insert into `translations` table with metadata
2. Import verse data into `verse_translations` table
3. UI automatically picks up new translation (no code changes needed)

## Dependencies

- **lib/auth** - `authGuard()` for protected endpoints
- **lib/supabase/server** - `createServerSupabase()` for server-side Supabase client
- **lib/constants** - Legacy translation mappings (deprecated)
- **next/server** - `NextResponse` for API responses
- **Supabase Database** - PostgreSQL with RLS policies

## API Versioning

- **Current**: v1 (stable, normalized schema)
- **Future**: v2 can be added as sibling directory without breaking v1 clients
- Version in URL path (`/api/v1/...`) enables gradual migration
