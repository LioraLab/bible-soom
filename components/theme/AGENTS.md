# Theme Directory

<!-- Parent: ../AGENTS.md -->

## Purpose

Theme system for Bible Soom application. Provides light/dark mode theming with localStorage persistence and Tailwind CSS integration.

## Architecture Overview

The theme system uses React Context API for state management and Tailwind CSS's dark mode feature (class strategy) for styling. The system toggles between light and dark modes by adding/removing the `dark` class on `document.documentElement`.

**Key Flow**:
```
User clicks toggle
  → ThemeProvider.toggleTheme()
  → Update React state
  → Persist to localStorage
  → Add/remove 'dark' class on <html>
  → Tailwind applies dark: variant styles
```

## Key Files

### theme-provider.tsx (58 lines)

**Purpose**: Core theme state management with React Context.

**Exports**:
- `ThemeProvider`: React Context provider component
- `useTheme()`: Hook for accessing theme state

**Context Type**:
```tsx
interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}
```

**Responsibilities**:
- Initialize theme from localStorage on mount
- Sync theme state to localStorage on change
- Apply/remove `dark` class on `document.documentElement`
- Prevent hydration mismatch with mounted state

**Usage Pattern**:
```tsx
// In root layout (app/layout.tsx)
<ThemeProvider>
  {children}
</ThemeProvider>

// In any component
import { useTheme } from '@/components/theme/theme-provider';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  // ...
}
```

**Implementation Details**:
- Uses `useState` for theme state (`"light"` | `"dark"`)
- Uses `useEffect` to read from localStorage on mount
- Default theme: `"light"` (if no saved preference)
- localStorage key: `"theme"`

### theme-toggle.tsx (18 lines)

**Purpose**: UI component for toggling between light and dark mode.

**Exports**:
- `ThemeToggle` (default export)

**Features**:
- Button with light/dark mode icons (🌙/☀️)
- Tailwind-styled with dark mode support
- Accessible (aria-label)
- Hover states and transitions

**Styling**:
- Border: `border-slate-300 dark:border-slate-600`
- Background: `bg-white dark:bg-slate-800`
- Text: `text-slate-700 dark:text-slate-200`
- Hover: `hover:bg-slate-50 dark:hover:bg-slate-700`

**Used In**:
- `components/passage/GlobalHeader.tsx` (main passage reading interface)
- Any page that needs theme switching UI

## For AI Agents

### Theme System Integration

**Tailwind CSS Dark Mode**:

The theme system uses Tailwind's class-based dark mode strategy (configured in `tailwind.config.ts`):

```tsx
// tailwind.config.ts
module.exports = {
  darkMode: 'class',  // Toggle via 'dark' class on html element
  // ...
}
```

**Styling Components for Dark Mode**:

Use Tailwind's `dark:` variant for dark mode styles:

```tsx
// Light and dark mode styles
<div className="bg-blue-50 dark:bg-blue-900/20">
  <p className="text-gray-900 dark:text-gray-100">Text</p>
</div>
```

**Color Palette Strategy**:

The app uses custom color palettes (Blue, Beige, Neutral themes) defined in Tailwind config. These palettes automatically adapt to dark mode via `dark:` variants.

**Common Dark Mode Patterns**:
```tsx
// Background
bg-white dark:bg-slate-900

// Text
text-gray-900 dark:text-gray-100

// Borders
border-gray-300 dark:border-gray-700

// Highlights (with transparency for dark mode)
bg-yellow-200 dark:bg-yellow-500/30
```

### Adding New Theme Features

**If adding a new theme variant** (e.g., "system" mode that follows OS preference):

1. **Update Theme Type**:
   ```tsx
   type Theme = "light" | "dark" | "system";
   ```

2. **Add System Detection Logic**:
   ```tsx
   const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
     ? 'dark'
     : 'light';
   ```

3. **Update toggleTheme Logic**:
   ```tsx
   const toggleTheme = () => {
     // Cycle: light → dark → system → light
   };
   ```

4. **Add MediaQuery Listener** (for system theme):
   ```tsx
   useEffect(() => {
     const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
     const handleChange = () => { /* update theme */ };
     mediaQuery.addEventListener('change', handleChange);
     return () => mediaQuery.removeEventListener('change', handleChange);
   }, []);
   ```

**If adding color theme variants** (e.g., Blue, Beige, Neutral):

Note: The current implementation only handles light/dark mode. For color theme variants (mentioned in CLAUDE.md), you would need to extend the system:

