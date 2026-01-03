-- Bible Soom New Schema (Wide Table Design)
-- Migration: 2026-01-02

-- 기존 테이블 삭제 (순서 중요: FK 참조 역순으로)
DROP TABLE IF EXISTS bookmarks CASCADE;
DROP TABLE IF EXISTS highlights CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS translation_verses CASCADE;
DROP TABLE IF EXISTS canonical_verses CASCADE;
DROP TABLE IF EXISTS translations CASCADE;
DROP TABLE IF EXISTS canonical_books CASCADE;

-- ============================================
-- 1. 성경 책 정보 테이블
-- ============================================
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,           -- 한글명: 창세기, 출애굽기, ...
  name_eng TEXT UNIQUE NOT NULL,       -- 영문명: Genesis, Exodus, ...
  abbr TEXT NOT NULL,                  -- 약어: 창, 출, 레, ...
  abbr_eng TEXT NOT NULL,              -- 영문 약어: Gen, Exo, Lev, ...
  testament TEXT CHECK (testament IN ('OT', 'NT')) NOT NULL,
  book_order INT UNIQUE NOT NULL,      -- 성경 순서 (1-66)
  chapters INT NOT NULL                -- 총 장 수
);

-- ============================================
-- 2. 성경 구절 테이블 (Wide Table - 병렬보기 최적화)
-- ============================================
CREATE TABLE verses (
  id BIGSERIAL PRIMARY KEY,
  book TEXT NOT NULL REFERENCES books(name),
  chapter INT NOT NULL,
  verse INT NOT NULL,

  -- 번역본 컬럼들 (4개)
  korHRV TEXT,     -- 개역개정 4판
  korRV TEXT,      -- 개역한글
  korNRSV TEXT,    -- 새번역 (또는 공동번역 등)
  NIV TEXT,        -- New International Version (영어)

  UNIQUE(book, chapter, verse)
);

-- 인덱스: 책+장 조회 최적화
CREATE INDEX idx_verses_book_chapter ON verses(book, chapter);

-- 인덱스: 전체 텍스트 검색 (한글)
CREATE INDEX idx_verses_korhrv_gin ON verses USING gin(to_tsvector('simple', korHRV));

-- ============================================
-- 3. 사용자 테이블 (Supabase Auth 연동)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 새 사용자 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users(auth_user_id, display_name)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. 노트 테이블 (Canonical 기준 - 번역본 독립적)
-- ============================================
CREATE TABLE notes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  verse_id BIGINT REFERENCES verses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_verse_id ON notes(verse_id);

