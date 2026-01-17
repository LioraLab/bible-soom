# Supabase Client Wrappers

<!-- Parent: ../AGENTS.md -->

## Purpose

This directory contains Supabase client factory functions that provide properly configured clients for different execution contexts (browser vs server). These wrappers ensure correct authentication handling and session management across Next.js 15's App Router architecture.

## Key Files

### `client.ts`
**Browser-side Supabase client factory**

- **Function**: `createBrowserSupabase()`
- **Context**: Client Components (React components with `'use client'` directive)
- **Implementation**: Wraps `createClientComponentClient()` from `@supabase/auth-helpers-nextjs`
- **Authentication**: Uses browser cookies and localStorage for session management
- **Use Cases**:
  - Interactive UI components that need real-time data
  - Client-side data fetching in `useEffect` hooks
  - User-triggered actions (form submissions, mutations)
  - Components in `AuthProvider`, `PassageClient`, `MyPage`, etc.

### `server.ts`
**Server-side Supabase client factory**

- **Function**: `createServerSupabase()`
- **Context**: Server Components, API Routes, Server Actions
- **Implementation**: Wraps `createRouteHandlerClient()` with `cookies()` from `next/headers`
- **Authentication**: Uses Next.js server-side cookies for session validation
- **Next.js 15+ 호환성**: `cookies()` 반환 타입 변경에 따른 타입 캐스팅 적용
- **Use Cases**:
  - API route handlers in `app/api/v1/**`
  - Server Components (default in App Router)
  - Server Actions
  - Authentication guards (`authGuard()` in `lib/auth.ts`)

## For AI Agents

### CRITICAL RULES

⚠️ **NEVER MIX CLIENT AND SERVER SUPABASE INSTANCES** ⚠️

**INCORRECT** (will cause authentication failures):
```typescript
// ❌ WRONG: Using client instance in API route
import { createBrowserSupabase } from '@/lib/supabase/client';

export async function GET(request: Request) {
  const supabase = createBrowserSupabase(); // ❌ NO! This will fail
  // ...
}
```

**CORRECT**:
```typescript
// ✅ RIGHT: Using server instance in API route
import { createServerSupabase } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createServerSupabase(); // ✅ YES
  // ...
}
```

### Context Detection Rules

| File Location/Type | Use This | Example |
|-------------------|----------|---------|
| `app/api/**/route.ts` | `createServerSupabase()` | API route handlers |
| Server Components (no `'use client'`) | `createServerSupabase()` | Default App Router components |
| Client Components (`'use client'`) | `createBrowserSupabase()` | Interactive React components |
| Server Actions | `createServerSupabase()` | Functions with `'use server'` |
| Middleware (`middleware.ts`) | Special client (see Next.js docs) | Auth middleware |

### Common Patterns

**API Route with Authentication**:
```typescript
// app/api/v1/highlights/route.ts
import { createServerSupabase } from '@/lib/supabase/server';
import { authGuard } from '@/lib/auth';

export async function GET(request: Request) {
  // authGuard() internally uses createServerSupabase()
  const guard = await authGuard();
  if (!guard.ok) return guard.response;

  const { supabase, user } = guard;
  const { data } = await supabase.from('highlights').select('*');
  // ...
}
```

**Client Component with Data Fetching**:
```typescript
// components/passage/passage-client.tsx
'use client';

import { createBrowserSupabase } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export function PassageClient() {
  const supabase = createBrowserSupabase();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('highlights').select('*');
      // ...
    };
    fetchData();
  }, []);
  // ...
}
```

### Why This Matters

**Server Context** (`createServerSupabase()`):
- Uses `cookies()` from `next/headers` to read HTTP-only auth cookies
- Works in server-side rendering (SSR) and API routes
- Has access to service role capabilities when configured
- Respects Row Level Security (RLS) policies with user context

**Browser Context** (`createBrowserSupabase()`):
- Uses browser's `document.cookie` and localStorage
- Works in client-side React components
- Automatically refreshes tokens on the client
- Cannot access server-only features

**Mixing them causes**:
- ❌ `cookies()` errors in client components ("cookies() can only be used in Server Components")
- ❌ Authentication failures (session not found)
- ❌ Hydration mismatches between server and client
- ❌ Broken user sessions

## Dependencies

```json
{
  "@supabase/supabase-js": "^2.x",
  "@supabase/auth-helpers-nextjs": "^0.x",
  "next": "^15.x"
}
```

**Required Environment Variables**:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public anonymous key (client-side safe)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (server-only, never expose to client)

## Related Files

- `lib/auth.ts`: Uses `createServerSupabase()` for `authGuard()` helper
- `components/auth/auth-provider.tsx`: Uses `createBrowserSupabase()` for `AuthProvider`
- All API routes in `app/api/v1/*`: Should use `createServerSupabase()`
- All client components with data fetching: Should use `createBrowserSupabase()`

## Schema Context

These clients connect to the Supabase PostgreSQL database with the following key tables:
- `users`, `notes`, `highlights`, `bookmarks` (user data with RLS)
- `new_verses`, `verse_translations`, `translations` (normalized schema)
- `verses`, `books` (legacy wide table schema)

RLS policies ensure users can only access their own data, even with the anon key.
