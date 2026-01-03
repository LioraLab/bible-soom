-- Fix user_id to reference auth.users.id directly
-- Migration: 2026-01-03

-- ============================================
-- 1. 기존 테이블의 user_id를 auth.users.id로 변경
-- ============================================

-- RLS 정책 먼저 삭제
DROP POLICY IF EXISTS "user_owns_notes" ON notes;
DROP POLICY IF EXISTS "user_owns_highlights" ON highlights;
DROP POLICY IF EXISTS "user_owns_bookmarks" ON bookmarks;

-- 외래키 제약 삭제
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_user_id_fkey;
ALTER TABLE highlights DROP CONSTRAINT IF EXISTS highlights_user_id_fkey;
ALTER TABLE bookmarks DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey;

-- user_id 컬럼 타입 변경 및 새 외래키 추가
ALTER TABLE notes
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid,
  ADD CONSTRAINT notes_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE highlights
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid,
  ADD CONSTRAINT highlights_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE bookmarks
  ALTER COLUMN user_id TYPE UUID USING user_id::uuid,
  ADD CONSTRAINT bookmarks_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- 2. 새로운 RLS 정책 (간단하게)
-- ============================================

CREATE POLICY "user_owns_notes" ON notes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "user_owns_highlights" ON highlights
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "user_owns_bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- 3. users 테이블 재구성 (프로필 정보 전용)
-- ============================================

-- 트리거 삭제 (더 이상 자동 생성 불필요)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- users 테이블을 프로필 전용으로 재구성
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화 (사용자는 자신의 프로필만 수정 가능, 모든 프로필은 읽기 가능)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_all" ON users
  FOR SELECT USING (true);

CREATE POLICY "users_update_own" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "users_insert_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 프로필 테이블 인덱스
CREATE INDEX idx_users_id ON users(id);

COMMENT ON TABLE users IS '사용자 프로필 정보 (선택적)';