1. **Extend Theme Type**:
   ```tsx
   type ColorTheme = "blue" | "beige" | "neutral";
   type Theme = "light" | "dark";

   interface ThemeContextType {
     theme: Theme;
     colorTheme: ColorTheme;
     toggleTheme: () => void;
     setColorTheme: (color: ColorTheme) => void;
   }
   ```

2. **Update localStorage Keys**:
   ```tsx
   localStorage.setItem("theme", theme);         // light/dark
   localStorage.setItem("colorTheme", colorTheme); // blue/beige/neutral
   ```

3. **Apply Color Theme Class**:
   ```tsx
   document.documentElement.setAttribute('data-color-theme', colorTheme);
   ```

4. **Update Tailwind Config**:
   ```js
   // Use data attribute selector
   plugins: [
     plugin(function({ addVariant }) {
       addVariant('blue', '[data-color-theme="blue"] &');
       addVariant('beige', '[data-color-theme="beige"] &');
       addVariant('neutral', '[data-color-theme="neutral"] &');
     })
   ]
   ```

### Hydration Considerations

**Problem**: Theme initialization requires accessing `localStorage`, which is only available in the browser. This can cause hydration mismatches between server-rendered HTML and client-side React.

**Solution Implemented**:
```tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
  // Initialize theme from localStorage
}, []);
```

**Why This Works**:
- Server renders with default theme (light)
- Client renders with default theme initially (matches server)
- After mount, `useEffect` runs and reads localStorage
- Theme updates without hydration mismatch

**Best Practice**: Always check `mounted` state before rendering theme-dependent content if SSR compatibility is critical.

### Testing Theme Switching

**Manual Testing Checklist**:
1. Toggle theme → verify localStorage updates
2. Refresh page → verify theme persists
3. Check dark mode styles on all pages:
   - `/` (home)
   - `/passage/[book]/[chapter]` (main reading interface)
   - `/books` (book catalog)
   - `/mypage` (user dashboard)
4. Verify no hydration warnings in console

**Future: Automated Testing**:
```tsx
// Example with React Testing Library
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from './theme-provider';

test('toggles theme and persists to localStorage', async () => {
  const TestComponent = () => {
    const { theme, toggleTheme } = useTheme();
    return (
      <div>
        <span>{theme}</span>
        <button onClick={toggleTheme}>Toggle</button>
      </div>
    );
  };

  render(
    <ThemeProvider>
      <TestComponent />
    </ThemeProvider>
  );

  expect(screen.getByText('light')).toBeInTheDocument();

  await userEvent.click(screen.getByText('Toggle'));

  expect(screen.getByText('dark')).toBeInTheDocument();
  expect(localStorage.getItem('theme')).toBe('dark');
  expect(document.documentElement.classList.contains('dark')).toBe(true);
});
```

## Dependencies

**Internal**:
- None (self-contained)

**External**:
- `react` - Context API, hooks (useState, useEffect, useContext)
- `tailwindcss` - Dark mode styling via `dark:` variant

**Used By**:
- `app/layout.tsx` - Root layout wraps app with ThemeProvider
- `components/passage/GlobalHeader.tsx` - Includes ThemeToggle button
- All components using `dark:` Tailwind variants

## Common Patterns

### Accessing Theme in Components

```tsx
import { useTheme } from '@/components/theme/theme-provider';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>
        Switch to {theme === 'light' ? 'dark' : 'light'} mode
      </button>
    </div>
  );
}
```

### Conditional Rendering Based on Theme

```tsx
const { theme } = useTheme();

return (
  <div>
    {theme === 'dark' ? (
      <DarkModeLogo />
    ) : (
      <LightModeLogo />
    )}
  </div>
);
```

### Theme-Aware Dynamic Styles

```tsx
const { theme } = useTheme();

const iconColor = theme === 'dark' ? '#ffffff' : '#000000';

return <CustomIcon color={iconColor} />;
```

## Notes

**Current State**:
- Theme system handles light/dark mode only
- Color theme variants (Blue, Beige, Neutral) mentioned in CLAUDE.md are not yet implemented in this component
- Color themes may be handled elsewhere (likely in Tailwind config + CSS custom properties)

**Future Enhancements**:
- Add "system" theme option (follows OS preference)
- Integrate color theme variants (blue/beige/neutral) into this provider
- Add transition animations for theme changes
- Add theme preview mode for settings page
