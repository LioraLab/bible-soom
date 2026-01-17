# Components Directory

<!-- Parent: ../AGENTS.md -->

## Purpose

Reusable React UI components for the Bible Soom application. This directory contains all client-side and server-side React components organized by feature domain.

## Architecture Overview

Components follow Next.js 15 App Router conventions:
- **Server Components by default** (no 'use client' directive)
- **Client Components** explicitly marked with `'use client'` when using:
  - React hooks (useState, useEffect, useContext)
  - Browser APIs (localStorage, window)
  - Event handlers (onClick, onChange)

## Directory Structure

```
components/
├── auth/                    # Authentication & Authorization
├── passage/                 # Multi-Panel Bible Reading Interface ⭐
├── theme/                   # Theme System (Blue/Beige/Neutral)
├── header/                  # Global Navigation Header
├── mypage/                  # User Dashboard & Profile
├── books/                   # Book Catalog & Selection
├── editor/                  # Rich Text Editor for Notes
└── ui/                      # Atomic UI Components (Design System)
```

## Key Subdirectories

### `/auth` - Authentication Components
- **auth-provider.tsx**: React Context provider for authentication state
  - Exports `useAuth()` hook: `{ user, loading, signOut }`
  - Wraps Supabase auth with React state management
  - Used by: Header, PassageClient, MyPage

**Pattern**:
```tsx
import { useAuth } from '@/components/auth/auth-provider';

function MyComponent() {
  const { user, loading } = useAuth();
  if (!user) return <LoginPrompt />;
  // ...
}
```

### `/passage` - Multi-Panel Bible Reading Interface ⭐

**This is the core feature of the app** - enables parallel Bible translation viewing.

#### Architecture: Panel-Based System

**Key Concept**: `PanelConfig[]` - dynamically add/remove translation panels

```tsx
interface PanelConfig {
  id: string;              // 'panel-1', 'panel-2', ...
  translation: string;     // 'korHRV', 'NIV'
  book: string;            // English abbreviation (Gen, Exo, Matt)
  chapter: number;
  verses: Verse[];
}
```

#### Component Hierarchy

```
passage-client.tsx (815 lines) - Orchestrator
  ├─ GlobalHeader.tsx       -- Global settings (font, theme)
  ├─ BiblePanel.tsx         -- Individual translation panel (repeatable)
  │   ├─ PanelHeader.tsx    -- Panel-specific navigation, translation selector
  │   └─ VerseDisplay.tsx   -- Individual verse rendering with highlights
  ├─ HighlightModal.tsx     -- Context menu for highlight/note actions
  └─ PassageHeader.tsx      -- Legacy header (may be deprecated)
```

#### Key Files

| File | Lines | Responsibility |
|------|-------|----------------|
| `passage-client.tsx` | 815 | Global state (highlights, notes, bookmarks), panel management, API orchestration |
| `BiblePanel.tsx` | ~200 | Single panel rendering, navigation (prev/next chapter), translation switching |
| `PanelHeader.tsx` | ~150 | Panel controls, book/chapter selection, translation dropdown |
| `VerseDisplay.tsx` | ~100 | Individual verse with highlight/note rendering |
| `GlobalHeader.tsx` | ~100 | Font size/weight controls, theme toggle, panel management |
| `HighlightModal.tsx` | ~120 | Contextual menu for highlight colors, notes, bookmarks |

#### PassageClient Responsibilities

**State Management**:
- `highlights`: Map<verse_id, color> - user highlight data
- `notes`: Map<verse_id, NoteData> - user notes
- `bookmarks`: Set<verse_id> - bookmarked verses
- `panels`: PanelConfig[] - active translation panels

**API Orchestration**:
- `/api/v1/passages` - Fetch verse data per panel
- `/api/v1/highlights`, `/api/v1/notes`, `/api/v1/bookmarks` - CRUD operations

**User Interactions**:
- Text selection → HighlightModal
- Highlight click → Edit/delete highlight
- Note icon click → Open note editor
- Add/remove panels

**LocalStorage Sync**:
- Font size/weight persistence
- Panel configurations (future feature)

#### BiblePanel Responsibilities

**Rendering**:
- Display verses for ONE translation
- Apply highlights/notes from global state
- Grid layout with responsive design

**Navigation**:
- Previous/Next chapter buttons
- Book selector (dropdown)
- Chapter selector (dropdown)

**Independence**:
- Each panel can navigate to different books/chapters
- Panel 1 (`panel-1`) is always present (cannot be closed)
- Additional panels are closable

#### Usage Pattern

```tsx
// Add a new panel
<GlobalHeader onAddPanel={(translation) => {
  const newPanel = { id: `panel-${Date.now()}`, translation, ... };
  setPanels([...panels, newPanel]);
}} />

// Render panels
{panels.map(panel => (
  <BiblePanel
    key={panel.id}
    config={panel}
    onNavigate={(book, chapter) => updatePanel(panel.id, book, chapter)}
    onTranslationChange={(newTranslation) => updatePanelTranslation(panel.id, newTranslation)}
    onClose={() => removePanel(panel.id)}
  />
))}
```

