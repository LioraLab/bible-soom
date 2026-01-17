<!-- Parent: ../AGENTS.md -->
# App - My Page

## Purpose

User dashboard page displaying personal Bible study data (highlights, notes, bookmarks).

## Key Files

- **page.tsx** - My Page route component

## For AI Agents

### Page Overview

Protected route that displays the user's saved Bible study data in an organized dashboard. Requires authentication.

### Authentication Guard

```typescript
const { user, loading } = useAuth();

if (loading) {
  return <LoadingSpinner />;
}

if (!user) {
  router.push('/login?returnUrl=/mypage');
  return null;
}
```

### Dashboard Sections

The page uses tabbed interface from `components/mypage/`:

**Highlights Tab**:
- Lists all highlighted verses grouped by color
- Shows verse reference and text
- Click to navigate to verse
- Option to change color or remove highlight

**Notes Tab**:
- Lists all verses with notes
- Shows note preview (first 100 characters)
- Displays timestamp and verse reference
- Click to view full note or navigate to verse
- Edit/delete options

**Bookmarks Tab**:
- Lists all bookmarked verses
- Shows verse reference and text preview
- Sorted by most recent or book order
- Click to navigate to verse
- Remove bookmark option

**Settings Tab** (optional):
- User preferences (default translation, font size, theme)
- Account settings (email, password)
- Privacy settings
- Data export

### Data Fetching

```typescript
useEffect(() => {
  const fetchUserData = async () => {
    setLoading(true);

    const [highlights, notes, bookmarks] = await Promise.all([
      fetch('/api/v1/highlights').then(r => r.json()),
      fetch('/api/v1/notes').then(r => r.json()),
      fetch('/api/v1/bookmarks').then(r => r.json())
    ]);

    setHighlights(highlights);
    setNotes(notes);
    setBookmarks(bookmarks);
    setLoading(false);
  };

  fetchUserData();
}, []);
```

### Statistics Display (Optional)

Show user engagement metrics:
- Total verses highlighted: 127
- Total notes written: 45
- Total bookmarks: 89
- Most highlighted book: Psalms
- Recent activity: Last active 2 hours ago

### Empty States

When user has no data:
- Display encouraging message
- Show tutorial on how to add highlights/notes/bookmarks
- Provide "Start Reading" button linking to `/bible/korHRV/Gen/1`

### Search and Filter

**Search**:
- Search within notes by text content
- Search by verse reference

**Filter**:
- Filter highlights by color
- Filter by book or testament
- Filter by date range (for notes)

**Sort**:
- Sort by most recent
- Sort by book order
- Sort by most edited (notes)

### Verse Navigation

All verse references are clickable:
```typescript
const handleVerseClick = (verse: { book: string; chapter: number; verse: number; translation: string }) => {
  router.push(`/bible/${verse.translation}/${verse.book}/${verse.chapter}#${verse.verse}`);
};
```

### Data Management Actions

**Export Data**:
- Export all data as JSON
- Export notes as Markdown
- Download backup

**Delete Data**:
- Delete selected items
- Bulk delete by filter
- Clear all data (with confirmation)

## Dependencies

- **Internal**:
  - `app/api/v1/highlights`, `/notes`, `/bookmarks` - Data sources
  - `components/mypage/` - Dashboard components
  - `hooks/useAuth` - Authentication check
  - `components/ui/` - UI components

- **External**:
  - Next.js `useRouter` for navigation
  - React hooks (useState, useEffect)

## Performance Considerations

- Implement pagination for users with >100 items
- Use virtual scrolling for large lists
- Cache fetched data to avoid re-fetching
- Lazy load tabs (only fetch when tab is active)
- Debounce search input

## Common Modifications

- **Add Study Plans**: Create and track reading plans
- **Add Goals**: Set daily/weekly reading goals
- **Add Insights**: AI-generated insights from notes
- **Add Sharing**: Share notes or collections with others
- **Add Collaboration**: Comment on shared notes
- **Add Tags**: Tag system for organizing notes

## Related Files

- `components/mypage/` - Dashboard components
- `app/api/v1/highlights`, `/notes`, `/bookmarks` - API endpoints
- `components/auth/auth-provider.tsx` - Auth context
