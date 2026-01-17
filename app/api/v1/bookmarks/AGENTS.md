# Bookmarks API Endpoints

<!-- Parent: ../AGENTS.md -->

## Purpose

API endpoints for managing verse bookmarks. Provides CRUD operations for users to bookmark specific Bible verses for quick reference.

## Key Files

- **route.ts** - Main bookmark operations
  - `GET`: List all bookmarks for authenticated user (ordered by created_at DESC, includes verse metadata with book abbreviation)
  - `POST`: Create/update bookmark for a verse (uses upsert to prevent duplicates)
  - `DELETE`: Remove bookmark by verse_id
- **[id]/route.ts** - Dynamic route for bookmark operations by ID
  - `DELETE`: Remove bookmark by bookmark ID

## Subdirectories

- **[id]/** - Dynamic route for individual bookmark operations

## For AI Agents

### Authentication & Security
- **REQUIRES AUTH**: All endpoints use `authGuard()` middleware
- **RLS Policies**: Row Level Security ensures users only access their own bookmarks
- All operations filtered by `user_id`

### Data Model
- **Table**: `bookmarks`
- **Unique Constraint**: `(user_id, verse_id)` - prevents duplicate bookmarks for same verse
- **verse_id Format**: `{book_abbr}_{chapter}_{verse}` (e.g., "Gen_1_1")
- **Simple Flags**: Bookmarks store only verse_id and created_at (no additional metadata)

### API Patterns
- **GET /api/v1/bookmarks**: Returns bookmarks with joined verse metadata (book, chapter, verse)
- **POST /api/v1/bookmarks**: Body `{ verseId: string }` - Uses upsert pattern (idempotent)
- **DELETE /api/v1/bookmarks**: Body `{ verseId: string }` - Delete by verse_id
- **DELETE /api/v1/bookmarks/[id]**: Delete by bookmark ID

### Implementation Notes
- GET endpoint uses nested joins: `bookmarks → verses → books` to retrieve book abbreviation
- Response formatting extracts nested data into flat structure
- Both DELETE endpoints available (by verse_id OR by bookmark id) for flexibility
- Error responses follow standard pattern: `{ error: string }` with appropriate HTTP status

## Dependencies

- **lib/auth**: `authGuard()` for authentication
- **lib/supabase/server**: Server-side Supabase client
- **Database Tables**:
  - `bookmarks` (with RLS policies)
  - `verses` (for joins)
  - `books` (for book abbreviations)
