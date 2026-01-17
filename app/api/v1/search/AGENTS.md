# Search API Directory

<!-- Parent: ../AGENTS.md -->

## Purpose

Full-text search endpoints for Bible text across translations. Provides case-insensitive search with verse context including book name, chapter, and verse numbers.

## Key Files

- **route.ts** - GET endpoint for Bible text search
  - Query Parameters:
    - `q` (required) - Search query string
    - `translation` (required) - Translation code (e.g., 'korHRV', 'NIV')
  - Returns up to 50 matching verses with full context
  - Uses PostgreSQL ILIKE for case-insensitive search
  - Includes book name in translation's language

## For AI Agents

### Endpoint Details

**GET /api/v1/search**

**Authentication**: Public endpoint (no auth required)

**Query Parameters**:
- `q` (string, required) - Search term to find in verse text
- `translation` (string, required) - Translation code (korHRV, NIV, etc.)

**Response Format**:
```json
{
  "results": [
    {
      "id": "verse-uuid",
      "text": "verse text containing search term",
      "book": "창세기",
      "book_abbr_eng": "Gen",
      "chapter": 1,
      "verse": 1
    }
  ]
}
```

**Error Responses**:
- `400` - Missing required parameters (q or translation)
- `404` - Translation code not found in database
- `500` - Database error

### Database Query Pattern

**Multi-step process**:

1. **Lookup translation ID**:
   ```typescript
   const { data: translationData } = await supabase
     .from("translations")
     .select("id, code, name, language")
     .eq("code", translationCode)
     .single();
   ```

2. **Search verse_translations with joins**:
   ```typescript
   const { data } = await supabase
     .from("verse_translations")
     .select(`
       text,
       verse_id,
       verses!inner (
         id, chapter, verse, book_id,
         books!inner (
           id, abbr_eng,
           book_names (language, name)
         )
       )
     `)
     .eq("translation_id", translationData.id)
     .ilike("text", `%${q}%`)
     .limit(50);
   ```

3. **Format results with localized book names**:
   - Extracts language from translation code using `extractLanguageFromTranslation()`
   - Finds matching `book_names` entry for translation's language
   - Falls back to English name if translation language not available

### Performance Optimizations

**GIN Index**: A GIN (Generalized Inverted Index) exists on `verse_translations.text` for fast full-text search performance.

**Query Limit**: Hard-coded 50 result limit prevents excessive data transfer.

**ILIKE Performance**: PostgreSQL ILIKE operator provides case-insensitive search with reasonable performance on indexed text columns.

### Search Features

**Current Capabilities**:
- Case-insensitive substring matching
- Translation-specific search (searches only one translation at a time)
- Localized book names in results (matches translation language)
- Full verse context (book, chapter, verse number)
- English book abbreviation for URL routing

**Limitations**:
- No multi-translation simultaneous search
- No fuzzy matching or typo tolerance
- No phrase search with quotes
- No advanced operators (AND, OR, NOT)
- No search result highlighting
- No pagination (fixed 50 result limit)

### Localization Logic

**Book Name Display**:
1. Extract language from translation code (e.g., 'korHRV' → 'ko', 'NIV' → 'en')
2. Find book_names entry matching translation's language
3. Fallback hierarchy:
   - Primary: Translation's language name
   - Fallback 1: English name
   - Fallback 2: English abbreviation (abbr_eng)

**Why This Matters**: Korean users searching Korean translations see "창세기", English users see "Genesis".

### Future Enhancement Opportunities

**Potential Improvements**:
- PostgreSQL `tsvector`/`tsquery` for stemming and ranking
- Multi-translation search (search across all translations simultaneously)
- Pagination with cursor-based navigation
- Search result highlighting (mark matched terms in text)
- Fuzzy matching for typo tolerance
- Advanced query syntax (phrase search, boolean operators)
- Search filters (testament, book range, chapter range)
- Search analytics (popular search terms, zero-result queries)

## Dependencies

- **lib/supabase/server** - `createServerSupabase()` for database access
- **lib/books** - `extractLanguageFromTranslation()` for language detection
- **next/server** - `NextRequest`, `NextResponse` for API handling
- **Database Tables**:
  - `translations` - Translation metadata lookup
  - `verse_translations` - Search target (indexed text column)
  - `verses` (aliased as `new_verses`) - Verse structure (chapter, verse)
  - `books` (aliased as `new_books`) - Book metadata (abbr_eng)
  - `book_names` - Multi-language book names

## Usage Example

**Client-side fetch**:
```typescript
const response = await fetch(
  `/api/v1/search?q=${encodeURIComponent('사랑')}&translation=korHRV`
);
const { results } = await response.json();
```

**Typical use case**: Search bar in Bible reader app, instant search results as user types.
