# Passage Components Directory

<!-- Parent: ../AGENTS.md -->

## Purpose

Multi-panel Bible reading interface with highlights, notes, and bookmarks. This is the **core feature** of Bible Soom, enabling users to read multiple Bible translations side-by-side with rich annotation capabilities.

## Architecture Overview

### Panel-Based System

The passage interface is built on a **dynamic panel architecture** where each panel displays a different Bible translation. Users can add/remove panels to compare translations in real-time.

**Key Concept**: `PanelConfig[]` - dynamically managed array of translation panels

```typescript
interface PanelConfig {
  id: string;              // 'panel-1', 'panel-2', 'panel-{timestamp}'
  translation: string;     // 'korHRV', 'NIV', 'zhCUV', etc.
  book: string;            // English abbreviation (Gen, Exo, Matt, John)
  chapter: number;         // Current chapter number
  verses: Verse[];         // Fetched verse data
}
```

### Component Hierarchy

```
passage-client.tsx (~815 lines) - Orchestrator Component
  ├─ GlobalHeader.tsx              -- Global controls (font size, weight, theme, add panel)
  ├─ BiblePanel.tsx (repeating)    -- Individual translation panel (N panels)
  │   ├─ PanelHeader.tsx           -- Panel-specific navigation & translation selector
  │   └─ VerseDisplay.tsx          -- Individual verse rendering with highlights
  ├─ HighlightModal.tsx            -- Context menu for highlight/note/bookmark actions
  └─ PassageHeader.tsx             -- Legacy header component (may be deprecated)
```

## Key Files

| File | Lines | Responsibility |
|------|-------|----------------|
| **passage-client.tsx** | ~815 | Global state management, panel orchestration, API coordination, user interaction handlers |
| **BiblePanel.tsx** | ~200 | Single panel rendering, verse display, panel-specific navigation |
| **PanelHeader.tsx** | ~150 | Panel controls, book/chapter selection, translation dropdown, close button |
| **VerseDisplay.tsx** | ~100 | Individual verse component with highlight/note rendering |
| **GlobalHeader.tsx** | ~100 | Font size/weight controls, theme toggle, add panel button |
| **HighlightModal.tsx** | ~120 | Contextual menu for highlight colors, notes, bookmarks |
| **PassageHeader.tsx** | - | Legacy naming (check if still used or deprecated) |

## PassageClient (Orchestrator)

**File**: `passage-client.tsx`

### Responsibilities

#### 1. Global State Management

```typescript
// User annotation data (synced with Supabase)
const [highlights, setHighlights] = useState<Map<string, string>>(new Map());
const [notes, setNotes] = useState<Map<string, NoteData>>(new Map());
const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

// Panel configurations
const [panels, setPanels] = useState<PanelConfig[]>([
  { id: 'panel-1', translation: 'korHRV', book: 'Gen', chapter: 1, verses: [] }
]);

// UI preferences (localStorage synced)
const [fontSize, setFontSize] = useState<number>(16);
const [fontWeight, setFontWeight] = useState<string>('normal');
```

#### 2. Panel Management

**Adding Panels**:
```typescript
const addPanel = (translation: string) => {
  const newPanel: PanelConfig = {
    id: `panel-${Date.now()}`,
    translation,
    book: panels[0].book,      // Inherit from main panel
    chapter: panels[0].chapter,
    verses: []
  };
  setPanels([...panels, newPanel]);
};
```

**Removing Panels**:
```typescript
const removePanel = (id: string) => {
  if (id === 'panel-1') return; // Main panel cannot be closed
  setPanels(panels.filter(p => p.id !== id));
};
```

**Updating Panel Navigation**:
```typescript
const updatePanel = (panelId: string, book: string, chapter: number) => {
  setPanels(panels.map(p =>
    p.id === panelId ? { ...p, book, chapter, verses: [] } : p
  ));
  // Fetch new verses for this panel
  fetchVerses(panelId, book, chapter);
};
```

#### 3. API Orchestration

**Fetching Verses** (per panel):
```typescript
const fetchVerses = async (panelId: string, book: string, chapter: number) => {
  const response = await fetch(
    `/api/v1/passages?book=${book}&chapter=${chapter}&translation=${panel.translation}`
  );
  const verses = await response.json();

  setPanels(panels.map(p =>
    p.id === panelId ? { ...p, verses } : p
  ));
};
```

