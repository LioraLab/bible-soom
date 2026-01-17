# Supabase Migrations Directory - AI Agent Guide

<!-- Parent: ../supabase/AGENTS.md -->

## Purpose

This directory contains chronologically ordered SQL migration files that define the database schema evolution for Bible Soom. Migrations are executed in filename order to progressively build and modify the PostgreSQL database structure.

## Key Files

### Active Schema (Current)

- **20260116_normalized_schema.sql** - **PRIMARY SCHEMA**: Defines the normalized database structure
  - `new_books` - 66 Bible books with language-neutral structure
  - `book_names` - Multilingual book names (ko, en, zh, ja)
  - `translations` - Translation metadata (korHRV, NIV, etc.)
  - `new_verses` - Canonical verse structure (no text, structure only)
  - `verse_translations` - Actual translated text with foreign keys

- **20260116_user_data_tables.sql** - User-generated content tables
  - `users` - User profiles (synced with auth.users)
  - `notes` - User notes on verses
  - `highlights` - Verse highlights with colors
  - `bookmarks` - Saved verses
  - Includes RLS policies for data protection

- **20260116_clean_schema.sql** - Schema cleanup operations
  - Removes redundant constraints
  - Optimizes indexes
  - Cleans up migration artifacts

### Historical Migrations

- **20260102_new_schema.sql** - Initial schema definition
  - Created legacy `books` and `verses` wide tables
  - Established baseline structure

- **20260103_add_unique_constraints.sql** - Data integrity
  - Added UNIQUE constraints on user data tables
  - `(user_id, verse_id)` uniqueness for notes, highlights, bookmarks

- **20260103_fix_user_id_references.sql** - Foreign key corrections
  - Fixed user_id references to auth.users
  - Added ON DELETE CASCADE for user cleanup

## Migration Naming Convention

**Pattern**: `YYYYMMDD_description.sql`

- **YYYYMMDD**: Migration date (ensures chronological ordering)
- **description**: Snake_case description of changes
- **Example**: `20260116_normalized_schema.sql`

## Schema Evolution Timeline

```
20260102 → Initial wide table schema (verses.korhrv, verses.niv columns)
20260103 → Add constraints and fix foreign keys
20260116 → Normalize schema (translations + verse_translations tables)
         → User data tables with RLS
         → Schema cleanup
```

## For AI Agents

### Critical Rules

1. **NEVER MODIFY EXISTING MIGRATIONS**
   - Migration files are immutable once applied
   - To change schema, create a NEW migration file
   - Use `YYYYMMDD_` prefix with today's date

2. **Always Include RLS Policies**
   - User data tables MUST have Row Level Security
   - Standard pattern: `auth.uid() = user_id`
   - Enable RLS: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`

3. **Migration File Template**
   ```sql
   -- Description: Brief description of changes
   -- Date: YYYY-MM-DD

   BEGIN;

   -- Your changes here

   COMMIT;
   ```

4. **Foreign Key Best Practices**
   - Use `ON DELETE CASCADE` for user-owned data
   - Use `ON DELETE SET NULL` for optional references
   - Always index foreign key columns

5. **Index Strategy**
   - Add indexes for foreign keys
   - Add GIN indexes for full-text search columns
   - Example: `CREATE INDEX idx_verse_translations_text ON verse_translations USING GIN (to_tsvector('simple', text));`

### Common Migration Patterns

**Adding a New User Data Table**:
```sql
CREATE TABLE new_feature (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verse_id UUID NOT NULL REFERENCES new_verses(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

-- RLS Policies
ALTER TABLE new_feature ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own new_feature"
  ON new_feature FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own new_feature"
  ON new_feature FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own new_feature"
  ON new_feature FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own new_feature"
  ON new_feature FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_new_feature_user_id ON new_feature(user_id);
CREATE INDEX idx_new_feature_verse_id ON new_feature(verse_id);
```

**Adding a New Translation** (Normalized Schema):
```sql
-- No schema change needed!
-- Just INSERT into translations table:
INSERT INTO translations (code, name, language, year, available, display_order)
VALUES ('zhCUV', '和合本', 'zh', 1919, true, 10);

-- Then populate verse_translations via import script
```

**Modifying Existing Tables**:
```sql
-- Add column
ALTER TABLE table_name ADD COLUMN new_column TEXT;

-- Add constraint
ALTER TABLE table_name ADD CONSTRAINT constraint_name CHECK (condition);

-- Create index
CREATE INDEX idx_table_column ON table_name(column);
```

### Migration Checklist

Before creating a new migration:
- [ ] Is this a schema change or data population?
- [ ] Have I checked that no existing migration does this?
- [ ] Does my migration include a BEGIN/COMMIT transaction?
- [ ] Are all foreign keys indexed?
- [ ] Are RLS policies included for user data tables?
- [ ] Have I tested this migration on a local Supabase instance?
- [ ] Is the filename correctly formatted as `YYYYMMDD_description.sql`?

### Testing Migrations Locally

```bash
# Reset local Supabase database
supabase db reset

# Apply all migrations
supabase db push

# Check migration status
supabase migration list
```

### Rollback Strategy

Supabase migrations are forward-only. To rollback:
1. Create a new migration that reverses the changes
2. Name it: `YYYYMMDD_rollback_previous_migration.sql`
3. Example:
   ```sql
   -- Rollback: Remove column added in 20260116_add_column.sql
   ALTER TABLE table_name DROP COLUMN column_name;
   ```

## Normalized Schema Benefits

**Why We Migrated from Wide Table**:

| Aspect | Wide Table (Legacy) | Normalized Schema (Current) |
|--------|---------------------|------------------------------|
| Add Translation | ALTER TABLE (schema change) | INSERT (data only) |
| Multilingual Support | Hardcoded Korean names | `book_names` table |
| Metadata | Embedded in code | `translations` table |
| Scalability | Limited by columns | Unlimited translations |
| Verse References | Inconsistent | Canonical `verse_id` |

**Current Coexistence**:
- Both schemas exist during transition period
- Legacy code uses `verses` table (wide columns)
- New code uses `verse_translations` table (normalized)
- Future: Legacy schema will be dropped after full migration

## Dependencies

- **PostgreSQL**: Supabase-hosted PostgreSQL database
- **Supabase CLI**: For migration management (`supabase migration new`, `supabase db push`)
- **RLS (Row Level Security)**: Postgres feature for authorization
- **auth.users**: Supabase Auth table (referenced by user_id foreign keys)

## Related Files

- `../AGENTS.md` - Parent Supabase directory documentation
- `../../scripts/` - Python import scripts that populate migrated schema
- `../../lib/supabase/` - Supabase client wrappers used by API routes
- `../../app/api/v1/` - API routes that query these tables

## Migration History

Total migrations: 6

- **3 initial migrations** (Jan 2-3, 2026): Legacy wide table setup
- **3 normalized migrations** (Jan 16, 2026): Current active schema

## Next Steps (Future Migrations)

Planned schema changes:
- [ ] Data migration from `verses` → `verse_translations`
- [ ] Drop legacy `books` and `verses` tables
- [ ] Add full-text search indexes for multiple languages
- [ ] Add verse cross-reference tables
- [ ] Add commentary/study notes tables
