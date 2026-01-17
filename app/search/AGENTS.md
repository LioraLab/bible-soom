<!-- Parent: ../AGENTS.md -->
# App - Search

## Purpose

Bible text search page with full-text search across translations.

## Key Files

- **page.tsx** - Search page component

## For AI Agents

### Page Overview

Provides full-text search interface for finding verses containing specific words or phrases across Bible translations.

### Search Flow

1. User enters search query in input field
2. Optional: Select translation to search within (or search all)
3. Click search or press Enter
4. Fetch results from `/api/v1/search?q={query}&translation={translation}`
5. Display results with context
6. Click result to navigate to verse in reading interface

### Search Input

```typescript
<input
  type="text"
  placeholder="Search Bible verses..."
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
/>
```

### Translation Filter

Dropdown to select translation:
- "All Translations" (default)
- korHRV (개역개정)
- NIV (2011)
- Other available translations

### Results Display

Each result shows:
- **Verse reference** - Book Chapter:Verse (e.g., "Genesis 1:1")
- **Verse text** - Full verse with search term highlighted
- **Translation** - Which translation this result is from
- **Click action** - Navigate to `/bible/{translation}/{book}/{chapter}#{verse}`

Example result card:
```
[Genesis 1:1] - korHRV
태초에 하나님이 천지를 창조하시니라
                      ↑ highlighted search term
```

### Search Highlighting

Highlight matching terms in results:
```typescript
const highlightText = (text: string, query: string) => {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};
```

### Pagination

If many results (>50):
- Show first 50 results
- "Load More" button to fetch next page
- Or implement infinite scroll

### Empty State

When no results found:
- Display "No verses found for '{query}'"
- Suggest: Check spelling, try different words, search in different translation

### Recent Searches

Store recent searches in localStorage:
- Display below search input
- Click to repeat search
- Clear history button

## Dependencies

- **Internal**:
  - `app/api/v1/search` - Search endpoint
  - `app/api/v1/translations` - Translation list
  - `components/ui/` - UI components

- **External**:
  - Next.js `useRouter` for navigation
  - Next.js `useSearchParams` for URL query params
  - React hooks (useState, useEffect)

## URL Query Parameters

Support search via URL:
```
/search?q=love&translation=NIV
```

Allows:
- Sharing search results via URL
- Browser back/forward navigation
- Bookmarking searches

```typescript
const searchParams = useSearchParams();
const query = searchParams.get('q') || '';
const translation = searchParams.get('translation') || '';
```

## Common Modifications

- **Advanced Search**: Add filters (book, testament, date range)
- **Search History**: Show user's search history (if authenticated)
- **Saved Searches**: Allow saving frequent searches
- **Search Suggestions**: Auto-complete or suggest related terms
- **Search Analytics**: Track popular search terms
- **Multi-word Search**: Support phrase search with quotes

## Performance Considerations

- Debounce search input (300ms) to avoid excessive API calls
- Cache recent search results
- Limit results per page to 50 for performance
- Show loading spinner during search

## Related Files

- `app/api/v1/search` - Search API endpoint
- `components/ui/` - UI components for search interface
