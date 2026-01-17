# lib/ - Utilities and Shared Logic

<!-- Parent: ../AGENTS.md -->

## Purpose

This directory contains utilities, constants, and shared business logic used throughout the Bible Soom application. It provides centralized configuration, authentication middleware, Supabase client wrappers, and book metadata.

## Key Files

### auth.ts
Server-side authentication middleware that provides `authGuard()` function for protecting API routes and server components.

**Usage:**
```typescript
import { authGuard } from '@/lib/auth';

const result = await authGuard();
if (!result.ok) return result.response; // 401 Unauthorized
const { supabase, user } = result;
```

### constants.ts
**Single source of truth** for all app-wide constants. Contains:
- `TRANSLATIONS` - Supported translation list
- `TRANSLATION_COLUMNS` - Translation code → DB column mapping (legacy compatibility)
- `BOOK_CHAPTERS` - Chapter counts for all 66 books
- `HIGHLIGHT_COLORS` - Highlight color options
- `FONT_SIZE_CLASSES` - Tailwind font size classes
- `HIGHLIGHT_BG_CLASSES` - Highlight background colors with dark mode support

**Important:** `TRANSLATION_COLUMNS` is deprecated. New code should use `/api/v1/translations` API for dynamic translation loading.

### books.ts
Book data and utility functions for working with biblical books (66 books metadata, abbreviations, etc.).

## Subdirectories

### supabase/
Supabase client wrappers with critical browser/server separation:

- **client.ts** - `createBrowserSupabase()` for client components (browser)
  - Wraps `createClientComponentClient()`
  - Use in React components with `'use client'`

- **server.ts** - `createServerSupabase()` for server components and API routes
  - Wraps `createRouteHandlerClient()` + `cookies()`
  - Use in API routes and server components

See [supabase/AGENTS.md](./supabase/AGENTS.md) for detailed documentation.

## For AI Agents

### CRITICAL: Never Mix Client/Server Supabase Instances

```typescript
// ✅ CORRECT - Client component
'use client';
import { createBrowserSupabase } from '@/lib/supabase/client';

// ✅ CORRECT - API route / server component
import { createServerSupabase } from '@/lib/supabase/server';

// ❌ WRONG - Using browser client in server code
import { createBrowserSupabase } from '@/lib/supabase/client';
export async function GET() {
  const supabase = createBrowserSupabase(); // AUTH WILL FAIL!
}
```

**Consequences of mixing:** Authentication failures, cookies not working, security issues.

### Constants Best Practices

1. **Always import from constants.ts** - Never hardcode values that exist there
2. **Translation handling:**
   - Legacy: `TRANSLATION_COLUMNS` (for wide table queries)
   - Modern: Fetch from `/api/v1/translations` API (for normalized schema)
3. **Dark mode support:** Use `HIGHLIGHT_BG_CLASSES` which includes `dark:` variants

### Authentication Pattern

```typescript
// In API routes (app/api/v1/*/route.ts)
import { authGuard } from '@/lib/auth';

export async function GET(request: Request) {
  const guard = await authGuard();
  if (!guard.ok) return guard.response;

  const { supabase, user } = guard;
  // Use authenticated supabase client and user object
}
```

## Dependencies

- `@supabase/supabase-js` - Supabase JavaScript client
- `@supabase/ssr` - Supabase SSR utilities
- `next/headers` - Next.js `cookies()` for server-side auth
- Tailwind CSS - For constant class names

## Related Documentation

- [../CLAUDE.md](../CLAUDE.md) - Full project architecture
- [../app/api/v1/AGENTS.md](../app/api/v1/AGENTS.md) - API routes that use these utilities
- [supabase/AGENTS.md](./supabase/AGENTS.md) - Detailed Supabase client documentation
