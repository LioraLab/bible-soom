# Scripts Directory

<!-- Parent: ../AGENTS.md -->

## Purpose

Python scripts for importing Bible translations and running database migrations for the Bible Soom application. These scripts interface directly with Supabase using service role credentials to populate and maintain Bible text data.

## Key Files

### Import Scripts (Normalized Schema)

- **import_normalized_hrv.py** - Import Korean HRV (개역개정) translation to `verse_translations` table
  - Reads Korean Bible text and inserts into normalized schema
  - Maps verses to canonical `new_verses` table IDs
  - Uses `translations` table metadata for translation_id lookup

- **import_normalized_niv.py** - Import NIV 2011 translation to `verse_translations` table
  - Similar to HRV import but for English NIV text
  - Follows normalized schema pattern with verse_id and translation_id references

### Legacy Import Scripts (Wide Table)

- **import_hrv_wide_table.py** - **DEPRECATED**: Import to `verses.korhrv` column
  - Legacy approach using wide table with per-translation columns
  - Kept for backward compatibility during migration period

- **import_niv_from_bolls.py** - **DEPRECATED**: Fetch NIV from bolls.life API
  - Imports NIV text by fetching from external bolls.life API
  - Writes to `verses.niv` column (wide table approach)

### Utilities

- **run_migration.py** - Utility to execute SQL migration files
  - Reads `.sql` files from `supabase/migrations/`
  - Executes against Supabase database using service role
  - Handles migration tracking and rollback scenarios

## Subdirectories

None

## For AI Agents

### Important Constraints

- **Authentication**: These scripts use `SUPABASE_SERVICE_ROLE_KEY` to write directly to the database, **bypassing RLS policies**
- **Environment**: Requires Python 3.8+ and `supabase-py` package (`pip install supabase`)
- **Configuration**: Must have `.env.local` with `SUPABASE_SERVICE_ROLE_KEY` set

### Schema Evolution

**Current State**: Transitioning from wide table to normalized schema

- **Normalized Schema (NEW)**: Import scripts should populate `verse_translations` table
  - Each verse references `new_verses.id` (canonical verse structure)
  - Each translation references `translations.id` (metadata)
  - Pattern: `(verse_id, translation_id, text)` - one row per verse per translation

- **Wide Table (LEGACY)**: Old scripts populate `verses.korhrv`, `verses.niv` columns
  - Adding new translations requires schema changes (new columns)
  - Being phased out in favor of normalized approach

### Best Practices

1. **New Translation Imports**: Always use normalized schema pattern
   - Look up `translation_id` from `translations` table
   - Match verses by `(book_abbr_eng, chapter, verse)` to get `verse_id` from `new_verses`
   - Insert into `verse_translations` with upsert on conflict

2. **Data Validation**: Scripts should validate:
   - All 31,102 verses present (OT: 23,145, NT: 7,957)
   - Book/chapter/verse references match canonical structure
   - No duplicate entries for same `(verse_id, translation_id)`

3. **Error Handling**: Scripts should be idempotent and handle:
   - Network failures (for API-based imports)
   - Partial imports (resume capability)
   - Data corruption detection

## Dependencies

### Python Packages

- **supabase-py**: Official Supabase Python client
- **python-dotenv**: Environment variable loading from `.env.local`
- **requests**: HTTP library (for API-based imports like bolls.life)

### Database Dependencies

- **Service Role Access**: Scripts require elevated permissions to bypass RLS
- **Canonical Data**: Imports depend on `new_books`, `new_verses`, `translations` tables being populated first

### Related Code

- Migration files: `/supabase/migrations/` - SQL schema definitions
- API endpoints: `/app/api/v1/translations/` - Frontend consumes imported data
- Constants: `/lib/constants.ts` - `TRANSLATION_COLUMNS` maps legacy column names

## Common Operations

### Adding a New Translation

```bash
# 1. Add metadata to translations table (via Supabase dashboard or SQL)
# INSERT INTO translations (code, name, language, year, available, display_order)
# VALUES ('zhCUV', '和合本', 'zh', 1919, true, 10);

# 2. Create import script: scripts/import_normalized_<translation>.py
python scripts/import_normalized_chuv.py

# 3. Verify import
# Check row count in verse_translations for new translation_id
```

### Running Migrations

```bash
# Apply all pending migrations
python scripts/run_migration.py

# Apply specific migration
python scripts/run_migration.py supabase/migrations/20260116_normalized_schema.sql
```

## Security Notes

- **Never commit** `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY`
- Service role key has **full database access** - use carefully
- Scripts should run in trusted environments only (not client-side)
