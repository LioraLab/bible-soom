<!-- Parent: ../AGENTS.md -->
# Components - Books

## Purpose

Book catalog components for browsing and selecting Bible books.

## Key Files

These components display the 66 Bible books organized by testament (Old Testament/New Testament), allowing users to navigate to specific books for reading.

## For AI Agents

### Component Responsibilities
- Display book list organized by testament (OT: 39 books, NT: 27 books)
- Show chapter counts for each book
- Handle book selection and navigation to reading interface
- Support multiple languages for book names via `/api/v1/books` endpoint

### Data Flow
1. Fetch book metadata from `/api/v1/books?language=ko` (or other language)
2. Group books by testament
3. Display with chapter counts from `BOOK_CHAPTERS` constant
4. On book click, navigate to `/bible/{translation}/{book_abbr}/1`

### Integration Points
- **API**: `/api/v1/books` - Fetches book metadata with localized names
- **Navigation**: Links to `app/bible/[translation]/[book]/[chapter]/`
- **Constants**: `lib/constants.ts` - BOOK_CHAPTERS for chapter counts
- **UI Components**: Uses components from `components/ui/`

### Common Modifications
- **Add Book Descriptions**: Extend API response to include book summaries
- **Add Book Categories**: Group by genre (Law, History, Poetry, Prophets, Gospels, Epistles)
- **Search/Filter**: Add search input to filter books by name
- **Favorites**: Allow users to mark favorite books for quick access

## Dependencies

- **Internal**:
  - `app/api/v1/books` - Book metadata endpoint
  - `components/ui/` - UI components (buttons, cards, etc.)
  - `lib/constants.ts` - BOOK_CHAPTERS constant
  - `lib/books.ts` - Book utilities

- **External**:
  - Next.js Link component for navigation
  - React hooks (useState, useEffect)

## Related Files

- `app/books/page.tsx` - Books catalog page route
- `lib/constants.ts` - Book metadata and constants
