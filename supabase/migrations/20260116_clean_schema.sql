-- ============================================
-- Bible Soom: Clean Normalized Schema
-- Date: 2026-01-16
-- Purpose: Create normalized schema from scratch
-- ============================================

BEGIN;

-- ============================================
-- STEP 1: Create Normalized Tables
-- ============================================

-- 1. BOOKS: Canonical book structure
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  abbr_eng TEXT UNIQUE NOT NULL,
  testament TEXT CHECK (testament IN ('OT', 'NT')) NOT NULL,
  book_order INT UNIQUE NOT NULL,
  chapters INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_books_testament ON books(testament);
CREATE INDEX idx_books_order ON books(book_order);

-- 2. BOOK_NAMES: Multilingual book names
CREATE TABLE book_names (
  id SERIAL PRIMARY KEY,
  book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  name TEXT NOT NULL,
  abbr TEXT NOT NULL,
  UNIQUE(book_id, language),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_book_names_book_id ON book_names(book_id);
CREATE INDEX idx_book_names_language ON book_names(language);
CREATE INDEX idx_book_names_name ON book_names(name);

-- 3. TRANSLATIONS: Translation metadata
CREATE TABLE translations (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  language TEXT NOT NULL,
  full_name TEXT,
  year INT,
  available BOOLEAN DEFAULT true,
  display_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_translations_language ON translations(language);
CREATE INDEX idx_translations_available ON translations(available);

-- 4. VERSES: Canonical verse structure
CREATE TABLE verses (
  id BIGSERIAL PRIMARY KEY,
  book_id INT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter INT NOT NULL,
  verse INT NOT NULL,
  UNIQUE(book_id, chapter, verse),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_verses_book_chapter ON verses(book_id, chapter);
CREATE INDEX idx_verses_book_id ON verses(book_id);

-- 5. VERSE_TRANSLATIONS: Translated text
CREATE TABLE verse_translations (
  id BIGSERIAL PRIMARY KEY,
  verse_id BIGINT NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
  translation_id INT NOT NULL REFERENCES translations(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  UNIQUE(verse_id, translation_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_verse_translations_verse_id ON verse_translations(verse_id);
CREATE INDEX idx_verse_translations_translation_id ON verse_translations(translation_id);
CREATE INDEX idx_verse_translations_composite ON verse_translations(translation_id, verse_id);
CREATE INDEX idx_verse_translations_text_gin ON verse_translations USING gin(to_tsvector('simple', text));

-- ============================================
-- STEP 2: Insert Metadata
-- ============================================

-- Insert 66 books
INSERT INTO books (abbr_eng, testament, book_order, chapters) VALUES
-- Old Testament (1-39)
('Gen', 'OT', 1, 50), ('Exo', 'OT', 2, 40), ('Lev', 'OT', 3, 27), ('Num', 'OT', 4, 36), ('Deu', 'OT', 5, 34),
('Jos', 'OT', 6, 24), ('Jdg', 'OT', 7, 21), ('Rut', 'OT', 8, 4), ('1Sa', 'OT', 9, 31), ('2Sa', 'OT', 10, 24),
('1Ki', 'OT', 11, 22), ('2Ki', 'OT', 12, 25), ('1Ch', 'OT', 13, 29), ('2Ch', 'OT', 14, 36), ('Ezr', 'OT', 15, 10),
('Neh', 'OT', 16, 13), ('Est', 'OT', 17, 10), ('Job', 'OT', 18, 42), ('Psa', 'OT', 19, 150), ('Pro', 'OT', 20, 31),
('Ecc', 'OT', 21, 12), ('Sng', 'OT', 22, 8), ('Isa', 'OT', 23, 66), ('Jer', 'OT', 24, 52), ('Lam', 'OT', 25, 5),
('Eze', 'OT', 26, 48), ('Dan', 'OT', 27, 12), ('Hos', 'OT', 28, 14), ('Joe', 'OT', 29, 3), ('Amo', 'OT', 30, 9),
('Oba', 'OT', 31, 1), ('Jon', 'OT', 32, 4), ('Mic', 'OT', 33, 7), ('Nah', 'OT', 34, 3), ('Hab', 'OT', 35, 3),
('Zep', 'OT', 36, 3), ('Hag', 'OT', 37, 2), ('Zec', 'OT', 38, 14), ('Mal', 'OT', 39, 4),
-- New Testament (40-66)
('Mat', 'NT', 40, 28), ('Mar', 'NT', 41, 16), ('Luk', 'NT', 42, 24), ('Joh', 'NT', 43, 21), ('Act', 'NT', 44, 28),
('Rom', 'NT', 45, 16), ('1Co', 'NT', 46, 16), ('2Co', 'NT', 47, 13), ('Gal', 'NT', 48, 6), ('Eph', 'NT', 49, 6),
('Phi', 'NT', 50, 4), ('Col', 'NT', 51, 4), ('1Th', 'NT', 52, 5), ('2Th', 'NT', 53, 3), ('1Ti', 'NT', 54, 6),
('2Ti', 'NT', 55, 4), ('Tit', 'NT', 56, 3), ('Phm', 'NT', 57, 1), ('Heb', 'NT', 58, 13), ('Jam', 'NT', 59, 5),
('1Pe', 'NT', 60, 5), ('2Pe', 'NT', 61, 3), ('1Jo', 'NT', 62, 5), ('2Jo', 'NT', 63, 1), ('3Jo', 'NT', 64, 1),
('Jud', 'NT', 65, 1), ('Rev', 'NT', 66, 22);

-- Insert Korean book names (66)
INSERT INTO book_names (book_id, language, name, abbr) VALUES
(1, 'ko', '창세기', '창'), (2, 'ko', '출애굽기', '출'), (3, 'ko', '레위기', '레'), (4, 'ko', '민수기', '민'), (5, 'ko', '신명기', '신'),
(6, 'ko', '여호수아', '수'), (7, 'ko', '사사기', '삿'), (8, 'ko', '룻기', '룻'), (9, 'ko', '사무엘상', '삼상'), (10, 'ko', '사무엘하', '삼하'),
(11, 'ko', '열왕기상', '왕상'), (12, 'ko', '열왕기하', '왕하'), (13, 'ko', '역대상', '대상'), (14, 'ko', '역대하', '대하'), (15, 'ko', '에스라', '스'),
(16, 'ko', '느헤미야', '느'), (17, 'ko', '에스더', '에'), (18, 'ko', '욥기', '욥'), (19, 'ko', '시편', '시'), (20, 'ko', '잠언', '잠'),
(21, 'ko', '전도서', '전'), (22, 'ko', '아가', '아'), (23, 'ko', '이사야', '사'), (24, 'ko', '예레미야', '렘'), (25, 'ko', '예레미야애가', '애'),
(26, 'ko', '에스겔', '겔'), (27, 'ko', '다니엘', '단'), (28, 'ko', '호세아', '호'), (29, 'ko', '요엘', '욜'), (30, 'ko', '아모스', '암'),
(31, 'ko', '오바댜', '옵'), (32, 'ko', '요나', '욘'), (33, 'ko', '미가', '미'), (34, 'ko', '나훔', '나'), (35, 'ko', '하박국', '합'),
(36, 'ko', '스바냐', '습'), (37, 'ko', '학개', '학'), (38, 'ko', '스가랴', '슥'), (39, 'ko', '말라기', '말'),
(40, 'ko', '마태복음', '마'), (41, 'ko', '마가복음', '막'), (42, 'ko', '누가복음', '눅'), (43, 'ko', '요한복음', '요'), (44, 'ko', '사도행전', '행'),
(45, 'ko', '로마서', '롬'), (46, 'ko', '고린도전서', '고전'), (47, 'ko', '고린도후서', '고후'), (48, 'ko', '갈라디아서', '갈'), (49, 'ko', '에베소서', '엡'),
(50, 'ko', '빌립보서', '빌'), (51, 'ko', '골로새서', '골'), (52, 'ko', '데살로니가전서', '살전'), (53, 'ko', '데살로니가후서', '살후'), (54, 'ko', '디모데전서', '딤전'),
(55, 'ko', '디모데후서', '딤후'), (56, 'ko', '디도서', '딛'), (57, 'ko', '빌레몬서', '몬'), (58, 'ko', '히브리서', '히'), (59, 'ko', '야고보서', '약'),
(60, 'ko', '베드로전서', '벧전'), (61, 'ko', '베드로후서', '벧후'), (62, 'ko', '요한1서', '요일'), (63, 'ko', '요한2서', '요이'), (64, 'ko', '요한3서', '요삼'),
(65, 'ko', '유다서', '유'), (66, 'ko', '요한계시록', '계');

-- Insert English book names (66)
INSERT INTO book_names (book_id, language, name, abbr) VALUES
(1, 'en', 'Genesis', 'Gen'), (2, 'en', 'Exodus', 'Exo'), (3, 'en', 'Leviticus', 'Lev'), (4, 'en', 'Numbers', 'Num'), (5, 'en', 'Deuteronomy', 'Deu'),
(6, 'en', 'Joshua', 'Jos'), (7, 'en', 'Judges', 'Jdg'), (8, 'en', 'Ruth', 'Rut'), (9, 'en', '1 Samuel', '1Sa'), (10, 'en', '2 Samuel', '2Sa'),
(11, 'en', '1 Kings', '1Ki'), (12, 'en', '2 Kings', '2Ki'), (13, 'en', '1 Chronicles', '1Ch'), (14, 'en', '2 Chronicles', '2Ch'), (15, 'en', 'Ezra', 'Ezr'),
(16, 'en', 'Nehemiah', 'Neh'), (17, 'en', 'Esther', 'Est'), (18, 'en', 'Job', 'Job'), (19, 'en', 'Psalms', 'Psa'), (20, 'en', 'Proverbs', 'Pro'),
(21, 'en', 'Ecclesiastes', 'Ecc'), (22, 'en', 'Song of Songs', 'Sng'), (23, 'en', 'Isaiah', 'Isa'), (24, 'en', 'Jeremiah', 'Jer'), (25, 'en', 'Lamentations', 'Lam'),
(26, 'en', 'Ezekiel', 'Eze'), (27, 'en', 'Daniel', 'Dan'), (28, 'en', 'Hosea', 'Hos'), (29, 'en', 'Joel', 'Joe'), (30, 'en', 'Amos', 'Amo'),
(31, 'en', 'Obadiah', 'Oba'), (32, 'en', 'Jonah', 'Jon'), (33, 'en', 'Micah', 'Mic'), (34, 'en', 'Nahum', 'Nah'), (35, 'en', 'Habakkuk', 'Hab'),
(36, 'en', 'Zephaniah', 'Zep'), (37, 'en', 'Haggai', 'Hag'), (38, 'en', 'Zechariah', 'Zec'), (39, 'en', 'Malachi', 'Mal'),
(40, 'en', 'Matthew', 'Mat'), (41, 'en', 'Mark', 'Mar'), (42, 'en', 'Luke', 'Luk'), (43, 'en', 'John', 'Joh'), (44, 'en', 'Acts', 'Act'),
(45, 'en', 'Romans', 'Rom'), (46, 'en', '1 Corinthians', '1Co'), (47, 'en', '2 Corinthians', '2Co'), (48, 'en', 'Galatians', 'Gal'), (49, 'en', 'Ephesians', 'Eph'),
(50, 'en', 'Philippians', 'Phi'), (51, 'en', 'Colossians', 'Col'), (52, 'en', '1 Thessalonians', '1Th'), (53, 'en', '2 Thessalonians', '2Th'), (54, 'en', '1 Timothy', '1Ti'),
(55, 'en', '2 Timothy', '2Ti'), (56, 'en', 'Titus', 'Tit'), (57, 'en', 'Philemon', 'Phm'), (58, 'en', 'Hebrews', 'Heb'), (59, 'en', 'James', 'Jam'),
(60, 'en', '1 Peter', '1Pe'), (61, 'en', '2 Peter', '2Pe'), (62, 'en', '1 John', '1Jo'), (63, 'en', '2 John', '2Jo'), (64, 'en', '3 John', '3Jo'),
(65, 'en', 'Jude', 'Jud'), (66, 'en', 'Revelation', 'Rev');

-- Insert translations
INSERT INTO translations (code, name, language, available, display_order) VALUES
('korHRV', '개역개정', 'ko', true, 1),
('NIV', 'NIV2011', 'en', true, 2),
('korRV', '개역한글', 'ko', false, 3),
('korNRSV', '새번역', 'ko', false, 4);

COMMIT;

-- Success message
SELECT 'Migration completed successfully!' as status;
SELECT COUNT(*) as books_count FROM books;
SELECT COUNT(*) as book_names_count FROM book_names;
SELECT COUNT(*) as translations_count FROM translations;
