-- ============================================
-- Bible Soom: Normalized Schema Migration
-- Date: 2026-01-16
-- Purpose: Migrate from wide table to normalized structure
-- ============================================

BEGIN;

-- ============================================
-- STEP 1: Create New Normalized Tables
-- ============================================

-- 1. BOOKS: Canonical book structure (language-agnostic)
CREATE TABLE new_books (
  id SERIAL PRIMARY KEY,
  abbr_eng TEXT UNIQUE NOT NULL,  -- URL identifier (Gen, Exo, Matt)
  testament TEXT CHECK (testament IN ('OT', 'NT')) NOT NULL,
  book_order INT UNIQUE NOT NULL,  -- Canonical order (1-66)
  chapters INT NOT NULL,           -- Number of chapters
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_new_books_testament ON new_books(testament);
CREATE INDEX idx_new_books_order ON new_books(book_order);

COMMENT ON TABLE new_books IS 'Canonical 66 Bible books (language-agnostic)';
COMMENT ON COLUMN new_books.abbr_eng IS 'English abbreviation for URL routing';

-- 2. BOOK_NAMES: Multilingual book names
CREATE TABLE book_names (
  id SERIAL PRIMARY KEY,
  book_id INT NOT NULL REFERENCES new_books(id) ON DELETE CASCADE,
  language TEXT NOT NULL,  -- ISO 639-1: ko, en, zh, ja, es
  name TEXT NOT NULL,      -- Full name in that language
  abbr TEXT NOT NULL,      -- Abbreviation in that language
  UNIQUE(book_id, language),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_book_names_book_id ON book_names(book_id);
CREATE INDEX idx_book_names_language ON book_names(language);
CREATE INDEX idx_book_names_name ON book_names(name);

COMMENT ON TABLE book_names IS 'Book names and abbreviations in multiple languages';

-- 3. TRANSLATIONS: Translation metadata
CREATE TABLE translations (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,  -- korHRV, NIV, zhCUV, jaCLB
  name TEXT NOT NULL,         -- 개역개정, NIV2011, 和合本
  language TEXT NOT NULL,     -- ko, en, zh, ja
  full_name TEXT,
  year INT,
  available BOOLEAN DEFAULT true,
  display_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_translations_language ON translations(language);
CREATE INDEX idx_translations_available ON translations(available);

COMMENT ON TABLE translations IS 'Bible translation versions (metadata only)';
COMMENT ON COLUMN translations.code IS 'Unique code used in URLs and API calls';

-- 4. VERSES: Canonical verse structure
CREATE TABLE new_verses (
  id BIGSERIAL PRIMARY KEY,
  book_id INT NOT NULL REFERENCES new_books(id) ON DELETE CASCADE,
  chapter INT NOT NULL,
  verse INT NOT NULL,
  UNIQUE(book_id, chapter, verse),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_new_verses_book_chapter ON new_verses(book_id, chapter);
CREATE INDEX idx_new_verses_book_id ON new_verses(book_id);

COMMENT ON TABLE new_verses IS 'Canonical verse references (structure only, no text)';
COMMENT ON COLUMN new_verses.id IS 'Canonical verse ID referenced by user annotations';

-- 5. VERSE_TRANSLATIONS: Actual translated text
CREATE TABLE verse_translations (
  id BIGSERIAL PRIMARY KEY,
  verse_id BIGINT NOT NULL REFERENCES new_verses(id) ON DELETE CASCADE,
  translation_id INT NOT NULL REFERENCES translations(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  UNIQUE(verse_id, translation_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_verse_translations_verse_id ON verse_translations(verse_id);
CREATE INDEX idx_verse_translations_translation_id ON verse_translations(translation_id);
CREATE INDEX idx_verse_translations_composite ON verse_translations(translation_id, verse_id);

-- Full-text search indexes
CREATE INDEX idx_verse_translations_text_gin ON verse_translations
  USING gin(to_tsvector('simple', text));

COMMENT ON TABLE verse_translations IS 'Translated verse text for each translation';

-- ============================================
-- STEP 2: Migrate Data from Old Tables
-- ============================================

-- 2.1 Migrate books
INSERT INTO new_books (id, abbr_eng, testament, book_order, chapters)
SELECT id, abbr_eng, testament, book_order, chapters
FROM books
ORDER BY id;

-- Reset sequence to continue from max id
SELECT setval('new_books_id_seq', (SELECT MAX(id) FROM new_books));

-- 2.2 Migrate book names (Korean and English)
INSERT INTO book_names (book_id, language, name, abbr)
SELECT id, 'ko', name, abbr FROM books
UNION ALL
SELECT id, 'en', name_eng, abbr_eng FROM books
ORDER BY id, language;

-- 2.3 Create translations metadata
INSERT INTO translations (code, name, language, available, display_order, year) VALUES
('korHRV', '개역개정', 'ko', true, 1, 1998),
('korRV', '개역한글', 'ko', false, 2, 1961),
('korNRSV', '새번역', 'ko', false, 3, 2004),
('NIV', 'NIV2011', 'en', true, 4, 2011);

-- 2.4 Migrate verses (canonical structure)
-- This preserves the original verse IDs to maintain user data references
INSERT INTO new_verses (id, book_id, chapter, verse)
SELECT
  v.id,
  b.id as book_id,
  v.chapter,
  v.verse
FROM verses v
INNER JOIN books b ON b.name = v.book
ORDER BY v.id;

-- Reset sequence to continue from max id
SELECT setval('new_verses_id_seq', (SELECT MAX(id) FROM new_verses));

-- 2.5 Migrate verse_translations for korHRV
RAISE NOTICE 'Migrating korHRV translations...';
INSERT INTO verse_translations (verse_id, translation_id, text)
SELECT
  v.id,
  (SELECT id FROM translations WHERE code = 'korHRV'),
  old_v.korhrv
FROM new_verses v
INNER JOIN verses old_v ON old_v.id = v.id
WHERE old_v.korhrv IS NOT NULL AND old_v.korhrv != '';

-- 2.6 Migrate verse_translations for NIV
RAISE NOTICE 'Migrating NIV translations...';
INSERT INTO verse_translations (verse_id, translation_id, text)
SELECT
  v.id,
  (SELECT id FROM translations WHERE code = 'NIV'),
  old_v.niv
FROM new_verses v
INNER JOIN verses old_v ON old_v.id = v.id
WHERE old_v.niv IS NOT NULL AND old_v.niv != '';

-- 2.7 Migrate verse_translations for korRV (if exists)
RAISE NOTICE 'Migrating korRV translations...';
INSERT INTO verse_translations (verse_id, translation_id, text)
SELECT
  v.id,
  (SELECT id FROM translations WHERE code = 'korRV'),
  old_v.korrv
FROM new_verses v
INNER JOIN verses old_v ON old_v.id = v.id
WHERE old_v.korrv IS NOT NULL AND old_v.korrv != '';

-- 2.8 Migrate verse_translations for korNRSV (if exists)
RAISE NOTICE 'Migrating korNRSV translations...';
INSERT INTO verse_translations (verse_id, translation_id, text)
SELECT
  v.id,
  (SELECT id FROM translations WHERE code = 'korNRSV'),
  old_v.kornrsv
FROM new_verses v
INNER JOIN verses old_v ON old_v.id = v.id
WHERE old_v.kornrsv IS NOT NULL AND old_v.kornrsv != '';

-- ============================================
-- STEP 3: Verify Migration
-- ============================================

DO $$
DECLARE
  old_verse_count BIGINT;
  new_verse_count BIGINT;
  old_books_count INT;
  new_books_count INT;
  translation_count BIGINT;
  korhrv_count BIGINT;
  niv_count BIGINT;
BEGIN
  -- Count verses
  SELECT COUNT(*) INTO old_verse_count FROM verses;
  SELECT COUNT(*) INTO new_verse_count FROM new_verses;

  -- Count books
  SELECT COUNT(*) INTO old_books_count FROM books;
  SELECT COUNT(*) INTO new_books_count FROM new_books;

  -- Count translations
  SELECT COUNT(*) INTO translation_count FROM verse_translations;
  SELECT COUNT(*) INTO korhrv_count FROM verse_translations
    WHERE translation_id = (SELECT id FROM translations WHERE code = 'korHRV');
  SELECT COUNT(*) INTO niv_count FROM verse_translations
    WHERE translation_id = (SELECT id FROM translations WHERE code = 'NIV');

  -- Display results
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Migration Verification Results:';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Books: Old=%, New=%', old_books_count, new_books_count;
  RAISE NOTICE 'Verses: Old=%, New=%', old_verse_count, new_verse_count;
  RAISE NOTICE 'Total verse_translations: %', translation_count;
  RAISE NOTICE '  - korHRV: %', korhrv_count;
  RAISE NOTICE '  - NIV: %', niv_count;
  RAISE NOTICE '====================================';

  -- Verify counts match
  IF old_verse_count != new_verse_count THEN
    RAISE EXCEPTION 'Verse count mismatch! Old: %, New: %', old_verse_count, new_verse_count;
  END IF;

  IF old_books_count != new_books_count THEN
    RAISE EXCEPTION 'Books count mismatch! Old: %, New: %', old_books_count, new_books_count;
  END IF;

  RAISE NOTICE 'Migration verification PASSED ✓';
END $$;

-- ============================================
-- STEP 4: Update User Data Foreign Keys
-- ============================================
-- Note: User data tables (notes, highlights, bookmarks) already reference verses.id
-- Since we preserved the verse IDs, these references remain valid!
-- No migration needed for user data!

-- Verify user data integrity
DO $$
DECLARE
  orphan_notes INT;
  orphan_highlights INT;
  orphan_bookmarks INT;
BEGIN
  SELECT COUNT(*) INTO orphan_notes FROM notes
    WHERE verse_id NOT IN (SELECT id FROM new_verses);
  SELECT COUNT(*) INTO orphan_highlights FROM highlights
    WHERE verse_id NOT IN (SELECT id FROM new_verses);
  SELECT COUNT(*) INTO orphan_bookmarks FROM bookmarks
    WHERE verse_id NOT IN (SELECT id FROM new_verses);

  RAISE NOTICE '====================================';
  RAISE NOTICE 'User Data Integrity Check:';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Orphaned notes: %', orphan_notes;
  RAISE NOTICE 'Orphaned highlights: %', orphan_highlights;
  RAISE NOTICE 'Orphaned bookmarks: %', orphan_bookmarks;

  IF orphan_notes > 0 OR orphan_highlights > 0 OR orphan_bookmarks > 0 THEN
    RAISE EXCEPTION 'Found orphaned user data! Aborting migration.';
  END IF;

  RAISE NOTICE 'User data integrity check PASSED ✓';
  RAISE NOTICE '====================================';
END $$;

-- ============================================
-- STEP 5: Rename Tables (Swap Old and New)
-- ============================================

-- Backup old tables
ALTER TABLE books RENAME TO old_books_backup_20260116;
ALTER TABLE verses RENAME TO old_verses_backup_20260116;

-- Promote new tables to production names
ALTER TABLE new_books RENAME TO books;
ALTER TABLE new_verses RENAME TO verses;

-- Rename indexes to match new table names
ALTER INDEX idx_new_books_testament RENAME TO idx_books_testament;
ALTER INDEX idx_new_books_order RENAME TO idx_books_order;
ALTER INDEX idx_new_verses_book_chapter RENAME TO idx_verses_book_chapter;
ALTER INDEX idx_new_verses_book_id RENAME TO idx_verses_book_id;

-- Update foreign key constraints in user data tables to reference new verses table
-- (This is necessary because the table was renamed)
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_verse_id_fkey;
ALTER TABLE notes ADD CONSTRAINT notes_verse_id_fkey
  FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE CASCADE;

ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_verse_id_fkey;
ALTER TABLE highlights ADD CONSTRAINT highlights_verse_id_fkey
  FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE CASCADE;

ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_verse_id_fkey;
ALTER TABLE bookmarks ADD CONSTRAINT bookmarks_verse_id_fkey
  FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE CASCADE;

-- ============================================
-- STEP 6: Final Verification
-- ============================================

DO $$
DECLARE
  books_count INT;
  verses_count BIGINT;
  translations_count INT;
  verse_translations_count BIGINT;
  book_names_count INT;
  notes_count BIGINT;
  highlights_count BIGINT;
  bookmarks_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO books_count FROM books;
  SELECT COUNT(*) INTO verses_count FROM verses;
  SELECT COUNT(*) INTO translations_count FROM translations;
  SELECT COUNT(*) INTO verse_translations_count FROM verse_translations;
  SELECT COUNT(*) INTO book_names_count FROM book_names;
  SELECT COUNT(*) INTO notes_count FROM notes;
  SELECT COUNT(*) INTO highlights_count FROM highlights;
  SELECT COUNT(*) INTO bookmarks_count FROM bookmarks;

  RAISE NOTICE '';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'FINAL MIGRATION SUMMARY';
  RAISE NOTICE '====================================';
  RAISE NOTICE 'Core Data:';
  RAISE NOTICE '  - books: %', books_count;
  RAISE NOTICE '  - verses: %', verses_count;
  RAISE NOTICE '  - translations: %', translations_count;
  RAISE NOTICE '  - verse_translations: %', verse_translations_count;
  RAISE NOTICE '  - book_names: %', book_names_count;
  RAISE NOTICE '';
  RAISE NOTICE 'User Data (preserved):';
  RAISE NOTICE '  - notes: %', notes_count;
  RAISE NOTICE '  - highlights: %', highlights_count;
  RAISE NOTICE '  - bookmarks: %', bookmarks_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Old tables backed up as:';
  RAISE NOTICE '  - old_books_backup_20260116';
  RAISE NOTICE '  - old_verses_backup_20260116';
  RAISE NOTICE '';
  RAISE NOTICE 'Migration completed successfully! ✓';
  RAISE NOTICE '====================================';
END $$;

COMMIT;

-- ============================================
-- ROLLBACK SCRIPT (Run this if migration fails)
-- ============================================
--
-- BEGIN;
--
-- -- Drop new tables
-- DROP TABLE IF EXISTS verse_translations CASCADE;
-- DROP TABLE IF EXISTS verses CASCADE;
-- DROP TABLE IF EXISTS book_names CASCADE;
-- DROP TABLE IF EXISTS translations CASCADE;
-- DROP TABLE IF EXISTS books CASCADE;
--
-- -- Restore old tables
-- ALTER TABLE old_books_backup_20260116 RENAME TO books;
-- ALTER TABLE old_verses_backup_20260116 RENAME TO verses;
--
-- -- Recreate indexes on old tables
-- CREATE INDEX IF NOT EXISTS idx_verses_book_chapter ON verses(book, chapter);
-- CREATE INDEX IF NOT EXISTS idx_verses_korhrv_gin ON verses USING gin(to_tsvector('simple', korhrv));
--
-- -- Restore foreign key constraints
-- ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_verse_id_fkey;
-- ALTER TABLE notes ADD CONSTRAINT notes_verse_id_fkey
--   FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE CASCADE;
--
-- ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_verse_id_fkey;
-- ALTER TABLE highlights ADD CONSTRAINT highlights_verse_id_fkey
--   FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE CASCADE;
--
-- ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_verse_id_fkey;
-- ALTER TABLE bookmarks ADD CONSTRAINT bookmarks_verse_id_fkey
--   FOREIGN KEY (verse_id) REFERENCES verses(id) ON DELETE CASCADE;
--
-- COMMIT;
