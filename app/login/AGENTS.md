<!-- Parent: ../AGENTS.md -->
# App - Login

## Purpose

User authentication page for signing in to Bible Soom.

## Key Files

- **page.tsx** - Login page component

## For AI Agents

### Page Overview

Provides login interface using Supabase authentication (email/password or OAuth providers).

### Authentication Flow

1. User enters email and password
2. Click "Sign In" button
3. Call Supabase auth API via `supabase.auth.signInWithPassword()`
4. On success: Redirect to `/` or return URL
5. On error: Display error message

### Form Fields

**Email**:
- Input type: email
- Required, validated for email format
- Placeholder: "Enter your email"

**Password**:
- Input type: password
- Required, minimum length (e.g., 6 characters)
- Show/hide password toggle
- Placeholder: "Enter your password"

### OAuth Providers (Optional)

Social login buttons:
- Google
- GitHub
- Apple

```typescript
const handleOAuthLogin = async (provider: Provider) => {
  await supabase.auth.signInWithOAuth({ provider });
};
```

### Error Handling

Display user-friendly errors:
- "Invalid email or password"
- "Too many login attempts. Please try again later."
- "Network error. Please check your connection."

### Success Redirect

After successful login:
```typescript
const searchParams = useSearchParams();
const returnUrl = searchParams.get('returnUrl') || '/';
router.push(returnUrl);
```

Allows deep-linking: `/login?returnUrl=/bible/korHRV/Gen/1`

### Sign Up Link

Link to registration page:
```
Don't have an account? <Link href="/signup">Sign up</Link>
```

### Forgot Password

Link to password reset:
```
<Link href="/forgot-password">Forgot password?</Link>
```

### Already Logged In

If user is already authenticated:
```typescript
const { user } = useAuth();
if (user) {
  router.push('/');
  return null;
}
```

## Dependencies

- **Internal**:
  - `lib/supabase/client` - Browser Supabase client
  - `components/auth/auth-provider` - Auth context
  - `components/ui/` - Form components (input, button)

- **External**:
  - Supabase auth API
  - Next.js `useRouter`, `useSearchParams`
  - React hooks (useState)

## Form Validation

Client-side validation before submission:
```typescript
const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validatePassword = (password: string) => {
  return password.length >= 6;
};
```

## Security Considerations

- Never log passwords
- Use HTTPS only (enforced by Supabase)
- Implement rate limiting via Supabase settings
- Clear sensitive data on unmount
- Use secure password input (no autocomplete for password)

## Common Modifications

- **Remember Me**: Persist session with checkbox
- **Two-Factor Auth**: Add 2FA code input
- **Magic Link**: Send passwordless login email
- **Biometric Auth**: Add fingerprint/Face ID on mobile
- **Session Timeout**: Warn before session expires

## Related Files

- `app/signup/page.tsx` - Registration page
- `components/auth/auth-provider.tsx` - Auth context provider
- `lib/supabase/client.ts` - Supabase client