**User Data Operations**:
```typescript
// Save highlight
await fetch('/api/v1/highlights', {
  method: 'POST',
  body: JSON.stringify({ verse_id, color })
});

// Save note
await fetch('/api/v1/notes', {
  method: 'POST',
  body: JSON.stringify({ verse_id, content })
});

// Save bookmark
await fetch('/api/v1/bookmarks', {
  method: 'POST',
  body: JSON.stringify({ verse_id })
});
```

#### 4. User Interaction Handlers

**Text Selection → Highlight**:
```typescript
const handleTextSelection = () => {
  const selection = window.getSelection();
  if (!selection || selection.toString().length === 0) return;

  // Show HighlightModal at selection position
  setHighlightModalPosition({ x, y });
  setSelectedVerseId(verseId);
};
```

**Highlight Click → Edit/Delete**:
```typescript
const handleHighlightClick = (verseId: string) => {
  // Show modal with current highlight color
  setHighlightModalColor(highlights.get(verseId));
  setSelectedVerseId(verseId);
};
```

**Note Icon Click → Open Editor**:
```typescript
const handleNoteClick = (verseId: string) => {
  setEditingNoteId(verseId);
  setNoteEditorContent(notes.get(verseId)?.content || '');
};
```

#### 5. LocalStorage Sync

**Font Preferences**:
```typescript
useEffect(() => {
  localStorage.setItem('fontSize', fontSize.toString());
}, [fontSize]);

useEffect(() => {
  localStorage.setItem('fontWeight', fontWeight);
}, [fontWeight]);
```

**Panel Configurations** (future feature):
```typescript
// Persist panel layouts for quick recall
localStorage.setItem('panelLayout', JSON.stringify(panels));
```

## BiblePanel Component

**File**: `BiblePanel.tsx`

### Responsibilities

#### 1. Single Translation Rendering

**Props**:
```typescript
interface BiblePanelProps {
  config: PanelConfig;
  highlights: Map<string, string>;
  notes: Map<string, NoteData>;
  bookmarks: Set<string>;
  fontSize: number;
  fontWeight: string;
  onNavigate: (book: string, chapter: number) => void;
  onTranslationChange: (translation: string) => void;
  onClose: () => void;
}
```

**Rendering**:
```tsx
<div className="panel-container">
  <PanelHeader
    book={config.book}
    chapter={config.chapter}
    translation={config.translation}
    onNavigate={onNavigate}
    onTranslationChange={onTranslationChange}
    onClose={config.id !== 'panel-1' ? onClose : undefined}
  />

  <div className="verse-grid">
    {config.verses.map(verse => (
      <VerseDisplay
        key={verse.id}
        verse={verse}
        highlight={highlights.get(verse.id)}
        note={notes.get(verse.id)}
        isBookmarked={bookmarks.has(verse.id)}
        fontSize={fontSize}
        fontWeight={fontWeight}
      />
    ))}
  </div>
</div>
```

#### 2. Panel-Specific Navigation

**Previous/Next Chapter**:
```typescript
const handlePrevChapter = () => {
  if (chapter > 1) {
    onNavigate(book, chapter - 1);
  } else {
    // Go to previous book's last chapter
    const prevBook = getPreviousBook(book);
    const lastChapter = BOOK_CHAPTERS[prevBook];
    onNavigate(prevBook, lastChapter);
  }
};
```

**Book/Chapter Selection**:
```typescript
<Dropdown
  options={Object.keys(BOOK_CHAPTERS)}
  value={book}
  onChange={(newBook) => onNavigate(newBook, 1)} // Reset to chapter 1
/>

<Dropdown
  options={Array.from({ length: BOOK_CHAPTERS[book] }, (_, i) => i + 1)}
  value={chapter}
  onChange={(newChapter) => onNavigate(book, newChapter)}
/>
```

#### 3. Independent State

- Each panel can navigate to **different books/chapters** independently
- `panel-1` (main panel) is always present and **cannot be closed**
- Additional panels (panel-2, panel-3, ...) are closable
- Panels share global user data (highlights, notes, bookmarks) but manage their own content

## PanelHeader Component

**File**: `PanelHeader.tsx`

### Responsibilities

#### 1. Translation Selector

```tsx
<Dropdown
  options={translations.map(t => ({ value: t.code, label: t.name }))}
  value={translation}
  onChange={onTranslationChange}
/>
```

- Fetches available translations from `/api/v1/translations`
- Dynamically updated when new translations are added to database
- No hardcoded translation list

