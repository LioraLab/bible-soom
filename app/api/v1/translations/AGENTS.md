# API v1 Translations Endpoint

<!-- Parent: ../AGENTS.md -->

## Purpose

This directory contains the API endpoint for retrieving available Bible translation metadata. It powers dynamic translation selection throughout the application.

## Key Files

- **route.ts** - GET endpoint that returns the list of available Bible translations from the normalized schema

## For AI Agents

### Endpoint Details

**GET /api/v1/translations**

- **Authentication**: Public endpoint (no auth required)
- **Response Format**:
  ```json
  {
    "translations": [
      {
        "id": "uuid",
        "code": "korHRV",
        "name": "개역개정",
        "language": "ko",
        "year": 1998,
        "available": true,
        "display_order": 1
      }
    ]
  }
  ```

### Architecture Pattern

This endpoint implements the **normalized schema pattern** for translation management:

1. **Dynamic Discovery**: UI components fetch this endpoint to populate translation options
2. **No Hardcoding**: Adding new translations to the `translations` table automatically makes them available
3. **Zero Code Changes**: New translations require only database INSERT, not frontend updates

### Usage in Application

- **PanelHeader.tsx**: Fetches this endpoint to populate translation dropdown
- **PassageClient.tsx**: May use for validating translation codes
- **Translation Addition Workflow**:
  1. INSERT into `translations` table with `available=true`
  2. UI automatically shows new option (no code deploy needed)

### Database Schema Reference

Queries the `translations` table:
- Filters by `available = true` (excludes disabled translations)
- Orders by `display_order` (controls UI display sequence)

### Migration Context

This endpoint is part of the **normalized schema migration**:
- **OLD**: `lib/constants.ts` with hardcoded `TRANSLATIONS` array
- **NEW**: Dynamic fetching from database (this endpoint)
- **Status**: New approach is preferred; constants remain for backward compatibility

### Error Handling

Returns 500 status with error message if database query fails. No retry logic - expects stable database connection.

## Dependencies

- `lib/supabase/server` - Server-side Supabase client factory
- Database table: `translations` (requires `available` and `display_order` columns)

## Related Files

- `/lib/constants.ts` - Legacy static translation list (fallback only)
- `/components/passage/PanelHeader.tsx` - Primary consumer of this endpoint
- `/supabase/migrations/20260116_normalized_schema.sql` - Defines `translations` table schema
