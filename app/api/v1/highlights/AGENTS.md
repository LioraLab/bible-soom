# Highlights API Endpoints

<!-- Parent: ../AGENTS.md -->

## Purpose

API endpoints for managing verse highlights (user annotation feature). Allows users to create, retrieve, update, and delete color-coded highlights on Bible verses.

## Key Files

### route.ts
Main CRUD operations for highlights:
- **GET**: List all highlights for authenticated user
  - Returns highlights with joined verse/book data
  - Ordered by creation date (newest first)
  - Response format includes book abbreviation, chapter, verse
- **POST**: Create or update highlight (upsert pattern)
  - Body: `{ verseId: string, color?: string }`
  - Default color: "yellow"
  - Uses upsert due to `(user_id, verse_id)` UNIQUE constraint
- **DELETE**: Remove highlight by verse_id
  - Body: `{ verseId: string }`
  - Ensures user only deletes their own highlights

## Subdirectories

### [id]/
Dynamic route for operations by highlight UUID:
- **DELETE**: Remove highlight by ID (alternative to verse_id deletion)
  - URL param: `id` (highlight UUID)
  - RLS ensures user can only delete their own highlights

## For AI Agents

### Authentication
- **ALL endpoints REQUIRE authentication** via `authGuard()`
- Returns 401 if unauthenticated
- User context provided: `{ supabase, user }`

### Data Model
```typescript
Highlight {
  id: UUID (auto-generated)
  user_id: UUID (FK to users, from auth context)
  verse_id: string (format: "Gen_1_1", "Matt_5_3")
  color: string (from HIGHLIGHT_COLORS)
  created_at: timestamptz
}
```

### Key Constraints
- **UNIQUE**: `(user_id, verse_id)` - one highlight per verse per user
- **RLS**: Row-Level Security ensures users only access their own data
- **verse_id format**: `{book_abbr}_{chapter}_{verse}` (e.g., 'Gen_1_1', 'Rom_8_28')

### Upsert Pattern
```typescript
// POST /api/v1/highlights
await supabase
  .from("highlights")
  .upsert({ user_id, verse_id, color })
  // If (user_id, verse_id) exists → UPDATE color
  // If not exists → INSERT new highlight
```

### Available Colors
Colors defined in `lib/constants.ts` → `HIGHLIGHT_COLORS`:
- yellow (default)
- green
- blue
- pink
- purple

### Response Formats
**GET /api/v1/highlights**:
```json
{
  "highlights": [
    {
      "id": "uuid",
      "color": "yellow",
      "verse_id": "Gen_1_1",
      "verses": {
        "book": "Gen",
        "chapter": 1,
        "verse": 1
      }
    }
  ]
}
```

**POST /api/v1/highlights**:
```json
{
  "highlight": {
    "id": "uuid",
    "user_id": "uuid",
    "verse_id": "Gen_1_1",
    "color": "yellow",
    "created_at": "2026-01-17T..."
  }
}
```

### Error Handling
- 400: Missing required fields (`verseId`)
- 401: Unauthenticated (authGuard failure)
- 500: Database errors (passed through from Supabase)

## Dependencies

### Internal
- `lib/auth` - `authGuard()` for authentication
- `lib/supabase/server` - Server-side Supabase client (via authGuard)
- `lib/constants` - `HIGHLIGHT_COLORS` constant

### Database
- `highlights` table with RLS policies
- `verses` table (joined for GET endpoint)
- `books` table (joined via verses for book abbreviation)

### External
- `next/server` - NextRequest, NextResponse

## Notes

- The main route.ts includes DELETE, but the recommended deletion method is via `[id]/route.ts` for UUID-based deletion
- verse_id deletion (main route.ts DELETE) is kept for backward compatibility
- All endpoints respect RLS - no need for manual user_id filtering beyond what's already in the code
- The upsert pattern automatically handles "create if not exists, update if exists" logic
