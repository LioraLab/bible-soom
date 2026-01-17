<!-- Parent: ../AGENTS.md -->
# Components - MyPage

## Purpose

User dashboard components for displaying and managing personal Bible study data.

## Key Files

Components that display user's saved highlights, notes, and bookmarks in an organized dashboard view.

## For AI Agents

### Dashboard Sections

**Highlights View**:
- Lists all highlighted verses grouped by color
- Shows verse reference (book, chapter, verse)
- Displays verse text with highlight color
- Click to navigate to verse in reading interface
- Option to remove highlight

**Notes View**:
- Lists all verses with notes
- Shows note preview (truncated if long)
- Displays verse reference and timestamp
- Click to expand full note or navigate to verse
- Edit/delete options

**Bookmarks View**:
- Lists all bookmarked verses
- Shows verse reference and text preview
- Sorted by most recent or by book order
- Click to navigate to verse
- Remove bookmark option

### Data Fetching Pattern

```typescript
// Fetch user data on mount
useEffect(() => {
  const fetchUserData = async () => {
    const [highlights, notes, bookmarks] = await Promise.all([
      fetch('/api/v1/highlights').then(r => r.json()),
      fetch('/api/v1/notes').then(r => r.json()),
      fetch('/api/v1/bookmarks').then(r => r.json())
    ]);
    setHighlights(highlights);
    setNotes(notes);
    setBookmarks(bookmarks);
  };
  fetchUserData();
}, []);
```

### Tab Navigation

Dashboard uses tabbed interface:
- **Highlights** tab - Color-coded verse highlights
- **Notes** tab - User's written notes
- **Bookmarks** tab - Saved verses
- **Settings** tab (optional) - User preferences

### Verse Reference Links

All verse references are clickable and navigate to:
```
/bible/{translation}/{book}/{chapter}#{verse}
```

Uses the user's preferred translation or defaults to korHRV.

### Empty States

When no data exists:
- Display encouraging message
- Show instructions on how to add highlights/notes/bookmarks
- Provide quick link to start reading

### Filtering and Search

**Color Filter** (Highlights):
- Filter by highlight color
- Toggle to show/hide specific colors

**Date Range** (Notes):
- Filter notes by creation date
- Sort by newest/oldest

**Book Filter** (All):
- Filter by testament (OT/NT)
- Filter by specific book

**Search** (Notes):
- Full-text search within note content
- Search by verse reference

## Dependencies

- **Internal**:
  - `app/api/v1/highlights` - Fetch user highlights
  - `app/api/v1/notes` - Fetch user notes
  - `app/api/v1/bookmarks` - Fetch user bookmarks
  - `hooks/useAuth` - Ensure user is authenticated
  - `components/ui/` - UI components (tabs, cards, buttons)
  - `lib/constants.ts` - HIGHLIGHT_BG_CLASSES for color rendering

- **External**:
  - Next.js `useRouter` for navigation
  - React hooks (useState, useEffect)

## Authentication

This is a **protected route**. The page should:
1. Check auth status via `useAuth()`
2. Redirect to `/login` if not authenticated
3. Show loading state while checking auth

```typescript
const { user, loading } = useAuth();

if (loading) return <LoadingSpinner />;
if (!user) {
  router.push('/login');
  return null;
}
```

## Common Modifications

- **Export Data**: Add button to export notes/highlights as JSON or Markdown
- **Statistics**: Show stats (total verses highlighted, notes written, etc.)
- **Recent Activity**: Add timeline of recent highlights/notes
- **Sharing**: Allow sharing specific notes or collections
- **Tags**: Add tagging system for organizing notes
- **Study Plans**: Create and track reading plans

## Related Files

- `app/mypage/page.tsx` - MyPage route that renders these components
- `components/passage/passage-client.tsx` - Where highlights/notes are created
- `app/api/v1/highlights`, `/notes`, `/bookmarks` - Data sources

## Performance Considerations

- Implement pagination for users with many notes (>100)
- Use virtual scrolling for large lists
- Cache fetched data to avoid re-fetching on tab switches
- Debounce search input
