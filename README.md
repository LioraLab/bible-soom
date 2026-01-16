# Bible Soom (바이블 숨) 🙏

> **말씀의 흐름 속으로** - 크리스천을 위한 성경 묵상 플랫폼

Bible Soom은 언제 어디서나 성경을 읽고, 묵상하고, 기록할 수 있는 현대적인 성경 묵상 웹 애플리케이션입니다.

## 주요 기능 ✨

- 📖 **성경 본문 읽기**: 창세기부터 요한계시록까지 모든 성경 본문 지원
- ✏️ **구절 하이라이트 및 메모**: 감동받은 구절에 색상 하이라이트와 개인 묵상 메모 작성
- 📚 **여러 번역본 병렬 보기**: 한글, 영어 등 다양한 번역본 비교
- 🔍 **본문 내용 검색**: 강력한 검색 기능으로 원하는 구절 빠르게 찾기
- ⭐ **마이페이지**: 하이라이트, 메모, 북마크 한눈에 관리

## 기술 스택 🛠️

### 프론트엔드
- **Next.js 15** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**

### 백엔드
- **Supabase** (PostgreSQL, Auth)
- **Next.js API Routes**

### 배포
- **Vercel** (권장)

## 시작하기 🚀

### 1. 저장소 클론

```bash
git clone <repository-url>
cd bible-soom
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local.example` 파일을 복사하여 `.env.local` 파일을 생성하고 Supabase 정보를 입력하세요.

```bash
cp .env.local.example .env.local
```

`.env.local` 파일:
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Supabase 데이터베이스 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase-schema.sql` 파일의 내용 실행
3. 성경 본문 데이터 import (별도 데이터 필요)

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조 📁

```
bible-soom/
├── app/                          # Next.js App Router
│   ├── api/v1/                   # API 엔드포인트
│   │   ├── passages/             # 성경 본문 조회
│   │   ├── search/               # 검색
│   │   ├── notes/                # 메모 CRUD
│   │   ├── bookmarks/            # 북마크 CRUD
│   │   └── highlights/           # 하이라이트 CRUD
│   ├── bible/[translation]/[book]/[chapter]/ # 성경 읽기 페이지
│   ├── search/                   # 검색 페이지
│   ├── mypage/                   # 마이페이지
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 메인 페이지
├── components/                   # React 컴포넌트
│   └── passage/                  # 성경 본문 관련 컴포넌트
├── lib/                          # 유틸리티 함수
│   ├── supabase/                 # Supabase 클라이언트
│   └── auth.ts                   # 인증 헬퍼
├── types/                        # TypeScript 타입 정의
│   └── database.ts               # Supabase 데이터베이스 타입
└── supabase-schema.sql           # 데이터베이스 스키마
```

## API 엔드포인트 🔌

### 성경 본문
- `GET /api/v1/passages?translation=kor&book=Genesis&chapter=1`

### 검색
- `GET /api/v1/search?q=사랑&translation=kor`

### 노트
- `GET /api/v1/notes` - 노트 목록
- `POST /api/v1/notes` - 노트 추가
- `PUT /api/v1/notes/[id]` - 노트 수정
- `DELETE /api/v1/notes/[id]` - 노트 삭제

### 북마크
- `GET /api/v1/bookmarks` - 북마크 목록
- `POST /api/v1/bookmarks` - 북마크 추가
- `DELETE /api/v1/bookmarks/[id]` - 북마크 삭제

### 하이라이트
- `GET /api/v1/highlights` - 하이라이트 목록
- `POST /api/v1/highlights` - 하이라이트 추가
- `DELETE /api/v1/highlights/[id]` - 하이라이트 삭제

## 배포 📦

### Vercel 배포

```bash
npm install -g vercel
vercel
```

환경 변수를 Vercel 대시보드에서 설정해야 합니다.

## 라이선스 📜

성경 번역본 저작권에 유의하세요:
- 개역개정4판: 대한성서공회 허가 필요
- NIV: Biblica 저작권 표기 필요

## 기여 🤝

이 프로젝트는 오픈소스입니다. PR과 이슈를 환영합니다!

## 문의 📧

문의사항이 있으시면 이슈를 등록해주세요.

---

**Bible Soom** - 말씀의 흐름 속으로 🙏
