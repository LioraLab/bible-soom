# Books API Directory

<!-- Parent: ../AGENTS.md -->

## Purpose

API endpoint for retrieving Bible book metadata including names, chapter counts, testament classification, and multilingual book names. Supports flexible querying by testament, language, and translation code.

## Key Files

- **route.ts** - GET endpoint for book list
  - Query params: `testament` (OT/NT), `language` (ko/en/zh/ja), `translation` (korHRV/NIV/etc)
  - Returns array of 66 Bible books with multilingual names from `books` + `book_names` tables
  - Adds dynamic `name` field based on translation/language preference
  - Uses normalized schema (`books` + `book_names` join)

## For AI Agents

### Endpoint Details

**Endpoint**: `GET /api/v1/books`

**Authentication**: Public (no auth required)

**Query Parameters**:
- `testament` (optional): Filter by "OT" or "NT"
- `language` (optional): Language code for book names (ko, en, zh, ja)
- `translation` (optional): Translation code to determine book name language (korHRV, NIV, etc.)

**Response Format**:
```json
{
  "books": [
    {
      "id": "uuid",
      "abbr_eng": "Gen",
      "testament": "OT",
      "book_order": 1,
      "chapters": 50,
      "name": "창세기",  // Dynamically added based on translation/language
      "book_names": [
        { "id": "uuid", "book_id": "uuid", "language": "ko", "name": "창세기", "abbr": "창" },
        { "id": "uuid", "book_id": "uuid", "language": "en", "name": "Genesis", "abbr": "Gen" }
      ]
    }
  ]
}
```

### Book Name Resolution Logic

**UI 한국어 고정 정책** (2026-01 적용):

UI는 항상 한국어로 표시되므로 `translation`/`language` 파라미터와 관계없이 항상 한국어 책 이름을 반환합니다.

1. `book_names`에서 `language='ko'`인 항목 검색
2. Fallback → `abbr_eng` (영문 약어)

**참고**: `translation`, `language` 파라미터는 하위 호환성을 위해 유지되지만 무시됩니다.

### Database Schema

**Tables Used**:
- `books` - 66 Bible books with metadata
  - `id`, `abbr_eng`, `testament`, `book_order`, `chapters`
- `book_names` - Multilingual book names
  - `book_id` (FK to books), `language`, `name`, `abbr`

**Query Pattern**:
```typescript
supabase
  .from("books")
  .select(`
    id, abbr_eng, testament, book_order, chapters,
    book_names (id, book_id, language, name, abbr)
  `)
  .order("book_order", { ascending: true })
  .eq("testament", testament)  // Optional filter
```

### Usage Examples

**Get all books (Korean names)**:
```
GET /api/v1/books
```

**Get OT books with English names**:
```
GET /api/v1/books?testament=OT&language=en
```

**Get books with names matching translation**:
```
GET /api/v1/books?translation=NIV  // Returns English names
GET /api/v1/books?translation=korHRV  // Returns Korean names
```

### Integration Points

- **PassageClient** - Uses this endpoint to populate book navigation dropdowns
- **PanelHeader** - Fetches book list for each panel's book selector
- **lib/books** - Helper functions `extractLanguageFromTranslation()` and `getBookNameByTranslation()`

### Error Handling

- **500**: Database query failure
  - Returns `{ error: error.message }`
- **Empty result**: Returns `{ books: [] }` (not an error)

## Dependencies

- **lib/supabase/server** - `createServerSupabase()` for server-side client
- **next/server** - `NextRequest`, `NextResponse`

**제거된 의존성** (2026-01):
- `lib/books`의 `extractLanguageFromTranslation()`, `getBookNameByTranslation()` - UI 한국어 고정으로 불필요
- **Supabase Database**:
  - `books` table (66 rows)
  - `book_names` table (multilingual book names)

## Notes

- **Normalized schema**: Uses join pattern instead of wide table
- **Multilingual support**: Single query returns all languages, client-side filtering optional
- **Testament ordering**: Books ordered by `book_order` (1-66), matches traditional Bible order
- **No caching**: Each request hits database (consider adding cache headers if needed)
- **Book count**: Always returns 66 books (39 OT + 27 NT) unless filtered by testament