-- ============================================
-- 5. 하이라이트 테이블 (Canonical 기준)
-- ============================================
CREATE TABLE highlights (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  verse_id BIGINT REFERENCES verses(id) ON DELETE CASCADE,
  color TEXT DEFAULT 'yellow',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

CREATE INDEX idx_highlights_user_id ON highlights(user_id);
CREATE INDEX idx_highlights_verse_id ON highlights(verse_id);

-- ============================================
-- 6. 북마크 테이블 (Canonical 기준)
-- ============================================
CREATE TABLE bookmarks (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  verse_id BIGINT REFERENCES verses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, verse_id)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_verse_id ON bookmarks(verse_id);

-- ============================================
-- Row Level Security (RLS) 활성화
-- ============================================
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 본인 데이터만 접근
CREATE POLICY "user_owns_notes" ON notes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "user_owns_highlights" ON highlights
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "user_owns_bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 성경 66권 기본 데이터 삽입
-- ============================================
INSERT INTO books (name, name_eng, abbr, abbr_eng, testament, book_order, chapters) VALUES
-- 구약 (Old Testament)
('창세기', 'Genesis', '창', 'Gen', 'OT', 1, 50),
('출애굽기', 'Exodus', '출', 'Exo', 'OT', 2, 40),
('레위기', 'Leviticus', '레', 'Lev', 'OT', 3, 27),
('민수기', 'Numbers', '민', 'Num', 'OT', 4, 36),
('신명기', 'Deuteronomy', '신', 'Deu', 'OT', 5, 34),
('여호수아', 'Joshua', '수', 'Jos', 'OT', 6, 24),
('사사기', 'Judges', '삿', 'Jdg', 'OT', 7, 21),
('룻기', 'Ruth', '룻', 'Rut', 'OT', 8, 4),
('사무엘상', '1 Samuel', '삼상', '1Sa', 'OT', 9, 31),
('사무엘하', '2 Samuel', '삼하', '2Sa', 'OT', 10, 24),
('열왕기상', '1 Kings', '왕상', '1Ki', 'OT', 11, 22),
('열왕기하', '2 Kings', '왕하', '2Ki', 'OT', 12, 25),
('역대상', '1 Chronicles', '대상', '1Ch', 'OT', 13, 29),
('역대하', '2 Chronicles', '대하', '2Ch', 'OT', 14, 36),
('에스라', 'Ezra', '스', 'Ezr', 'OT', 15, 10),
('느헤미야', 'Nehemiah', '느', 'Neh', 'OT', 16, 13),
('에스더', 'Esther', '에', 'Est', 'OT', 17, 10),
('욥기', 'Job', '욥', 'Job', 'OT', 18, 42),
('시편', 'Psalms', '시', 'Psa', 'OT', 19, 150),
('잠언', 'Proverbs', '잠', 'Pro', 'OT', 20, 31),
('전도서', 'Ecclesiastes', '전', 'Ecc', 'OT', 21, 12),
('아가', 'Song of Solomon', '아', 'Sng', 'OT', 22, 8),
('이사야', 'Isaiah', '사', 'Isa', 'OT', 23, 66),
('예레미야', 'Jeremiah', '렘', 'Jer', 'OT', 24, 52),
('예레미야애가', 'Lamentations', '애', 'Lam', 'OT', 25, 5),
('에스겔', 'Ezekiel', '겔', 'Eze', 'OT', 26, 48),
('다니엘', 'Daniel', '단', 'Dan', 'OT', 27, 12),
('호세아', 'Hosea', '호', 'Hos', 'OT', 28, 14),
('요엘', 'Joel', '욜', 'Joe', 'OT', 29, 3),
('아모스', 'Amos', '암', 'Amo', 'OT', 30, 9),
('오바댜', 'Obadiah', '옵', 'Oba', 'OT', 31, 1),
('요나', 'Jonah', '욘', 'Jon', 'OT', 32, 4),
('미가', 'Micah', '미', 'Mic', 'OT', 33, 7),
('나훔', 'Nahum', '나', 'Nah', 'OT', 34, 3),
('하박국', 'Habakkuk', '합', 'Hab', 'OT', 35, 3),
('스바냐', 'Zephaniah', '습', 'Zep', 'OT', 36, 3),
('학개', 'Haggai', '학', 'Hag', 'OT', 37, 2),
('스가랴', 'Zechariah', '슥', 'Zec', 'OT', 38, 14),
('말라기', 'Malachi', '말', 'Mal', 'OT', 39, 4),

-- 신약 (New Testament)
('마태복음', 'Matthew', '마', 'Mat', 'NT', 40, 28),
('마가복음', 'Mark', '막', 'Mar', 'NT', 41, 16),
('누가복음', 'Luke', '눅', 'Luk', 'NT', 42, 24),
('요한복음', 'John', '요', 'Joh', 'NT', 43, 21),
('사도행전', 'Acts', '행', 'Act', 'NT', 44, 28),
('로마서', 'Romans', '롬', 'Rom', 'NT', 45, 16),
('고린도전서', '1 Corinthians', '고전', '1Co', 'NT', 46, 16),
('고린도후서', '2 Corinthians', '고후', '2Co', 'NT', 47, 13),
('갈라디아서', 'Galatians', '갈', 'Gal', 'NT', 48, 6),
('에베소서', 'Ephesians', '엡', 'Eph', 'NT', 49, 6),
('빌립보서', 'Philippians', '빌', 'Phi', 'NT', 50, 4),
('골로새서', 'Colossians', '골', 'Col', 'NT', 51, 4),
('데살로니가전서', '1 Thessalonians', '살전', '1Th', 'NT', 52, 5),
('데살로니가후서', '2 Thessalonians', '살후', '2Th', 'NT', 53, 3),
('디모데전서', '1 Timothy', '딤전', '1Ti', 'NT', 54, 6),
('디모데후서', '2 Timothy', '딤후', '2Ti', 'NT', 55, 4),
('디도서', 'Titus', '딛', 'Tit', 'NT', 56, 3),
('빌레몬서', 'Philemon', '몬', 'Phm', 'NT', 57, 1),
('히브리서', 'Hebrews', '히', 'Heb', 'NT', 58, 13),
('야고보서', 'James', '약', 'Jam', 'NT', 59, 5),
('베드로전서', '1 Peter', '벧전', '1Pe', 'NT', 60, 5),
('베드로후서', '2 Peter', '벧후', '2Pe', 'NT', 61, 3),
('요한1서', '1 John', '요일', '1Jo', 'NT', 62, 5),
('요한2서', '2 John', '요이', '2Jo', 'NT', 63, 1),
('요한3서', '3 John', '요삼', '3Jo', 'NT', 64, 1),
('유다서', 'Jude', '유', 'Jud', 'NT', 65, 1),
('요한계시록', 'Revelation', '계', 'Rev', 'NT', 66, 22);

COMMENT ON TABLE verses IS '성경 구절 테이블 (Wide Table - 병렬보기 최적화)';
COMMENT ON COLUMN verses.korHRV IS '개역개정 4판 (Korean Revised Version)';
COMMENT ON COLUMN verses.korRV IS '개역한글판';
COMMENT ON COLUMN verses.korNRSV IS '새번역 (또는 공동번역)';
COMMENT ON COLUMN verses.NIV IS 'New International Version (영어)';
