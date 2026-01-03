-- Add UNIQUE constraints to notes, highlights, bookmarks tables
-- Migration: 2026-01-03

-- ============================================
-- Add UNIQUE constraint to notes table
-- ============================================
-- Drop existing constraint if any (in case it exists with different name)
DO $$
BEGIN
    ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_user_id_verse_id_key;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Add the unique constraint
ALTER TABLE notes ADD CONSTRAINT notes_user_id_verse_id_key UNIQUE (user_id, verse_id);

-- ============================================
-- Add UNIQUE constraint to highlights table
-- ============================================
DO $$
BEGIN
    ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_user_id_verse_id_key;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

ALTER TABLE highlights ADD CONSTRAINT highlights_user_id_verse_id_key UNIQUE (user_id, verse_id);

-- ============================================
-- Add UNIQUE constraint to bookmarks table
-- ============================================
DO $$
BEGIN
    ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_verse_id_key;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

ALTER TABLE bookmarks ADD CONSTRAINT bookmarks_user_id_verse_id_key UNIQUE (user_id, verse_id);
