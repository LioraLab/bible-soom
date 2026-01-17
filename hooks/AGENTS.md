# hooks/

<!-- Parent: ../AGENTS.md -->

## Purpose

Reusable React custom hooks for common functionality across the Bible Soom application. All hooks follow React's rules of hooks (must start with 'use', can only be called in components or other hooks).

## Key Files

### **index.ts**
Central export file for all custom hooks in this directory.

### **useLocalStorage.ts**
Provides two hooks for managing browser localStorage with React state synchronization:

- `useLocalStorage<T>()` - Generic hook for reading/writing any value to localStorage with automatic JSON serialization. Provides a useState-like interface that automatically persists changes.
  - Used for: font size, font weight, theme preferences
  - SSR-safe: returns initial value during server-side rendering

- `useLocalStorageArray<T>()` - Specialized hook for managing arrays in localStorage with convenience methods:
  - `add(item)` - Add item if not already present
  - `remove(item)` - Remove item from array
  - `toggle(item)` - Add if absent, remove if present (returns boolean)
  - `clear()` - Empty the array
  - `includes(item)` - Check if item exists
  - Used for: bookmark lists, recently viewed passages

### **useClickOutside.ts**
Provides hooks for detecting clicks outside of specific DOM elements:

- `useClickOutside<T>()` - Single element click-outside detection. Returns a ref to attach to the target element.
  - Used for: dropdowns, modals, popovers
  - Uses `mousedown` event (faster than `click`)

- `useClickOutsideMultiple()` - Multi-element click-outside detection. Accepts an array of refs and triggers callback only when clicking outside ALL of them.
  - Used for: button + menu combinations where both should stay open
  - Useful for complex UI patterns with multiple related elements

## Subdirectories

None.

## For AI Agents

### Hook Rules
- All hooks MUST start with 'use' prefix
- Can only be called from:
  - React function components
  - Other custom hooks
- Cannot be called from:
  - Regular functions
  - Class components
  - Event handlers (indirectly via state is fine)

### Authentication Pattern
**Important**: This codebase uses `useAuth()` hook from `components/auth/auth-provider.tsx`, NOT a local hook in this directory. When working with authentication:

```typescript
// ✅ Correct - use centralized auth provider
import { useAuth } from '@/components/auth/auth-provider';

function MyComponent() {
  const { user, loading, signOut } = useAuth();
  // ...
}

// ❌ Incorrect - don't call Supabase directly in components
import { createBrowserSupabase } from '@/lib/supabase/client';
const supabase = createBrowserSupabase();
```

### Usage Patterns

**localStorage Hooks:**
```typescript
// Simple value
const [fontSize, setFontSize] = useLocalStorage<number>('fontSize', 3);
setFontSize(4); // Automatically persists to localStorage

// Array management
const [bookmarks, { add, remove, toggle }] = useLocalStorageArray<string>('bookmarks');
toggle('Genesis-1-1'); // Returns true if added, false if removed
```

**Click Outside Hooks:**
```typescript
// Single element
const [isOpen, setIsOpen] = useState(false);
const dropdownRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false), isOpen);
<div ref={dropdownRef}>...</div>

// Multiple elements (button + menu)
const buttonRef = useRef<HTMLButtonElement>(null);
const menuRef = useRef<HTMLDivElement>(null);
useClickOutsideMultiple([buttonRef, menuRef], () => setIsOpen(false), isOpen);
```

### Adding New Hooks

When creating new hooks:
1. Follow the naming convention: `use<FeatureName>.ts`
2. Add TypeScript types and JSDoc documentation
3. Include usage examples in JSDoc
4. Export from `index.ts`
5. Mark as `"use client"` if using browser APIs
6. Consider SSR compatibility (check `typeof window`)

### Common Hook Patterns in This Codebase

- **State persistence**: Use `useLocalStorage` instead of raw `useState` + manual localStorage calls
- **Outside click detection**: Use `useClickOutside` for dropdowns/modals
- **Authentication**: Use `useAuth()` from auth-provider (not in this directory)
- **Supabase client**: Use `createBrowserSupabase()` from `@/lib/supabase/client` in client components

## Dependencies

- **React**: `useState`, `useEffect`, `useRef`, `useCallback`
- **Related Modules**:
  - `components/auth/auth-provider.tsx` - Provides `useAuth()` hook (not in this directory)
  - `lib/supabase/client.ts` - Browser Supabase client for data fetching

## Notes

- All hooks in this directory are client-side only (`"use client"`)
- Hooks handle SSR gracefully (check `typeof window !== "undefined"`)
- localStorage operations include error handling with console warnings
- Click-outside hooks use `mousedown` instead of `click` for faster response