#### 2. Book/Chapter Navigation

```tsx
<div className="navigation-controls">
  <Button onClick={handlePrevChapter}>←</Button>
  <BookDropdown book={book} onChange={(b) => onNavigate(b, 1)} />
  <ChapterDropdown chapter={chapter} maxChapter={BOOK_CHAPTERS[book]} onChange={(c) => onNavigate(book, c)} />
  <Button onClick={handleNextChapter}>→</Button>
</div>
```

#### 3. Close Button

```tsx
{onClose && (
  <Button variant="ghost" onClick={onClose}>
    <XIcon />
  </Button>
)}
```

- Only shown if `onClose` callback is provided
- Main panel (`panel-1`) does not receive `onClose` prop, thus no close button

## VerseDisplay Component

**File**: `VerseDisplay.tsx`

### Responsibilities

#### 1. Individual Verse Rendering

```tsx
interface VerseDisplayProps {
  verse: Verse;
  highlight?: string;      // Color code ('yellow', 'green', 'blue', 'pink')
  note?: NoteData;
  isBookmarked: boolean;
  fontSize: number;
  fontWeight: string;
  onHighlight: (verseId: string) => void;
  onNote: (verseId: string) => void;
  onBookmark: (verseId: string) => void;
}
```

#### 2. Highlight Application

```tsx
const highlightClass = highlight
  ? HIGHLIGHT_BG_CLASSES[highlight]  // From lib/constants.ts
  : '';

<span
  className={`${highlightClass} transition-colors cursor-pointer`}
  style={{ fontSize: `${fontSize}px`, fontWeight }}
  onMouseUp={handleTextSelection}
  onClick={handleHighlightClick}
>
  {verse.verse_number}. {verse.text}
</span>
```

**Dark Mode Support**:
```typescript
// lib/constants.ts
export const HIGHLIGHT_BG_CLASSES = {
  yellow: "bg-yellow-200 dark:bg-yellow-500/30",
  green: "bg-green-200 dark:bg-green-500/30",
  blue: "bg-blue-200 dark:bg-blue-500/30",
  pink: "bg-pink-200 dark:bg-pink-500/30",
};
```

#### 3. Note/Bookmark Indicators

```tsx
{note && (
  <button
    className="note-indicator"
    onClick={() => onNote(verse.id)}
    title="View/Edit Note"
  >
    <NoteIcon className="text-theme-primary" />
  </button>
)}

{isBookmarked && (
  <button
    className="bookmark-indicator"
    onClick={() => onBookmark(verse.id)}
    title="Remove Bookmark"
  >
    <BookmarkIcon className="text-theme-accent" />
  </button>
)}
```

## HighlightModal Component

**File**: `HighlightModal.tsx`

### Responsibilities

#### 1. Context Menu Positioning

```tsx
<div
  className="highlight-modal"
  style={{
    position: 'absolute',
    top: `${position.y}px`,
    left: `${position.x}px`,
    zIndex: 50
  }}
>
```

#### 2. Highlight Color Picker

```tsx
{HIGHLIGHT_COLORS.map(color => (
  <button
    key={color}
    className={`color-swatch ${HIGHLIGHT_BG_CLASSES[color]}`}
    onClick={() => onHighlight(color)}
  />
))}
```

#### 3. Action Buttons

```tsx
<div className="actions">
  <Button onClick={onNote}>
    <NoteIcon /> Add Note
  </Button>

  <Button onClick={onBookmark}>
    <BookmarkIcon /> {isBookmarked ? 'Remove' : 'Add'} Bookmark
  </Button>

  {hasHighlight && (
    <Button variant="danger" onClick={onRemoveHighlight}>
      <TrashIcon /> Remove Highlight
    </Button>
  )}
</div>
```

## GlobalHeader Component

**File**: `GlobalHeader.tsx`

### Responsibilities

#### 1. Font Controls

```tsx
<div className="font-controls">
  <label>Font Size</label>
  <Dropdown
    options={FONT_SIZES}  // [14, 16, 18, 20, 24, 28]
    value={fontSize}
    onChange={setFontSize}
  />

  <label>Font Weight</label>
  <Dropdown
    options={FONT_WEIGHTS}  // ['normal', 'medium', 'semibold', 'bold']
    value={fontWeight}
    onChange={setFontWeight}
  />
</div>
```

#### 2. Theme Toggle

