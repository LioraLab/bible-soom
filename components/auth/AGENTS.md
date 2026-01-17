# Auth Components Directory

<!-- Parent: ../AGENTS.md -->

## Purpose

Authentication components and context providers for managing user authentication state throughout the Bible Soom application. This directory provides the foundation for all auth-related UI and state management using Supabase authentication.

## Key Files

### `auth-provider.tsx` (61 lines)

**Core authentication context provider** that wraps the entire application.

**Exports**:
- `AuthProvider` component - React Context provider
- `useAuth()` hook - Access auth state in any component

**API**:
```typescript
const { user, loading, signOut } = useAuth();

interface AuthContextType {
  user: User | null;          // Supabase User object or null if not authenticated
  loading: boolean;           // True during initial session check or auth state changes
  signOut: () => Promise<void>; // Signs out the user and clears state
}
```

**Implementation Details**:
- Uses `createBrowserSupabase()` (client-side Supabase instance)
- Monitors auth state changes via `supabase.auth.onAuthStateChange()`
- Performs initial session check with `supabase.auth.getSession()`
- Automatically updates `user` state when auth changes (login/logout)
- Cleanup: Unsubscribes from auth listener on unmount

**State Management**:
- `user`: Tracks current authenticated user
- `loading`: Prevents UI flicker during auth initialization

**Usage Pattern**:
```tsx
import { useAuth } from '@/components/auth/auth-provider';

function ProtectedComponent() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) return <LoginPrompt />;

  return <div>Welcome, {user.email}</div>;
}
```

## For AI Agents

### Critical Rules

1. **Client Component Only**: `auth-provider.tsx` is a client component (`'use client'`)
   - Uses React hooks (useState, useEffect, useContext)
   - Accesses browser-side Supabase client
   - Cannot be used in Server Components directly

2. **Provider Setup**: Must wrap app in root layout
   ```tsx
   // app/layout.tsx
   export default function RootLayout({ children }) {
     return (
       <AuthProvider>
         {children}
       </AuthProvider>
     );
   }
   ```

3. **Server-Side Auth**: For server components/API routes, use `authGuard()` instead
   ```tsx
   // Server Component or API Route
   import { authGuard } from '@/lib/auth';

   const result = await authGuard();
   if (!result.ok) return result.response; // 401
   const { user, supabase } = result;
   ```

### Where useAuth() Is Used

**Current Consumers**:
- `components/header/header.tsx` - Show login/logout button, user avatar
- `components/passage/passage-client.tsx` - Load user highlights/notes/bookmarks
- `components/mypage/mypage-client.tsx` - Display user profile and activity

**When to Use**:
- ✅ Need to check if user is logged in (UI conditional rendering)
- ✅ Display user-specific data (email, name)
- ✅ Implement logout functionality
- ✅ Show loading state during auth initialization

**When NOT to Use**:
- ❌ Server Components (use `authGuard()` instead)
- ❌ API Routes (use `authGuard()` instead)
- ❌ Middleware (use Next.js middleware with Supabase)

### Auth Flow

**Login Flow** (handled by Supabase Auth UI):
1. User enters credentials in login page
2. Supabase processes authentication
3. `onAuthStateChange` callback fires in AuthProvider
4. `user` state updates automatically
5. Components re-render with new auth state

**Logout Flow**:
```tsx
const { signOut } = useAuth();

async function handleLogout() {
  await signOut();
  // user state automatically becomes null
  // Components re-render and redirect to login
}
```

**Session Persistence**:
- Supabase stores session in browser storage
- AuthProvider restores session on page load via `getSession()`
- No manual token management required

### Common Patterns

**Protected Route Pattern**:
```tsx
'use client';
import { useAuth } from '@/components/auth/auth-provider';

export default function ProtectedPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <LoginPrompt />;
    // Or: redirect('/login')
  }

  return <ProtectedContent user={user} />;
}
```

**Conditional Rendering Based on Auth**:
```tsx
const { user } = useAuth();

return (
  <>
    {user ? (
      <button onClick={handleSaveNote}>Save Note</button>
    ) : (
      <p>Please log in to save notes</p>
    )}
  </>
);
```

**User-Specific Data Fetching**:
```tsx
const { user } = useAuth();

useEffect(() => {
  if (!user) return;

  fetch(`/api/v1/highlights?user_id=${user.id}`)
    .then(res => res.json())
    .then(setHighlights);
}, [user]);
```

### Error Handling

**Context Usage Errors**:
- If `useAuth()` is called outside `<AuthProvider>`, throws error:
  ```
  Error: useAuth must be used within AuthProvider
  ```
- **Solution**: Ensure AuthProvider wraps the component tree in root layout

**Auth State Errors**:
- AuthProvider handles Supabase auth errors silently
- Session failures result in `user: null` state
- Components should always check `if (!user)` before accessing user data

### Extending Auth Features

**Adding User Metadata**:
```tsx
// auth-provider.tsx (extend context)
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  profile: UserProfile | null; // NEW
};

// Fetch profile after user loads
useEffect(() => {
  if (!user) return;

  supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
    .then(({ data }) => setProfile(data));
}, [user]);
```

**Adding Refresh Token Logic**:
```tsx
// auth-provider.tsx
useEffect(() => {
  const interval = setInterval(() => {
    supabase.auth.refreshSession();
  }, 30 * 60 * 1000); // 30 minutes

  return () => clearInterval(interval);
}, []);
```

## Dependencies

**Internal Dependencies**:
- `lib/supabase/client.ts` - `createBrowserSupabase()` function
- `@supabase/supabase-js` - Supabase TypeScript types (`User`, `Session`)

**External Dependencies**:
- `react` - Context API, hooks (useState, useEffect, useContext)

**Reverse Dependencies** (components using this):
- `components/header/header.tsx`
- `components/passage/passage-client.tsx`
- `components/mypage/mypage-client.tsx`
- Any future protected components

## Testing Considerations

**Unit Testing** (future):
```tsx
import { renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './auth-provider';

test('useAuth returns user after login', async () => {
  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;
  const { result } = renderHook(() => useAuth(), { wrapper });

  // Mock Supabase auth
  await waitFor(() => {
    expect(result.current.user).toBeTruthy();
  });
});
```

**Integration Testing**:
- Test login flow with real Supabase instance (staging environment)
- Verify session persistence across page reloads
- Test logout clears user state properly

## Performance Considerations

**Optimization Notes**:
- AuthProvider renders once at root level (minimal re-renders)
- `user` state updates only trigger when auth state actually changes
- Subscription cleanup prevents memory leaks

**Potential Improvements**:
- Memoize `signOut` function with `useCallback`
- Add error state for failed auth operations
- Implement retry logic for network failures during session check

---

**For questions about server-side authentication, see `/home/wl/workspace/projects/bible-soom/lib/auth.ts`**
