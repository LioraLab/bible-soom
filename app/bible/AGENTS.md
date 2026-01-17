<!-- Parent: ../AGENTS.md -->
# App - Bible (Dynamic Routes)

## Purpose

Dynamic Bible reading routes with nested parameters for translation, book, and chapter selection.

## Directory Structure

```
bible/
  └── [translation]/
      └── [book]/
          └── [chapter]/
              └── page.tsx  ← Main reading interface
```

## Route Pattern

```
/bible/{translation}/{book}/{chapter}
```

**Examples**:
- `/bible/korHRV/Gen/1` - Genesis chapter 1 in Korean HRV
- `/bible/NIV/Matt/5` - Matthew chapter 5 in NIV
- `/bible/korHRV/Ps/23` - Psalm 23 in Korean HRV

**Parameters**:
- `translation` - Translation code (korHRV, NIV, etc.)
- `book` - English book abbreviation (Gen, Exo, Matt, Rom, etc.)
- `chapter` - Chapter number (1-based)

## For AI Agents

### Page Component

The final `page.tsx` at `[chapter]/` level:
- Receives params: `{ translation, book, chapter }`
- Validates parameters (book exists, chapter within range)
- Renders `PassageClient` component with initial panel config
- Server-side rendering for SEO

### PassageClient Integration

```typescript
// app/bible/[translation]/[book]/[chapter]/page.tsx
export default function BiblePage({ params }: Props) {
  const { translation, book, chapter } = params;

  const initialPanel = {
    id: 'panel-1',
    translation,
    book,
    chapter: parseInt(chapter),
    verses: [] // Fetched by PassageClient
  };

  return <PassageClient initialPanels={[initialPanel]} />;
}
```

### URL Navigation

Users can navigate by:
- **URL editing** - Change translation/book/chapter in address bar
- **Panel navigation** - Previous/Next chapter buttons in PanelHeader
- **Book selector** - Dropdown in PanelHeader to change book
- **Translation selector** - Dropdown to switch translation

All navigation updates the URL using Next.js router.

### Validation Rules

**Translation**:
- Must exist in translations table
- Fallback to korHRV if invalid

**Book**:
- Must be valid abbreviation (Gen, Exo, Matt, etc.)
- Case-insensitive
- Return 404 if invalid

**Chapter**:
- Must be within range for book (1 to BOOK_CHAPTERS[book])
- Return 404 if out of range

### UI 한국어 고정 정책

**2026-01 적용**: 번역본에 관계없이 모든 UI 요소는 한국어로 표시됩니다.

- **책 이름**: 항상 한국어 (창세기, 마태복음 등)
- **장 표시**: 항상 '{n}장' 형식
- **URL의 번역본 코드**: 성경 본문 언어만 결정 (UI는 영향 없음)

### SEO Considerations

Generate metadata for each page:
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { translation, book, chapter } = params;
  return {
    title: `${book} ${chapter} - ${translation} | Bible Soom`,
    description: `Read ${book} chapter ${chapter} in ${translation} translation`
  };
}
```

## Dependencies

- **Internal**:
  - `components/passage/passage-client.tsx` - Main reading interface
  - `lib/constants.ts` - BOOK_CHAPTERS for validation
  - `lib/supabase/server.ts` - Server-side Supabase client
  - `app/api/v1/passages` - Verse data source

- **External**:
  - Next.js dynamic routes
  - Next.js metadata API

**제거된 의존성** (2026-01):
- `lib/books`의 `extractLanguageFromTranslation()` - UI 한국어 고정으로 불필요

## Common Modifications

- **Add Reading Plans**: Support `/bible/plan/{planId}` routes
- **Add Parallel View**: URL support for multiple translations `/bible/korHRV+NIV/Gen/1`
- **Add Verse Anchor**: Support `#verse` hash for scrolling `/bible/korHRV/Gen/1#3`
- **Add Audio**: Include audio player for chapter listening

## Related Files

- `components/passage/passage-client.tsx` - Renders the reading interface
- `components/passage/PanelHeader.tsx` - Navigation controls that update URL
- `lib/constants.ts` - Book and chapter metadata