```tsx
import { useTheme } from '@/components/theme/theme-provider';

const { theme, setTheme } = useTheme();

<Dropdown
  options={[
    { value: 'blue', label: 'Blue Theme' },
    { value: 'beige', label: 'Beige Theme' },
    { value: 'neutral', label: 'Neutral Theme' }
  ]}
  value={theme}
  onChange={setTheme}
/>
```

#### 3. Add Panel Button

```tsx
<Button onClick={handleAddPanel}>
  <PlusIcon /> Add Translation Panel
</Button>

{showTranslationSelector && (
  <Dropdown
    options={availableTranslations}
    onChange={(translation) => {
      onAddPanel(translation);
      setShowTranslationSelector(false);
    }}
  />
)}
```

## For AI Agents

### Critical Architectural Points

#### 1. Panel-1 Is Sacred

**NEVER allow closing panel-1**:
```typescript
// CORRECT
const removePanel = (id: string) => {
  if (id === 'panel-1') return; // Guard clause
  setPanels(panels.filter(p => p.id !== id));
};

// WRONG
const removePanel = (id: string) => {
  setPanels(panels.filter(p => p.id !== id)); // Can accidentally remove panel-1
};
```

#### 2. Verse ID Format

Verse IDs follow the format used by the backend:
```
{book_id}-{chapter}-{verse}
```

Example: `"Gen-1-1"`, `"Matt-5-3"`

**Important**: The ID format may differ between legacy wide table and normalized schema. Always use the ID returned from `/api/v1/passages`.

#### 3. State Synchronization

**User data (highlights, notes, bookmarks) must be synced with Supabase**:

```typescript
// CORRECT: Optimistic UI update + API call
const handleHighlight = async (verseId: string, color: string) => {
  // 1. Update local state immediately (optimistic)
  setHighlights(new Map(highlights).set(verseId, color));

  // 2. Persist to backend
  try {
    await fetch('/api/v1/highlights', {
      method: 'POST',
      body: JSON.stringify({ verse_id: verseId, color })
    });
  } catch (error) {
    // 3. Rollback on failure
    setHighlights(new Map(highlights).delete(verseId));
    showError('Failed to save highlight');
  }
};
```

**WRONG**: Only updating local state without API call (data loss on refresh).

#### 4. Panel Data Fetching

**Each panel fetches independently** (parallel requests):

```typescript
// CORRECT: Parallel fetches
useEffect(() => {
  panels.forEach(panel => {
    fetchVerses(panel.id, panel.book, panel.chapter, panel.translation);
  });
}, [panels]);

// WRONG: Sequential fetches (slow)
useEffect(() => {
  for (const panel of panels) {
    await fetchVerses(panel.id, panel.book, panel.chapter, panel.translation);
  }
}, [panels]);
```

### Common Modification Scenarios

#### Adding New Highlight Color

1. **Update constants** (`lib/constants.ts`):
   ```typescript
   export const HIGHLIGHT_COLORS = [
     'yellow', 'green', 'blue', 'pink', 'purple' // Add 'purple'
   ];

   export const HIGHLIGHT_BG_CLASSES = {
     // ...existing
     purple: "bg-purple-200 dark:bg-purple-500/30"
   };
   ```

2. **No changes needed in components** - they dynamically read from constants.

#### Adding New User Data Type (e.g., Underlines)

1. **Create migration**: `supabase/migrations/YYYYMMDD_underlines.sql`
   ```sql
   CREATE TABLE underlines (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     verse_id TEXT NOT NULL,
     style TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(user_id, verse_id)
   );
   -- RLS policies
   ```

2. **Create API route**: `app/api/v1/underlines/route.ts`
   ```typescript
   export async function POST(request: Request) {
     const { verse_id, style } = await request.json();
     const guard = await authGuard();
     if (!guard.ok) return guard.response;

     const { data, error } = await guard.supabase
       .from('underlines')
       .upsert({ user_id: guard.user.id, verse_id, style });

     return NextResponse.json(data);
   }
   ```

3. **Update PassageClient**:
   ```typescript
   const [underlines, setUnderlines] = useState<Map<string, string>>(new Map());

   // Fetch underlines on mount
   useEffect(() => {
     fetch('/api/v1/underlines').then(res => res.json()).then(data => {
       setUnderlines(new Map(data.map(u => [u.verse_id, u.style])));
     });
   }, []);

   // Pass to VerseDisplay
   <VerseDisplay underline={underlines.get(verse.id)} />
   ```

