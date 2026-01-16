# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Bible Soom은 Next.js 15 (App Router) + React 18 + TypeScript로 구축된 성경 묵상 웹 애플리케이션입니다. Supabase를 백엔드로 사용하며, 성경 본문 읽기, 하이라이트, 메모, 북마크 기능을 제공합니다.

## Development Commands

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 3000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행 (빌드 후)
npm start

# ESLint 실행
npm run lint
```

**Note**: 현재 테스트 스크립트는 package.json에 정의되어 있지 않습니다.

## Environment Setup

`.env.local` 파일 필수 변수:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Core Architecture

### 5-Layer Structure

1. **Pages (Routes)** - `app/` - Next.js App Router 라우트
2. **Components (UI)** - `components/` - React 컴포넌트
3. **API** - `app/api/v1/*` - Next.js route handlers
4. **Services/Utilities** - `lib/` - Supabase 클라이언트, 인증, 상수
5. **Database** - Supabase PostgreSQL (스키마: `supabase/migrations/*.sql`)

### Critical Architectural Points

#### 1. Schema Evolution: Wide Table → Normalized Structure

**⚠️ 현재 전환 중**: 프로젝트는 wide table에서 정규화된 스키마로 마이그레이션 중입니다.

**레거시 Wide Table (기존 방식)**:
```typescript
// lib/constants.ts - @deprecated
export const TRANSLATION_COLUMNS: Record<string, string> = {
  korHRV: "korhrv",   // verses 테이블의 컬럼명
  NIV: "niv",
};
```
- `verses` 테이블에 번역본별 컬럼 (korhrv, niv, kornrsv 등)
- 새 번역본 추가 시 테이블 컬럼 추가 필요 (스키마 변경)

**정규화된 스키마 (신규 방식)** - `20260116_normalized_schema.sql`:
```
books (id, abbr_eng, testament, chapters)
  ↓
book_names (book_id, language, name, abbr)  -- 다국어 지원
  ↓
new_verses (id, book_id, chapter, verse)    -- 구조만
  ↓
verse_translations (verse_id, translation_id, text)  -- 실제 본문
  ↑
translations (id, code, name, language)     -- 메타데이터
```

**새 번역본 추가 절차 (정규화된 스키마)**:
1. `translations` 테이블에 메타데이터 INSERT
2. `verse_translations` 테이블에 본문 데이터 INSERT
3. UI는 `/api/v1/translations`에서 자동으로 목록 가져옴
4. ✅ 스키마 변경 불필요 - 데이터만 추가

**코드에서의 처리**:
- `lib/constants.ts`의 `TRANSLATION_COLUMNS`는 레거시 호환용
- 새 코드에서는 `/api/v1/translations` API 사용
- `TRANSLATIONS` 배열은 fallback으로만 사용

#### 2. Server vs Client Supabase Instances

**중요한 구분**:

```typescript
// 클라이언트 컴포넌트용 (브라우저)
import { createBrowserSupabase } from '@/lib/supabase/client';
// → createClientComponentClient()를 래핑

// 서버 컴포넌트 & API 라우트용 (서버)
import { createServerSupabase } from '@/lib/supabase/server';
// → createRouteHandlerClient() + cookies()를 래핑
```

**실수 방지**: 서버 코드에서 `createBrowserSupabase()` 사용하면 인증 실패합니다.

#### 3. Auth Flow & Context

```
AuthProvider (components/auth/auth-provider.tsx)
  ↓ provides useAuth() hook
  ↓ { user, loading, signOut }
  ↓
Used by: Header, PassageClient, MyPage
```

**서버 사이드 인증**:
```typescript
// API 라우트나 서버 컴포넌트에서
import { authGuard } from '@/lib/auth';
const result = await authGuard();
if (!result.ok) return result.response; // 401 Unauthorized
const { supabase, user } = result;
```

#### 4. PassageClient - Multi-Panel Architecture

**2026-01 리팩토링**: `PassageClient`는 단일 컴포넌트에서 **Panel 기반 아키텍처**로 분할되었습니다.

**핵심 컨셉**: `PanelConfig[]` - 동적으로 패널 추가/제거 가능
```typescript
// components/passage/passage-client.tsx
interface PanelConfig {
  id: string;              // 'panel-1', 'panel-2', ...
  translation: string;     // 'korHRV', 'NIV'
  book: string;            // 영문 약어 (Gen, Exo, Matt)
  chapter: number;
  verses: Verse[];
}
```

**컴포넌트 구조**:
```
passage-client.tsx (오케스트레이터)
  ├─ GlobalHeader.tsx         -- 전역 설정 (폰트, 테마 등)
  ├─ BiblePanel.tsx (반복)    -- 각 번역본 패널
  │   ├─ PanelHeader.tsx      -- 패널별 네비게이션, 번역본 선택
  │   └─ VerseDisplay.tsx     -- 개별 구절 렌더링
  ├─ HighlightModal.tsx       -- 하이라이트 컨텍스트 메뉴
  └─ (노트 에디터)
```

**PassageClient 책임** (`passage-client.tsx:~500 lines`):
- ✅ 전역 상태 관리 (highlights, notes, bookmarks)
- ✅ Panel 생성/삭제/동기화 (병렬 뷰)
- ✅ API 호출 오케스트레이션
- ✅ 사용자 인터랙션 핸들러 (하이라이트, 메모 클릭)
- ✅ localStorage 동기화 (폰트 크기, 굵기)

**BiblePanel 책임** (`BiblePanel.tsx`):
- 단일 번역본의 본문 렌더링
- 패널별 네비게이션 (이전/다음 장)
- 패널별 번역본 전환
- `panel-1`은 항상 존재 (메인 패널), 나머지는 닫기 가능

**병렬 뷰 동작**:
1. 사용자가 "번역본 추가" → 새 `PanelConfig` 생성
2. 각 패널이 독립적으로 `/api/v1/passages` 호출
3. Grid 레이아웃으로 N개 패널 렌더링 (1-3개 권장)
4. 각 패널의 상태는 독립적 (서로 다른 책/장 가능)

#### 5. API Routes Pattern

**공통 패턴** - 모든 엔드포인트는 일관된 구조를 따릅니다:

```typescript
// app/api/v1/<resource>/route.ts
export async function GET(request: Request) {
  const guard = await authGuard(); // 인증 필요한 경우
  if (!guard.ok) return guard.response;

  const { supabase, user } = guard;

  // 쿼리 실행
  const { data, error } = await supabase
    .from('table')
    .select('...')
    .eq('user_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

**주요 엔드포인트**:
- `/api/v1/translations` - 사용 가능한 번역본 목록 (정규화된 스키마 사용)
- `/api/v1/passages` - 성경 본문 조회
- `/api/v1/search` - 본문 검색
- `/api/v1/highlights`, `/api/v1/notes`, `/api/v1/bookmarks` - 사용자 데이터 CRUD

**RLS (Row Level Security)**:
- `notes`, `highlights`, `bookmarks` 테이블은 RLS 정책으로 보호
- Policy: `auth.uid() = user_id`
- 서버에서 `authGuard()` 사용 시에도 이중 보호

### Key Constants & Metadata

`lib/constants.ts`는 앱 전체에서 사용되는 중앙 집중식 상수를 정의합니다:

```typescript
TRANSLATIONS           // 지원 번역본 목록
TRANSLATION_COLUMNS    // 번역본 코드 → DB 컬럼 매핑
BOOK_CHAPTERS          // 각 책의 장 개수 (66권)
HIGHLIGHT_COLORS       // 하이라이트 색상 옵션
FONT_SIZE_CLASSES      // 폰트 크기 Tailwind 클래스
HIGHLIGHT_BG_CLASSES   // 하이라이트 배경색 (다크모드 지원)
```

## Common Modification Scenarios

### 새 번역본 추가하기 (정규화된 스키마)

**정규화된 스키마 사용 시** (권장):

1. **DB에 메타데이터 추가**:
   ```sql
   INSERT INTO translations (code, name, language, year, available, display_order)
   VALUES ('zhCUV', '和合本', 'zh', 1919, true, 10);
   ```

2. **Import Script 작성**: `scripts/import_<translation>.py`
   ```python
   # 각 구절을 verse_translations 테이블에 INSERT
   # verse_id는 new_verses 테이블의 canonical ID 참조
   # translation_id는 위에서 추가한 번역본 ID
   ```

3. **UI 자동 반영**:
   - `/api/v1/translations`가 자동으로 새 번역본 반환
   - `PanelHeader.tsx`의 드롭다운에 자동 표시
   - ✅ 프론트엔드 코드 수정 불필요

**레거시 Wide Table 사용 시** (비권장):
1. `supabase/migrations/` - `verses` 테이블에 새 컬럼 추가
2. `lib/constants.ts` - `TRANSLATION_COLUMNS` 매핑 추가
3. Import script로 컬럼에 데이터 삽입

### 새 사용자 데이터 기능 추가하기 (예: 밑줄 기능)

1. **Migration**: 새 테이블 생성 with RLS policies
   ```sql
   CREATE TABLE underlines (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES users(id) ON DELETE CASCADE,
     verse_id UUID REFERENCES verses(id) ON DELETE CASCADE,
     style TEXT NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW(),
     UNIQUE(user_id, verse_id)
   );
   -- RLS policies 추가
   ```

2. **API Route**: `app/api/v1/underlines/route.ts` 생성
   - GET, POST, DELETE 엔드포인트
   - `authGuard()` 사용

3. **PassageClient**: 상태 추가 및 API 통합
   ```typescript
   const [underlines, setUnderlines] = useState<Map<string, string>>(new Map());
   ```

4. **VerseDisplay**: 렌더링 로직에 스타일 적용

5. **Constants**: 필요시 `lib/constants.ts`에 스타일 옵션 추가

### 검색 기능 개선하기

**현재**: `app/api/v1/search/route.ts`는 `verses` 테이블 full-text search 사용
- GIN index on `korhrv` 컬럼 (한글)
- `ilike` 쿼리 사용

**개선 방향**:
- PostgreSQL `tsvector`/`tsquery` 사용
- 여러 번역본 동시 검색
- 형태소 분석기 통합

## Database Schema Notes

### 정규화된 스키마 (신규)

**핵심 테이블**:
- `new_books` - 66권 성경책 (언어 중립적 구조)
  - `abbr_eng`: URL 라우팅용 영문 약어 (Gen, Exo, Matt)
  - `testament`: OT/NT 구분
- `book_names` - 다국어 책 이름 (ko, en, zh, ja 등)
- `translations` - 번역본 메타데이터 (korHRV, NIV, zhCUV 등)
- `new_verses` - 정규 구절 구조 (본문 없음, 구조만)
- `verse_translations` - 실제 번역된 본문
  - `(verse_id, translation_id)`: UNIQUE
  - Full-text search GIN index 있음
- `users` - 사용자 프로필 (auth.users 트리거 연동)
- `notes`, `highlights`, `bookmarks` - 사용자 주석 데이터

**정규화 스키마의 이점**:
- ✅ 새 번역본 추가 시 스키마 변경 불필요
- ✅ 다국어 지원 용이 (book_names)
- ✅ 번역본별 메타데이터 관리 (년도, 라이선스 등)
- ✅ 구절 참조 일관성 (canonical verse_id)

### 레거시 스키마

**기존 테이블** (호환성 유지):
- `books` - 한글 이름 중심 (66권)
- `verses` - Wide table (korhrv, niv, kornrsv 컬럼)

**Unique Constraints**:
- `notes`, `highlights`, `bookmarks`: `(user_id, verse_id)`는 UNIQUE
  - upsert 패턴 사용: 같은 구절에 대해 한 사용자당 하나의 레코드만

**Cascade Deletes**:
- `user_id` FK는 `ON DELETE CASCADE` 설정
- 사용자 삭제 시 모든 관련 데이터 자동 삭제

**마이그레이션 상태**:
- 현재 두 스키마가 병존 (레거시 + 정규화)
- 프로덕션 전환은 데이터 마이그레이션 후 진행 예정

## Theme System

**2026-01 테마 리뉴얼**: Blue · Beige · Neutral 테마 시스템 적용

**ThemeProvider** (`components/theme/theme-provider.tsx`):
- `localStorage`에 테마 저장 (`theme` key)
- `document.documentElement.classList`에 `dark` 클래스 토글
- Tailwind의 `dark:` 변형 + 커스텀 컬러 팔레트

**Tailwind 설정** (`tailwind.config.ts`):
- Blue 테마: 차분한 파란색 계열 (기본)
- Beige 테마: 따뜻한 베이지 계열
- Neutral 테마: 중성 회색 계열
- 각 테마별 light/dark 모드 지원

**다크모드 스타일링 패턴**:
```typescript
// lib/constants.ts
export const HIGHLIGHT_BG_CLASSES = {
  yellow: "bg-yellow-200 dark:bg-yellow-500/30",
  // 라이트 모드     다크 모드 (투명도 조정)
};
```

**GlobalHeader** (`components/passage/GlobalHeader.tsx`):
- 테마 전환 버튼 포함
- 폰트 크기/굵기 설정과 함께 배치

## Data Import Scripts

**중요**: 이 스크립트들은 service role key로 직접 DB에 쓰기합니다.

**정규화된 스키마용** (신규):
```bash
# 정규화된 스키마로 import
python scripts/import_normalized_hrv.py  # 개역개정 → verse_translations
python scripts/import_normalized_niv.py  # NIV2011 → verse_translations
```

**레거시 Wide Table용**:
```bash
python scripts/import_hrv_wide_table.py  # verses.korhrv 컬럼
python scripts/import_niv_from_bolls.py  # verses.niv 컬럼 (bolls.life API)
```

**요구사항**:
- Python 3.8+
- `supabase` 패키지: `pip install supabase`
- `.env.local` 설정 (SUPABASE_SERVICE_ROLE_KEY 필수)

## Schema Migration Strategy

**현재 상태**: 레거시 wide table → 정규화된 스키마 전환 진행 중

### 마이그레이션 파일

```
supabase/migrations/
  ├─ 20260102_new_schema.sql            # 초기 스키마
  ├─ 20260103_add_unique_constraints.sql
  ├─ 20260103_fix_user_id_references.sql
  ├─ 20260116_normalized_schema.sql     # ⭐ 정규화된 스키마 정의
  ├─ 20260116_clean_schema.sql          # 정리 작업
  └─ 20260116_user_data_tables.sql      # 사용자 데이터 테이블
```

### 데이터 마이그레이션 체크리스트

**프로덕션 전환 전 필수 작업**:

1. **데이터 이관**:
   - [ ] `books` → `new_books` + `book_names` 매핑
   - [ ] `verses.korhrv` → `verse_translations` (translation_id=korHRV)
   - [ ] `verses.niv` → `verse_translations` (translation_id=NIV)
   - [ ] 사용자 데이터 `verse_id` 재매핑 (legacy → canonical verse ID)

2. **API 전환**:
   - [ ] `/api/v1/passages` - 정규화된 스키마 쿼리 사용
   - [ ] `/api/v1/search` - `verse_translations` full-text search
   - [ ] `/api/v1/translations` - `translations` 테이블 사용

3. **프론트엔드 전환**:
   - [ ] `lib/constants.ts` - `TRANSLATION_COLUMNS` 제거
   - [ ] 모든 컴포넌트에서 동적 번역본 로딩 확인

4. **레거시 제거**:
   - [ ] `books`, `verses` 테이블 DROP (백업 후)
   - [ ] Import scripts 정리 (wide table용 스크립트 삭제)

**블루-그린 배포 전략**:
- 두 스키마 병존 기간 동안 데이터 동기화
- 정규화된 스키마가 완전히 안정화되면 레거시 제거
- Rollback 가능하도록 마이그레이션 스크립트 보관

## File Path Reference Pattern

코드에서 특정 라인 참조 시 형식:
```
file_path:line_number
```

예: `components/passage/passage-client.tsx:145`

## Key Implementation Patterns

### 번역본 동적 로딩 패턴

**✅ 권장 (정규화된 스키마)**:
```typescript
// 컴포넌트 mount 시
const { data: translations } = await fetch('/api/v1/translations');
// → DB의 translations 테이블에서 실시간 조회
```

**❌ 비권장 (하드코딩)**:
```typescript
import { TRANSLATIONS } from '@/lib/constants';
// → 정적 배열, DB와 동기화 필요
```

### Panel 상태 관리 패턴

**PassageClient의 Panel 관리**:
```typescript
const [panels, setPanels] = useState<PanelConfig[]>([
  { id: 'panel-1', translation: 'korHRV', book: 'Gen', chapter: 1, verses: [] }
]);

// Panel 추가
const addPanel = (translation: string) => {
  const newPanel = { id: `panel-${Date.now()}`, translation, ... };
  setPanels([...panels, newPanel]);
};

// Panel 제거 (panel-1은 항상 유지)
const removePanel = (id: string) => {
  if (id === 'panel-1') return; // 메인 패널 보호
  setPanels(panels.filter(p => p.id !== id));
};
```

### 사용자 데이터 Upsert 패턴

**하이라이트 저장 예시**:
```typescript
// API: app/api/v1/highlights/route.ts
const { data, error } = await supabase
  .from('highlights')
  .upsert(
    { user_id, verse_id, color },
    { onConflict: 'user_id,verse_id' }  // UNIQUE constraint
  );
// → 같은 구절에 이미 하이라이트가 있으면 업데이트, 없으면 생성
```

## Additional Resources

- **상세 아키텍처**: `WARP.md` (데이터 플로우 분석)
- **마이그레이션 가이드**: `MIGRATION_GUIDE.md` (스키마 전환 절차)
- **README**: `README.md` (프로젝트 개요 및 빠른 시작)
