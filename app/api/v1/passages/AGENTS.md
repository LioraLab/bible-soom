# Passages API Endpoint

<!-- Parent: ../AGENTS.md -->

## Purpose

Main endpoint for retrieving Bible passages for reading. This is the **most critical API endpoint** in the application - called by every `BiblePanel` component to fetch verse text.

## Key Files

- **route.ts** - GET endpoint for passage retrieval
  - Query params: `translation` (korHRV, NIV, etc.), `book` (English abbreviation like Gen, Matt), `chapter` (number)
  - Returns verse array with translated text from normalized schema
  - Public endpoint but may include user annotations (highlights, notes) if authenticated

## For AI Agents

### Endpoint Behavior

**URL Pattern**: `GET /api/v1/passages?translation=<code>&book=<abbr>&chapter=<num>`

**Example Request**:
```
GET /api/v1/passages?translation=korHRV&book=Gen&chapter=1
```

**Example Response**:
```json
{
  "translation": "korHRV",
  "translation_name": "개역개정",
  "book": "Gen",
  "book_name": "창세기",
  "chapter": 1,
  "verses": [
    { "id": "...", "chapter": 1, "verse": 1, "text": "태초에 하나님이..." },
    { "id": "...", "chapter": 1, "verse": 2, "text": "땅이 혼돈하고..." }
  ]
}
```

### Query Flow

The endpoint follows a **5-step validation and retrieval flow**:

1. **Validate Parameters** (lines 24-34)
   - Requires: `translation` (code) and `book` (abbr_eng)
   - Optional: `chapter` (defaults to 1)
   - Returns `400` if missing required params

2. **Verify Translation Exists** (lines 36-48)
   - Queries `translations` table by `code`
   - Returns `404` if translation not found
   - Retrieves `id`, `name`, `language` for later use

3. **Find Book by Abbreviation** (lines 50-75)
   - Queries `books` table by `abbr_eng` (e.g., "Gen", "Matt")
   - Eagerly loads `book_names` relation for multi-language support
   - Returns `404` if book not found

4. **Validate Chapter Range** (lines 79-85)
   - Checks if chapter is within valid range `1..book.chapters`
   - Returns `400` if out of range

5. **Fetch Verses with Translation** (lines 87-108)
   - Joins `verses` ← `verse_translations` via `translation_id`
   - Filters by `book_id`, `chapter`, `translation_id`
   - Orders by verse number ascending

6. **Format Response** (lines 110-131)
   - Determines appropriate book name based on translation language
   - Falls back to English name if translation language unavailable
   - Returns structured JSON with metadata + verse array

### Database Schema Usage

**Normalized Schema** (current implementation):

```
translations (code, name, language)
      ↓ (translation_id FK)
verse_translations (verse_id, translation_id, text)
      ↓ (verse_id FK)
verses (book_id, chapter, verse)
      ↓ (book_id FK)
books (abbr_eng, testament, chapters)
      ↓ (book_id FK)
book_names (book_id, language, name, abbr)
```

**Key Points**:
- `verses` table contains **structure only** (no text)
- `verse_translations` contains **actual text** per translation
- Multi-language book names via `book_names` table
- Translation's language extracted by `extractLanguageFromTranslation()` helper

### Language-Aware Book Names

**Book Name Resolution Logic** (lines 110-114):

1. Extract language from translation code (`extractLanguageFromTranslation()`)
   - Example: `korHRV` → `ko`, `NIV` → `en`, `zhCUV` → `zh`
2. Find book name in that language from `book_names` array
3. Fallback to English name if language not available
4. Final fallback to `abbr_eng` if no names found

**Why This Matters**: Korean translation shows "창세기", English shows "Genesis", Chinese would show "創世記" - all from the same endpoint.

### Performance Considerations

**Efficient Queries**:
- Uses `.single()` for book/translation lookups (expects exactly one result)
- Uses `.order()` for sorted verses (leverages DB index)
- Inner join on `verse_translations` ensures only verses with translations are returned

**Potential Optimizations**:
- Book metadata could be cached (66 books never change)
- Translation metadata could be cached (rarely changes)
- Chapter validation could use cached `BOOK_CHAPTERS` constant (currently queries DB)

### Error Cases

| Status | Condition | Example |
|--------|-----------|---------|
| `400` | Missing required params | No `translation` or `book` param |
| `400` | Invalid chapter number | `chapter=0` or `chapter=999` for Genesis |
| `404` | Translation not found | `translation=INVALID_CODE` |
| `404` | Book not found | `book=INVALID_ABBR` |
| `500` | Database error | Supabase query failure |

### Integration Points

**Called By**:
- `BiblePanel.tsx` - On mount and navigation (prev/next chapter, book change)
- `PassageClient.tsx` - When adding new panel with different translation

**Depends On**:
- `lib/supabase/server` - Server-side Supabase client creation
- `lib/books` - Type definitions (`BookWithNames`) and language extraction
- `translations`, `books`, `verses`, `verse_translations` database tables

### Common Modifications

**Adding User Annotations** (future enhancement):
If authenticated, could join user data (highlights, notes):

```typescript
// After authGuard() check
const { data } = await supabase
  .from('verses')
  .select(`
    *,
    verse_translations!inner(text),
    highlights(color),
    notes(content)
  `)
  .eq('highlights.user_id', user.id)
  .eq('notes.user_id', user.id);
```

**Caching Strategy**:
Since Bible text is immutable, responses could be cached aggressively:

```typescript
return new NextResponse(JSON.stringify(data), {
  headers: {
    'Cache-Control': 'public, max-age=31536000, immutable',
  },
});
```

## Dependencies

- **lib/supabase/server** - `createServerSupabase()` for route handler client
- **lib/books** - `BookWithNames` type, `extractLanguageFromTranslation()` helper
- **Supabase Tables**:
  - `translations` - Translation metadata
  - `books` - Book metadata (66 books)
  - `book_names` - Multi-language book names
  - `verses` - Canonical verse structure
  - `verse_translations` - Actual verse text per translation

## Testing Notes

**Manual Testing**:
```bash
# Korean translation, Genesis 1
curl "http://localhost:3000/api/v1/passages?translation=korHRV&book=Gen&chapter=1"

# English translation, Matthew 5
curl "http://localhost:3000/api/v1/passages?translation=NIV&book=Matt&chapter=5"

# Invalid cases
curl "http://localhost:3000/api/v1/passages?translation=INVALID&book=Gen&chapter=1"  # 404
curl "http://localhost:3000/api/v1/passages?book=Gen&chapter=1"  # 400
curl "http://localhost:3000/api/v1/passages?translation=korHRV&book=Gen&chapter=999"  # 400
```

**Expected Verse Count**:
- Genesis 1: 31 verses
- Matthew 5: 48 verses
- Psalm 119: 176 verses (longest chapter)

**Validation Checks**:
- All verses returned in ascending order
- No duplicate verses
- `book_name` matches translation language
- Verse IDs are valid UUIDs
