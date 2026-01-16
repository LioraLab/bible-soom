# 정규화 DB 마이그레이션 가이드

Bible Soom 프로젝트를 Wide Table에서 정규화된 스키마로 마이그레이션하는 전체 가이드입니다.

## 📋 사전 준비

✅ 모든 기존 테이블 삭제 완료 (사용자가 이미 완료)
✅ `HRV(ver.4)/*.txt` 파일 준비 (한글 개역개정 데이터)
✅ Python 환경 및 의존성 설치 확인

## 🚀 단계별 실행 가이드

### Step 1: 마이그레이션 SQL 실행

Supabase 대시보드에서 실행:

1. **Supabase 대시보드 접속**
   - https://app.supabase.com/ 접속
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭
   - "+ New query" 버튼 클릭

3. **마이그레이션 SQL 복사 & 실행**
   ```bash
   # 로컬 터미널에서 파일 내용 복사
   cat supabase/migrations/20260116_normalized_schema.sql
   ```
   - SQL Editor에 전체 내용 붙여넣기
   - "Run" 버튼 클릭 (또는 Ctrl+Enter)
   - ✅ "Success" 메시지 확인

4. **테이블 생성 확인**
   - 왼쪽 메뉴 "Table Editor"에서 다음 테이블 확인:
     - ✓ `books` (66 rows)
     - ✓ `book_names` (132+ rows: 한글 66개 + 영어 66개)
     - ✓ `translations` (4 rows)
     - ✓ `verses` (0 rows - 데이터 import 후 채워짐)
     - ✓ `verse_translations` (0 rows - 데이터 import 후 채워짐)

### Step 2: 한글 개역개정 (korHRV) 데이터 Import

```bash
# 프로젝트 루트에서 실행
cd /home/wl/workspace/projects/bible-soom

# Python 의존성 확인
pip install supabase

# Import 실행
python3 scripts/import_normalized_hrv.py
```

**예상 소요 시간**: 5-10분
**예상 결과**:
```
Found 66 files
Starting normalized import...
============================================================
Importing Gen (HRV(ver.4)/1-01.txt)...
  Book ID: 1
  Translation ID: 1
  Parsed 1533 verses
  Inserted 1533/1533 verses...
  [OK] Completed Gen: 1533 verses
...
============================================================
[OK] Import completed!

Verifying data...
Total canonical verses: 31102
Total korHRV translations: 31102
```

### Step 3: 영어 NIV2011 데이터 Import

```bash
# bolls.life API에서 가져오기
python3 scripts/import_normalized_niv.py
```

**예상 소요 시간**: 10-15분 (API rate limit 때문에 느림)
**예상 결과**:
```
Fetching books from database...
Found 66 books

NIV Translation ID: 2

Starting NIV2011 import from bolls.life API...
============================================================
[1/66] Importing Gen (NIV2011)...
  Chapter 1/50 - 31 verses updated
  Chapter 2/50 - 25 verses updated
  ...
  [OK] Completed Gen: 1533 verses
...
============================================================
[OK] NIV2011 Import completed!
Total verses with NIV translation: 31102
```

### Step 4: 데이터 검증

Supabase 대시보드 SQL Editor에서 실행:

```sql
-- 1. 전체 구절 수 확인
SELECT COUNT(*) FROM verses;
-- 예상: 31102

-- 2. 번역본별 텍스트 수 확인
SELECT
  t.code,
  t.name,
  COUNT(vt.id) as verse_count
FROM translations t
LEFT JOIN verse_translations vt ON vt.translation_id = t.id
GROUP BY t.id, t.code, t.name
ORDER BY t.display_order;
-- 예상:
-- korHRV | 개역개정 | 31102
-- NIV    | NIV2011  | 31102

-- 3. 샘플 데이터 확인 (창세기 1:1)
SELECT
  b.abbr_eng,
  v.chapter,
  v.verse,
  t.code,
  vt.text
FROM verses v
INNER JOIN books b ON b.id = v.book_id
INNER JOIN verse_translations vt ON vt.verse_id = v.id
INNER JOIN translations t ON t.id = vt.translation_id
WHERE b.abbr_eng = 'Gen' AND v.chapter = 1 AND v.verse = 1;
-- 예상:
-- Gen | 1 | 1 | korHRV | 태초에 하나님이 천지를 창조하시니라
-- Gen | 1 | 1 | NIV    | In the beginning God created the heavens and the earth.

-- 4. 다국어 책 이름 확인
SELECT
  b.abbr_eng,
  bn.language,
  bn.name,
  bn.abbr
FROM books b
INNER JOIN book_names bn ON bn.book_id = b.id
WHERE b.abbr_eng = 'Gen'
ORDER BY bn.language;
-- 예상:
-- Gen | en | Genesis | Gen
-- Gen | ko | 창세기  | 창
```

