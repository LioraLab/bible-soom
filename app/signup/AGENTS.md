<!-- Parent: ../AGENTS.md -->
# App - Sign Up

## Purpose

User registration page for creating new Bible Soom accounts.

## Key Files

- **page.tsx** - Sign up page component

## For AI Agents

### Page Overview

Provides registration interface using Supabase authentication for creating new user accounts.

### Registration Flow

1. User enters email, password, and confirmation password
2. Client-side validation
3. Click "Sign Up" button
4. Call Supabase auth API via `supabase.auth.signUp()`
5. Send email verification (if enabled)
6. On success: Show success message or auto-login
7. On error: Display error message

### Form Fields

**Email**:
- Input type: email
- Required, validated for email format
- Check if email already exists (optional)
- Placeholder: "Enter your email"

**Password**:
- Input type: password
- Required, minimum 6-8 characters
- Must include: uppercase, lowercase, number (optional)
- Show password strength indicator
- Placeholder: "Create a password"

**Confirm Password**:
- Input type: password
- Must match password field
- Real-time validation
- Placeholder: "Confirm your password"

**Terms of Service** (optional):
- Checkbox: "I agree to the Terms of Service and Privacy Policy"
- Required to submit

### Password Strength Indicator

Visual feedback on password strength:
```typescript
const getPasswordStrength = (password: string) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  return strength; // 0-5
};
```

Display: Weak / Fair / Good / Strong

### Email Verification

After signup:
1. Supabase sends verification email
2. Show message: "Check your email to verify your account"
3. User clicks link in email
4. Redirect to app with verified status

### OAuth Registration (Optional)

Social signup buttons:
- Google
- GitHub
- Apple

Same as login OAuth flow.

### Error Handling

Display user-friendly errors:
- "Email already in use"
- "Password is too weak"
- "Passwords do not match"
- "Network error. Please try again."

### Success State

After successful registration:
```typescript
// Option 1: Email verification required
return <VerificationMessage email={email} />;

// Option 2: Auto-login (if verification disabled)
router.push('/');
```

### Login Link

Link to login page:
```
Already have an account? <Link href="/login">Sign in</Link>
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
  - `components/ui/` - Form components

- **External**:
  - Supabase auth API
  - Next.js `useRouter`
  - React hooks (useState)

## Form Validation

Client-side validation before submission:
```typescript
const errors = {};
if (!validateEmail(email)) {
  errors.email = "Invalid email format";
}
if (password.length < 8) {
  errors.password = "Password must be at least 8 characters";
}
if (password !== confirmPassword) {
  errors.confirmPassword = "Passwords do not match";
}
```

## User Profile Creation

After successful signup, create user profile:
1. Supabase auth trigger creates record in `users` table
2. Or manually insert after signup:
```typescript
await supabase.from('users').insert({
  id: user.id,
  email: user.email,
  created_at: new Date()
});
```

## Security Considerations

- Enforce strong password requirements
- Rate limit signup attempts (via Supabase)
- Use CAPTCHA to prevent bot signups (optional)
- Never log passwords
- Validate email format on both client and server

## Common Modifications

- **Add Profile Fields**: Name, username, preferences during signup
- **Invite Codes**: Require invitation code for registration
- **Email Domain Whitelist**: Restrict to certain domains
- **SMS Verification**: Send verification code via SMS instead of email
- **Progressive Profiling**: Collect minimal info at signup, more later

## Related Files

- `app/login/page.tsx` - Login page
- `components/auth/auth-provider.tsx` - Auth context provider
- `lib/supabase/client.ts` - Supabase client
- `supabase/migrations/` - User table creation with trigger