### `/theme` - Theme System

**Blue · Beige · Neutral** theme system with dark mode support.

**Files**:
- **theme-provider.tsx**: React Context + localStorage persistence
  - Exports `useTheme()` hook: `{ theme, setTheme, isDark }`
  - Manages `dark` class on `<html>` element
  - Themes: `'blue'`, `'beige'`, `'neutral'`
- **theme-toggle.tsx**: UI component for theme switching

**Integration with Tailwind**:
```tsx
// Tailwind config defines custom color palettes per theme
// Components use dark: prefix for dark mode styles
<div className="bg-blue-50 dark:bg-blue-900/20">
```

### `/header` - Global Navigation

**Files**:
- **header.tsx**: Top navigation bar
  - Logo/branding
  - Auth status (login/logout)
  - Links to: Home, Books, MyPage

**Usage**: Imported in root layout (`app/layout.tsx`)

### `/mypage` - User Dashboard

**Files**:
- **mypage-client.tsx**: User profile and activity dashboard
  - Display user highlights, notes, bookmarks
  - Statistics (total highlights, notes count)
  - Recent activity feed

**Data Sources**:
- `/api/v1/highlights?user_id=...`
- `/api/v1/notes?user_id=...`
- `/api/v1/bookmarks?user_id=...`

### `/books` - Book Catalog

**Files**:
- **books-client.tsx**: Bible book selection interface
  - Old Testament / New Testament tabs
  - Book cards with metadata (chapters count)
  - Navigate to `/passage/[book]/[chapter]` on selection

**Data Source**:
- `lib/constants.ts`: `BOOK_CHAPTERS` (66 books)

### `/editor` - Rich Text Editor

**Files**:
- **rich-text-editor.tsx**: Note editing component
  - Markdown support (future)
  - Autosave to Supabase
  - Used in: PassageClient (note modal), MyPage (note editing)

### `/ui` - Atomic UI Components (Design System)

Reusable low-level components following atomic design principles.

**Key Components**:

| Component | Purpose | Props |
|-----------|---------|-------|
| `Button.tsx` | Primary/secondary buttons | `variant`, `size`, `onClick` |
| `Modal.tsx` | Overlay dialog | `isOpen`, `onClose`, `title`, `children` |
| `Dropdown.tsx` | Select menu | `options`, `value`, `onChange` |
| `Input.tsx` | Text input field | `type`, `value`, `onChange`, `placeholder` |
| `Card.tsx` | Content container | `title`, `children`, `className` |
| `Badge.tsx` | Status badge | `color`, `text` |
| `Spinner.tsx` | Loading indicator | `size` |
| `Alert.tsx` | Notification banner | `type`, `message` |
| `Tabs.tsx` | Tab navigation | `tabs`, `activeTab`, `onChange` |
| `ColorPicker.tsx` | Highlight color selector | `colors`, `selected`, `onChange` |
| `Skeleton.tsx` | Loading placeholder | `width`, `height` |
| `Drawer.tsx` | Side panel | `isOpen`, `onClose`, `side` |
| `Label.tsx` | Form label | `htmlFor`, `children` |
| `BackgroundDecoration.tsx` | Decorative SVG background | Theme-aware |
| `SectionHeader.tsx` | Section title with divider | `title`, `subtitle` |

**Design System Principles**:
- All components support `className` for Tailwind overrides
- Dark mode support via `dark:` variants
- Theme-aware color tokens (uses Tailwind custom palette)
- TypeScript for prop validation

**Usage Pattern**:
```tsx
import { Button, Modal } from '@/components/ui';

<Button variant="primary" size="lg" onClick={handleSave}>
  Save Changes
</Button>

<Modal isOpen={showModal} onClose={handleClose} title="Confirm Action">
  <p>Are you sure?</p>
</Modal>
```

## For AI Agents

### Client vs Server Components

**Use Client Components when**:
- Using React hooks (`useState`, `useEffect`, `useContext`)
- Accessing browser APIs (`window`, `localStorage`, `document`)
- Event handlers (`onClick`, `onChange`, `onSubmit`)
- Third-party libraries requiring browser environment

**Use Server Components when**:
- Fetching data from Supabase (use `createServerSupabase()`)
- Static content rendering
- SEO-critical content

### Supabase Client Usage

**In Client Components**:
```tsx
'use client';
import { createBrowserSupabase } from '@/lib/supabase/client';

const supabase = createBrowserSupabase();
const { data } = await supabase.from('notes').select('*');
```

**In Server Components**:
```tsx
import { createServerSupabase } from '@/lib/supabase/server';

const supabase = createServerSupabase();
const { data } = await supabase.from('notes').select('*');
```

