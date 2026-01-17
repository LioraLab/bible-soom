<!-- Parent: ../AGENTS.md -->
# App - Books

## Purpose

Book catalog page for browsing and selecting Bible books.

## Key Files

- **page.tsx** - Books catalog page component

## For AI Agents

### Page Overview

Displays all 66 Bible books organized by testament (Old Testament and New Testament), allowing users to browse and select a book to read.

### Data Flow

1. Fetch book list from `/api/v1/books?language=ko`
2. Group books by testament (OT: 39 books, NT: 27 books)
3. Display with chapter counts and book names
4. On book click, navigate to `/bible/{translation}/{book}/1`

### UI Layout

**Testament Sections**:
- **Old Testament** (39 books)
  - Further grouped by category (optional):
    - Law (5 books): Gen-Deut
    - History (12 books): Josh-Esth
    - Poetry (5 books): Job-Song
    - Major Prophets (5 books): Isa-Dan
    - Minor Prophets (12 books): Hos-Mal

- **New Testament** (27 books)
  - Grouped by category (optional):
    - Gospels (4 books): Matt-John
    - History (1 book): Acts
    - Paul's Epistles (13 books): Rom-Heb
    - General Epistles (8 books): Jas-Jude
    - Prophecy (1 book): Rev

### Book Card Display

Each book shows:
- Book name (localized, e.g., "창세기" for Genesis)
- English abbreviation (Gen, Exo, Matt)
- Chapter count (e.g., "50 chapters")
- Optional: Book description or first verse

### Navigation

On book selection:
```typescript
router.push(`/bible/${preferredTranslation}/${bookAbbr}/1`)
```

Uses user's preferred translation (from localStorage or auth profile) or defaults to korHRV.

### Search/Filter Features

**Search**:
- Filter books by name (Korean or English)
- Highlight matching characters

**Testament Filter**:
- Toggle to show OT only, NT only, or both

**Category Filter** (optional):
- Filter by book category (Law, History, Poetry, etc.)

## Dependencies

- **Internal**:
  - `app/api/v1/books` - Book metadata endpoint
  - `components/books/` - Book catalog components
  - `components/ui/` - UI components
  - `lib/constants.ts` - BOOK_CHAPTERS

- **External**:
  - Next.js `useRouter` for navigation
  - React hooks (useState, useEffect)

## Common Modifications

- **Add Book Summaries**: Display brief introduction for each book
- **Add Reading Plans**: Link to pre-defined reading plans
- **Add Statistics**: Show user's reading progress per book
- **Add Favorites**: Allow users to mark favorite books
- **Add Recently Read**: Show recently accessed books at top

## Related Files

- `components/books/` - Reusable book catalog components
- `app/api/v1/books` - Book metadata API
- `lib/constants.ts` - Book metadata and constants