4. **Update VerseDisplay**:
   ```tsx
   interface VerseDisplayProps {
     // ...existing
     underline?: string;
   }

   <span
     className={underline ? `underline-${underline}` : ''}
   >
   ```

#### Optimizing Performance

**Current optimization opportunities**:

1. **Memoize VerseDisplay**:
   ```typescript
   export const VerseDisplay = React.memo(({ verse, highlight, note, ... }) => {
     // ...
   }, (prevProps, nextProps) => {
     return prevProps.verse.id === nextProps.verse.id &&
            prevProps.highlight === nextProps.highlight &&
            prevProps.note === nextProps.note;
   });
   ```

2. **Debounce highlight saves**:
   ```typescript
   import { useDebouncedCallback } from 'use-debounce';

   const saveHighlight = useDebouncedCallback(
     (verseId, color) => {
       fetch('/api/v1/highlights', { method: 'POST', ... });
     },
     500 // Wait 500ms after last change
   );
   ```

3. **Lazy load HighlightModal**:
   ```typescript
   const HighlightModal = dynamic(() => import('./HighlightModal'), {
     ssr: false
   });
   ```

### Testing Considerations

**Key test scenarios**:

1. **Multi-panel synchronization**:
   - Add 3 panels with different translations
   - Navigate each panel to different books/chapters independently
   - Verify panels maintain independent state

2. **User data persistence**:
   - Add highlight → Refresh page → Verify highlight persists
   - Delete highlight → Verify removal persists
   - Add note → Edit note → Verify edits persist

3. **Panel management**:
   - Try to close panel-1 → Should fail silently
   - Close panel-2 → Should remove only panel-2
   - Add panel → Remove panel → Add panel again → Verify no stale state

4. **LocalStorage sync**:
   - Change font size → Refresh → Verify font size persists
   - Change theme → Refresh → Verify theme persists

## Dependencies

**Internal Dependencies**:
- `lib/supabase/client.ts` - Browser-side Supabase client
- `lib/constants.ts` - BOOK_CHAPTERS, HIGHLIGHT_COLORS, HIGHLIGHT_BG_CLASSES, FONT_SIZES
- `components/auth/auth-provider.tsx` - useAuth() hook
- `components/theme/theme-provider.tsx` - useTheme() hook
- `components/ui/*` - Button, Dropdown, Modal, Spinner, etc.

**API Routes**:
- `/api/v1/passages` - Fetch verses
- `/api/v1/translations` - Available translations
- `/api/v1/highlights` - CRUD highlights
- `/api/v1/notes` - CRUD notes
- `/api/v1/bookmarks` - CRUD bookmarks

**External Dependencies**:
- `react` - useState, useEffect, useCallback, useMemo
- `next/dynamic` - Code splitting (if used)
- `lucide-react` - Icons (NoteIcon, BookmarkIcon, etc.)

## Performance Considerations

**Current Performance Profile**:
- **Panel rendering**: O(N × M) where N = panels, M = verses per chapter
- **Highlight lookup**: O(1) via Map data structure
- **API calls**: Parallel per panel (good), but no caching

**Optimization Roadmap**:
1. Implement React.memo for VerseDisplay
2. Add React Query for API caching
3. Virtualize verse list for chapters with 100+ verses (e.g., Psalm 119)
4. Consider Web Workers for large highlight data processing

## Migration Notes

**Schema Transition**: Components use `/api/v1/passages` which abstracts the underlying schema.

**API Contract** (normalized schema):
```typescript
GET /api/v1/passages?book=Gen&chapter=1&translation=korHRV

Response:
{
  "verses": [
    {
      "id": "verse-uuid-123",         // Canonical verse ID
      "book": "Gen",
      "chapter": 1,
      "verse": 1,
      "text": "태초에 하나님이 천지를 창조하시니라",
      "translation": "korHRV"
    }
  ]
}
```

**Legacy API Contract** (wide table):
```typescript
// Same endpoint, but verse_id format may differ
{
  "id": "Gen-1-1",  // String-based ID
  "korhrv": "태초에 하나님이 천지를 창조하시니라",
  "book_id": 1,
  "chapter": 1,
  "verse": 1
}
```

**Action Required After Full Migration**:
- Verify `verse_id` format consistency
- Update user data tables (`highlights`, `notes`, `bookmarks`) to reference canonical verse IDs
- Test all CRUD operations with new verse ID format

---

**For detailed architecture documentation, see parent AGENTS.md: `../AGENTS.md`**