**⚠️ NEVER use `createBrowserSupabase()` in server components** - will cause auth failures.

### State Management Patterns

**Global State** (auth, theme):
- Use React Context (`AuthProvider`, `ThemeProvider`)
- Providers in root layout (`app/layout.tsx`)

**Local State** (component-specific):
- Use `useState`, `useReducer`
- Lift state up to nearest common ancestor

**Server State** (API data):
- Fetch in Server Components when possible
- Use `useEffect` + fetch in Client Components
- Consider React Query for caching (future enhancement)

### Styling Conventions

**Tailwind CSS**:
- Use utility classes directly in JSX
- Custom colors: `bg-theme-primary`, `text-theme-secondary` (see `tailwind.config.ts`)
- Dark mode: `dark:bg-gray-800`, `dark:text-white`
- Responsive: `sm:`, `md:`, `lg:`, `xl:` breakpoints

**Component-Specific Styles**:
- Avoid inline styles unless absolutely necessary
- Use `className` prop for overrides
- Extract repeated patterns into `ui/` components

### Adding New Components

**Checklist**:
1. **Choose directory**: Feature-specific or `ui/` if reusable
2. **File naming**: `kebab-case.tsx` (e.g., `my-component.tsx`)
3. **Export pattern**:
   ```tsx
   export function MyComponent() { ... }
   ```
4. **Props interface**:
   ```tsx
   interface MyComponentProps {
     title: string;
     onClose: () => void;
   }
   ```
5. **Add to parent directory's index** (if applicable):
   ```tsx
   export { MyComponent } from './my-component';
   ```

### Common Patterns

**Authentication Check**:
```tsx
const { user, loading } = useAuth();
if (loading) return <Spinner />;
if (!user) return <Alert type="error" message="Please log in" />;
```

**API Call with Error Handling**:
```tsx
const [data, setData] = useState(null);
const [error, setError] = useState(null);

useEffect(() => {
  fetch('/api/v1/passages?book=Gen&chapter=1')
    .then(res => res.json())
    .then(setData)
    .catch(setError);
}, []);

if (error) return <Alert type="error" message={error.message} />;
if (!data) return <Skeleton />;
```

**Highlight Rendering** (from VerseDisplay.tsx):
```tsx
const highlightClass = highlights.get(verse.id)
  ? HIGHLIGHT_BG_CLASSES[highlights.get(verse.id)]
  : '';

<span className={`${highlightClass} transition-colors`}>
  {verse.text}
</span>
```

### Testing Considerations

**Current State**: No test setup in package.json yet.

**Future Testing Strategy**:
- **Unit Tests**: Jest + React Testing Library for `ui/` components
- **Integration Tests**: Playwright for PassageClient multi-panel interactions
- **E2E Tests**: Cypress for full user flows (read → highlight → save)

## Dependencies

**Internal Dependencies**:
- `lib/supabase/client.ts` - Browser-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/constants.ts` - App-wide constants (BOOK_CHAPTERS, HIGHLIGHT_COLORS, etc.)
- `lib/auth.ts` - Server-side auth utilities (`authGuard()`)
- `hooks/` - Custom React hooks (future: useHighlights, useNotes)

**External Dependencies**:
- `react`, `react-dom` - Core React
- `next` - Next.js framework
- `@supabase/supabase-js` - Supabase client
- `tailwindcss` - Utility-first CSS
- `lucide-react` - Icon library (used in `ui/` components)

## Migration Notes

**Schema Transition**: Components currently support both legacy wide table and normalized schema.

**Wide Table** (legacy):
```tsx
const { data } = await supabase
  .from('verses')
  .select('korhrv, niv')  // Columns per translation
  .eq('book', book);
```

**Normalized Schema** (new):
```tsx
const { data } = await supabase
  .from('verse_translations')
  .select('text, translation_id')
  .eq('verse_id', verseId);
```

**Action Required**: After full migration to normalized schema, update:
- `passage-client.tsx` - API call to `/api/v1/passages` (already uses normalized backend)
- `books-client.tsx` - May need translation metadata from `/api/v1/translations`

## Performance Considerations

**PassageClient Optimization**:
- Each panel fetches data independently (parallel requests)
- Memoize verse rendering with `React.memo(VerseDisplay)`
- Debounce highlight save operations (avoid excessive API calls)

**Code Splitting**:
- PassageClient is already code-split (loaded on `/passage/[book]/[chapter]` route)
- Consider lazy loading `HighlightModal`, `rich-text-editor` if bundle size grows

**Rendering Optimization**:
- Use `key` prop on panels: `key={panel.id}` (prevents unnecessary re-renders)
- Avoid inline function definitions in render (use `useCallback`)

---

**For questions about specific components, see individual subdirectory AGENTS.md files** (future enhancement).