### Step 5: 개발 서버 실행 및 UI 테스트

```bash
# 개발 서버 시작
npm run dev
```

브라우저에서 테스트:

1. **한글 번역 테스트**
   - URL: http://localhost:3000/bible/korHRV/Gen/1
   - ✓ 제목: "창세기 1장"
   - ✓ 구절 텍스트: "태초에 하나님이 천지를 창조하시니라"

2. **영어 번역 테스트**
   - URL: http://localhost:3000/bible/NIV/Gen/1
   - ✓ 제목: "Genesis 1" (no "장" suffix)
   - ✓ 구절 텍스트: "In the beginning God created..."

3. **병렬 보기 테스트**
   - 패널 추가 버튼 클릭 (우측 상단 + 버튼)
   - 두 번째 패널에서 번역본 변경 (korHRV → NIV)
   - ✓ 패널 1: "창세기 1장" (한글)
   - ✓ 패널 2: "Genesis 1" (영어)
   - ✓ 각 패널이 독립적으로 작동

4. **책 선택 드롭다운 테스트**
   - 책/장 선택 버튼 클릭
   - ✓ 한글 번역: 책 이름이 한글로 표시 ("창세기", "출애굽기", ...)
   - ✓ 영어 번역: 책 이름이 영어로 표시 ("Genesis", "Exodus", ...)

5. **localStorage 마이그레이션 테스트**
   - 브라우저 개발자 도구 → Application → Local Storage
   - ✓ `chapterBookmarks`: 영어 약어 형식 확인 ("Gen-1", "Exo-2")
   - ✓ `biblePanels`: bookAbbrEng 필드 확인

## 🎯 예상 DB 크기

| 테이블 | 행 수 | 설명 |
|--------|------|------|
| `books` | 66 | 66권의 성경책 |
| `book_names` | 132+ | 한글 66개 + 영어 66개 (이후 확장 가능) |
| `translations` | 4 | korHRV, korRV, korNRSV, NIV (2개만 available) |
| `verses` | 31,102 | 정규 구절 (언어 독립적) |
| `verse_translations` | 62,204 | 31,102 × 2 (korHRV + NIV) |

## ⚠️ 문제 해결

### 문제 1: Import 스크립트 실행 시 "No module named 'supabase'"
```bash
pip install supabase
```

### 문제 2: "HRV(ver.4)/*.txt files not found"
- `HRV(ver.4)` 폴더가 프로젝트 루트에 있는지 확인
- 파일 인코딩이 EUC-KR인지 확인

### 문제 3: bolls.life API 에러 (NIV import)
- 네트워크 연결 확인
- API rate limit 대기 (스크립트에 자동 딜레이 포함)
- 실패한 장부터 재실행

### 문제 4: 마이그레이션 SQL 실행 에러
- BEGIN/COMMIT 블록이 전체 포함되었는지 확인
- 에러 메시지 확인하고 부분별로 실행

### 문제 5: UI에서 "구절을 찾을 수 없습니다" 표시
- SQL Editor에서 데이터 검증 쿼리 실행
- 브라우저 콘솔에서 API 응답 확인
- Network 탭에서 `/api/v1/passages` 응답 확인

## 📝 완료 체크리스트

- [ ] Step 1: 마이그레이션 SQL 실행 완료
- [ ] Step 2: 한글 개역개정 import 완료 (31,102 verses)
- [ ] Step 3: 영어 NIV import 완료 (31,102 verses)
- [ ] Step 4: SQL 검증 쿼리 모두 통과
- [ ] Step 5: UI 테스트 모두 통과
  - [ ] 한글 번역 정상 표시
  - [ ] 영어 번역 정상 표시
  - [ ] 병렬 보기 정상 작동
  - [ ] 책 선택 드롭다운 다국어 표시
  - [ ] localStorage 마이그레이션 확인

## 🎉 완료 후

축하합니다! 이제 Bible Soom은 다음을 지원합니다:

✅ **무한 확장 가능**: 새 번역은 `INSERT`만으로 추가 (ALTER TABLE 불필요)
✅ **다국어 지원**: 각 번역본이 해당 언어로 책 이름 표시
✅ **병렬 보기**: 각 패널이 독립적으로 언어 표시
✅ **깔끔한 URL**: `/bible/korHRV/Gen/1` (언어 독립적)
✅ **사용자 데이터 보존**: 기존 노트/하이라이트 그대로 유지

다음 번역 추가 시: [ADDING_TRANSLATIONS.md](./ADDING_TRANSLATIONS.md) 참조
