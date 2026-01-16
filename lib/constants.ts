/**
 * 성경 관련 상수 정의
 */

// 번역본 타입 정의
export interface Translation {
  code: string;
  name: string;
  available: boolean;
}

// 지원 번역본 목록 (정적 - 동적으로 API에서 가져오는 것을 권장)
// 이 목록은 fallback으로만 사용됩니다.
// 실제 번역본 목록은 /api/v1/translations에서 가져오세요.
export const TRANSLATIONS: Translation[] = [
  { code: "korHRV", name: "개역개정", available: true },
  { code: "korRV", name: "개역한글", available: false },
  { code: "korNRSV", name: "새번역", available: false },
  { code: "NIV", name: "NIV2011", available: true },
];

// 번역본 코드 → DB 컬럼명 매핑
// NOTE: 정규화된 스키마에서는 더 이상 사용되지 않습니다.
// 레거시 호환성을 위해 유지하되, 새 코드에서는 사용하지 마세요.
// @deprecated Use normalized schema with verse_translations table
export const TRANSLATION_COLUMNS: Record<string, string> = {
  korHRV: "korhrv",
  korRV: "korrv",
  korNRSV: "kornrsv",
  NIV: "niv",
};

// 각 책의 장 개수
export const BOOK_CHAPTERS: Record<string, number> = {
  // 구약
  "창세기": 50,
  "출애굽기": 40,
  "레위기": 27,
  "민수기": 36,
  "신명기": 34,
  "여호수아": 24,
  "사사기": 21,
  "룻기": 4,
  "사무엘상": 31,
  "사무엘하": 24,
  "열왕기상": 22,
  "열왕기하": 25,
  "역대상": 29,
  "역대하": 36,
  "에스라": 10,
  "느헤미야": 13,
  "에스더": 10,
  "욥기": 42,
  "시편": 150,
  "잠언": 31,
  "전도서": 12,
  "아가": 8,
  "이사야": 66,
  "예레미야": 52,
  "예레미야애가": 5,
  "에스겔": 48,
  "다니엘": 12,
  "호세아": 14,
  "요엘": 3,
  "아모스": 9,
  "오바댜": 1,
  "요나": 4,
  "미가": 7,
  "나훔": 3,
  "하박국": 3,
  "스바냐": 3,
  "학개": 2,
  "스가랴": 14,
  "말라기": 4,
  // 신약
  "마태복음": 28,
  "마가복음": 16,
  "누가복음": 24,
  "요한복음": 21,
  "사도행전": 28,
  "로마서": 16,
  "고린도전서": 16,
  "고린도후서": 13,
  "갈라디아서": 6,
  "에베소서": 6,
  "빌립보서": 4,
  "골로새서": 4,
  "데살로니가전서": 5,
  "데살로니가후서": 3,
  "디모데전서": 6,
  "디모데후서": 4,
  "디도서": 3,
  "빌레몬서": 1,
  "히브리서": 13,
  "야고보서": 5,
  "베드로전서": 5,
  "베드로후서": 3,
  "요한1서": 5,
  "요한2서": 1,
  "요한3서": 1,
  "유다서": 1,
  "요한계시록": 22,
};

// 기본 번역본 코드
export const DEFAULT_TRANSLATION = "korHRV";

// 하이라이트 색상 목록
export const HIGHLIGHT_COLORS = [
  { name: "노란색", color: "yellow", class: "bg-yellow-400" },
  { name: "초록색", color: "green", class: "bg-green-400" },
  { name: "파란색", color: "blue", class: "bg-blue-400" },
  { name: "분홍색", color: "pink", class: "bg-pink-400" },
  { name: "보라색", color: "purple", class: "bg-purple-400" },
  { name: "주황색", color: "orange", class: "bg-orange-400" },
] as const;

// 글자 크기 매핑
export const FONT_SIZE_CLASSES: Record<number, string> = {
  1: "text-sm",
  2: "text-base",
  3: "text-lg",
  4: "text-xl",
  5: "text-2xl",
};

// 하이라이트 배경색 매핑
export const HIGHLIGHT_BG_CLASSES: Record<string, string> = {
  yellow: "bg-yellow-200 dark:bg-yellow-500/30",
  green: "bg-green-200 dark:bg-green-500/30",
  blue: "bg-blue-200 dark:bg-blue-500/30",
  pink: "bg-pink-200 dark:bg-pink-500/30",
  purple: "bg-purple-200 dark:bg-purple-500/30",
  orange: "bg-orange-200 dark:bg-orange-500/30",
};
