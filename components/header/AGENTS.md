<!-- Parent: ../AGENTS.md -->
# Components - Header

## Purpose

Global navigation header component displayed across all pages.

## Key Files

- **header.tsx** - Main header component with navigation and auth controls

## For AI Agents

### Component Overview

The header is rendered in `app/layout.tsx` and appears on every page. It provides:
- Application logo/title
- Navigation links (Home, Books, Search, My Page)
- User authentication status
- Sign in/out controls
- Theme toggle (light/dark mode)

### Authentication Integration

```typescript
// Uses useAuth hook from AuthProvider
const { user, loading, signOut } = useAuth();

// Conditional rendering based on auth state
{user ? (
  <div>
    <span>{user.email}</span>
    <button onClick={signOut}>Sign Out</button>
  </div>
) : (
  <Link href="/login">Sign In</Link>
)}
```

### Navigation Structure

**Public Routes**:
- `/` - Home page
- `/books` - Book catalog
- `/search` - Bible search
- `/login` - Sign in page
- `/signup` - Sign up page

**Protected Routes**:
- `/mypage` - User dashboard (requires auth)

### Theme Integration

The header includes a theme toggle button that:
- Calls `setTheme()` from ThemeProvider context
- Switches between light/dark modes
- Persists preference to localStorage
- Updates Tailwind `dark` class on document

### Responsive Design

- **Desktop**: Horizontal navigation with all links visible
- **Mobile**: Hamburger menu with slide-out drawer
- **Tablet**: Adaptive layout based on screen width

### Styling

Uses Tailwind CSS with theme-aware colors:
```typescript
className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
```

Sticky positioning to remain visible while scrolling:
```typescript
className="sticky top-0 z-50"
```

## Dependencies

- **Internal**:
  - `hooks/useAuth` - Authentication context (from components/auth/auth-provider)
  - `components/theme/theme-provider` - Theme context for dark mode toggle
  - `components/ui/` - UI components (buttons, icons, dropdown)

- **External**:
  - Next.js `Link` component for client-side navigation
  - React hooks (useState for mobile menu state)
  - lucide-react icons (Menu, X, Sun, Moon, User)

## Common Modifications

- **Add Search Bar**: Embed quick search input in header
- **Notifications**: Add notification bell with unread count
- **User Avatar**: Display user profile picture instead of email
- **Language Selector**: Add dropdown for UI language selection
- **Breadcrumbs**: Show current location in Bible (Book > Chapter)
- **Reading Progress**: Add progress bar for current book

## Related Files

- `app/layout.tsx` - Where header is rendered
- `components/auth/auth-provider.tsx` - Provides useAuth hook
- `components/theme/theme-provider.tsx` - Provides theme context
- `components/ui/` - Base UI components

## Testing Considerations

- Test auth state transitions (logged out → logged in → logged out)
- Verify mobile menu open/close behavior
- Check theme toggle persists across page navigation
- Ensure protected route links hidden when logged out
