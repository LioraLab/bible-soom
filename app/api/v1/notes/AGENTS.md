# Notes API Endpoints

<!-- Parent: ../AGENTS.md -->

## Purpose

API endpoints for managing user verse notes with markdown support. Notes are personal annotations that users can attach to specific Bible verses.

## Key Files

### route.ts
**GET Endpoint** - Retrieve all notes for authenticated user
- Returns notes with verse metadata (book abbreviation, chapter, verse)
- Sorted by `updated_at` descending (most recent first)
- Joins with `verses` and `books` tables to provide context

**POST Endpoint** - Create or update note
- Uses **upsert pattern** to handle UNIQUE constraint on `(user_id, verse_id)`
- If note exists for verse, updates content; otherwise creates new note
- Automatically sets `updated_at` timestamp

## Subdirectories

### [id]/
Dynamic route for note operations by ID.

**Files:**
- `route.ts` - PUT (update content), DELETE (remove note)

**PUT Endpoint** - Update note content
- Updates `content` and `updated_at` fields
- Enforces ownership via `eq("user_id", user.id)`

**DELETE Endpoint** - Remove note
- Soft delete via RLS policies
- Enforces ownership via `eq("user_id", user.id)`

## For AI Agents

### Authentication
- **ALL ENDPOINTS REQUIRE AUTH** - Use `authGuard()` from `@/lib/auth`
- Returns `{ supabase, user }` on success, error response on failure

### Database Schema
```typescript
notes {
  id: UUID (primary key)
  user_id: UUID (foreign key to auth.users)
  verse_id: UUID (foreign key to verses table)
  content: TEXT (markdown)
  created_at: TIMESTAMPTZ
  updated_at: TIMESTAMPTZ
  UNIQUE(user_id, verse_id)  // One note per verse per user
}
```

### RLS Policies
- Users can only access their own notes (`auth.uid() = user_id`)
- Double protection: RLS + application-level `eq("user_id", user.id)`

### verse_id Format
- References `verses.id` (UUID)
- NOT the string format `{book_abbr}_{chapter}_{verse}` mentioned in requirements
- Actual implementation uses database UUID references

### Upsert Pattern
```typescript
// POST endpoint uses upsert to handle duplicate constraint
await supabase.from("notes").upsert({
  user_id: user.id,
  verse_id: verseId,  // UUID from verses table
  content,
  updated_at: new Date().toISOString()
});
```

### Response Formats
**GET Response:**
```json
{
  "notes": [
    {
      "id": "uuid",
      "content": "markdown text",
      "verse_id": "verse-uuid",
      "updated_at": "ISO timestamp",
      "verses": {
        "book": "Gen",
        "chapter": 1,
        "verse": 1
      }
    }
  ]
}
```

**POST/PUT Response:**
```json
{
  "note": { /* note object */ }
}
```

**DELETE Response:**
```json
{
  "ok": true
}
```

## Dependencies

- `@/lib/auth` - `authGuard()` for authentication
- `@/lib/supabase/server` - Server-side Supabase client
- Supabase tables: `notes`, `verses`, `books`
- RLS policies on `notes` table

## Common Patterns

1. **All operations enforce ownership** - `eq("user_id", user.id)`
2. **Auto-timestamp updates** - `updated_at: new Date().toISOString()`
3. **Error handling** - Return 500 with error message on database failure
4. **Validation** - Check required fields before database operations

## Modification Notes

When adding features:
- Maintain upsert pattern for POST (UNIQUE constraint enforcement)
- Always include ownership check (`eq("user_id", user.id)`)
- Keep `updated_at` auto-update on all write operations
- Preserve markdown support in `content` field
