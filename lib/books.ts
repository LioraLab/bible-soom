/**
 * Book Utilities for Bible Soom
 *
 * Centralized utilities for handling book names, translations,
 * and language mappings in a scalable way.
 */

// ============================================
// Type Definitions
// ============================================

export interface BookData {
  id: number;
  abbr_eng: string;      // English abbreviation (Gen, Exo, Matt)
  testament: 'OT' | 'NT';
  book_order: number;    // 1-66
  chapters: number;
  created_at?: string;
}

export interface BookName {
  id: number;
  book_id: number;
  language: string;      // ISO 639-1: ko, en, zh, ja, es
  name: string;          // Full name in that language
  abbr: string;          // Abbreviation in that language
  created_at?: string;
}

export interface Translation {
  id: number;
  code: string;          // korHRV, NIV, zhCUV, jaCLB
  name: string;          // 개역개정, NIV2011, 和合本
  language: string;      // ko, en, zh, ja
  full_name?: string;
  year?: number;
  available: boolean;
  display_order?: number;
  created_at?: string;
}

export interface BookWithNames extends BookData {
  book_names: BookName[];
}

// ============================================
// Language Extraction
// ============================================

/**
 * Extract language code from translation code
 *
 * Examples:
 * - korHRV → ko
 * - zhCUV → zh
 * - jaCLB → ja
 * - NIV → en
 *
 * @param translationCode Translation code (e.g., "korHRV", "NIV")
 * @returns ISO 639-1 language code (e.g., "ko", "en")
 */
export function extractLanguageFromTranslation(translationCode: string): string {
  if (!translationCode) return 'en';

  // Match first 2-3 letters
  const match = translationCode.match(/^([a-z]{2,3})/i);
  if (!match) return 'en';

  const langCode = match[1].toLowerCase();

  // Special cases for English translations
  const englishTranslations = ['niv', 'esv', 'kjv', 'nas', 'nlt', 'msg'];
  if (englishTranslations.includes(langCode)) {
    return 'en';
  }

  // Return first 2 characters (ISO 639-1)
  return langCode.substring(0, 2);
}

// ============================================
// Book Name Utilities
// ============================================

/**
 * Get book name for a specific translation
 *
 * @param book Book data with names
 * @param translationCode Translation code
 * @returns Book name in the translation's language
 */
export function getBookNameByTranslation(
  book: BookWithNames,
  translationCode: string
): string {
  const language = extractLanguageFromTranslation(translationCode);

  // Find book name in that language
  const bookName = book.book_names.find(bn => bn.language === language);

  if (bookName) {
    return bookName.name;
  }

  // Fallback: English → Korean
  const englishName = book.book_names.find(bn => bn.language === 'en');
  if (englishName) {
    return englishName.name;
  }

  const koreanName = book.book_names.find(bn => bn.language === 'ko');
  if (koreanName) {
    return koreanName.name;
  }

  // Last resort: abbr_eng
  return book.abbr_eng;
}

/**
 * Get book abbreviation for a specific translation
 *
 * @param book Book data with names
 * @param translationCode Translation code
 * @returns Book abbreviation in the translation's language
 */
export function getBookAbbrByTranslation(
  book: BookWithNames,
  translationCode: string
): string {
  const language = extractLanguageFromTranslation(translationCode);

  // Find book abbreviation in that language
  const bookName = book.book_names.find(bn => bn.language === language);

  if (bookName) {
    return bookName.abbr;
  }

  // Fallback: English → Korean
  const englishName = book.book_names.find(bn => bn.language === 'en');
  if (englishName) {
    return englishName.abbr;
  }

  const koreanName = book.book_names.find(bn => bn.language === 'ko');
  if (koreanName) {
    return koreanName.abbr;
  }

  // Last resort: abbr_eng
  return book.abbr_eng;
}

// ============================================
// Chapter Suffix Utilities
// ============================================

/**
 * Get chapter suffix for a specific translation
 *
 * Examples:
 * - Korean: "1장" (with suffix)
 * - Chinese: "1章"
 * - Japanese: "1章"
 * - English: "1" (no suffix)
 *
 * @param translationCode Translation code
 * @returns Chapter suffix string
 */
export function getChapterSuffix(translationCode: string): string {
  const language = extractLanguageFromTranslation(translationCode);

  const suffixMap: Record<string, string> = {
    ko: '장',
    zh: '章',
    ja: '章',
    en: '',
    es: '',
    fr: '',
    de: '',
  };

  return suffixMap[language] || '';
}

/**
 * Format chapter display (e.g., "1장", "Chapter 1")
 *
 * @param chapter Chapter number
 * @param translationCode Translation code
 * @returns Formatted chapter string
 */
export function formatChapterDisplay(chapter: number, translationCode: string): string {
  const suffix = getChapterSuffix(translationCode);
  return `${chapter}${suffix}`;
}

// ============================================
// Book Lookup Utilities
// ============================================

/**
 * Find book by English abbreviation
 *
 * @param books Array of books
 * @param abbrEng English abbreviation (e.g., "Gen", "Matt")
 * @returns Book data or undefined
 */
export function getBookByEnglishAbbr(
  books: BookWithNames[],
  abbrEng: string
): BookWithNames | undefined {
  return books.find(b => b.abbr_eng.toLowerCase() === abbrEng.toLowerCase());
}

/**
 * Find book by name in any language
 *
 * @param books Array of books
 * @param name Book name (e.g., "창세기", "Genesis")
 * @returns Book data or undefined
 */
export function getBookByName(
  books: BookWithNames[],
  name: string
): BookWithNames | undefined {
  return books.find(b =>
    b.book_names.some(bn => bn.name.toLowerCase() === name.toLowerCase())
  );
}

/**
 * Find book by abbreviation in any language
 *
 * @param books Array of books
 * @param abbr Book abbreviation (e.g., "창", "Gen")
 * @returns Book data or undefined
 */
export function getBookByAbbr(
  books: BookWithNames[],
  abbr: string
): BookWithNames | undefined {
  return books.find(b =>
    b.book_names.some(bn => bn.abbr.toLowerCase() === abbr.toLowerCase()) ||
    b.abbr_eng.toLowerCase() === abbr.toLowerCase()
  );
}

// ============================================
// URL Mapping Utilities
// ============================================

/**
 * Map English abbreviation to Korean name (for legacy DB queries)
 *
 * @param books Array of books
 * @param abbrEng English abbreviation
 * @returns Korean name or null
 */
export function mapAbbrEngToKoreanName(
  books: BookWithNames[],
  abbrEng: string
): string | null {
  const book = getBookByEnglishAbbr(books, abbrEng);
  if (!book) return null;

  const koreanName = book.book_names.find(bn => bn.language === 'ko');
  return koreanName ? koreanName.name : null;
}

/**
 * Map Korean name to English abbreviation (for URL generation)
 *
 * @param books Array of books
 * @param koreanName Korean book name
 * @returns English abbreviation or null
 */
export function mapKoreanNameToAbbrEng(
  books: BookWithNames[],
  koreanName: string
): string | null {
  const book = books.find(b => {
    const korean = b.book_names.find(bn => bn.language === 'ko');
    return korean && korean.name === koreanName;
  });

  return book ? book.abbr_eng : null;
}

// ============================================
// Validation Utilities
// ============================================

/**
 * Validate if English abbreviation is valid
 *
 * @param abbrEng English abbreviation
 * @returns Boolean indicating validity
 */
export function isValidBookAbbr(abbrEng: string): boolean {
  // English abbreviations are 2-4 characters
  return /^[A-Za-z]{2,4}$/.test(abbrEng);
}

/**
 * Validate if chapter number is valid for a book
 *
 * @param book Book data
 * @param chapter Chapter number
 * @returns Boolean indicating validity
 */
export function isValidChapter(book: BookData, chapter: number): boolean {
  return chapter >= 1 && chapter <= book.chapters;
}

// ============================================
// Display Formatting Utilities
// ============================================

/**
 * Format full passage reference
 *
 * Examples:
 * - Korean: "창세기 1:1"
 * - English: "Genesis 1:1"
 *
 * @param book Book data
 * @param chapter Chapter number
 * @param verse Verse number
 * @param translationCode Translation code
 * @returns Formatted passage reference
 */
export function formatPassageReference(
  book: BookWithNames,
  chapter: number,
  verse: number,
  translationCode: string
): string {
  const bookName = getBookNameByTranslation(book, translationCode);
  return `${bookName} ${chapter}:${verse}`;
}

/**
 * Format chapter title
 *
 * Examples:
 * - Korean: "창세기 1장"
 * - English: "Genesis 1"
 *
 * @param book Book data
 * @param chapter Chapter number
 * @param translationCode Translation code
 * @returns Formatted chapter title
 */
export function formatChapterTitle(
  book: BookWithNames,
  chapter: number,
  translationCode: string
): string {
  const bookName = getBookNameByTranslation(book, translationCode);
  const suffix = getChapterSuffix(translationCode);
  return `${bookName} ${chapter}${suffix}`;
}

// ============================================
// Translation Utilities
// ============================================

/**
 * Get display name for translation in its native language
 *
 * @param translation Translation data
 * @returns Display name
 */
export function getTranslationDisplayName(translation: Translation): string {
  return translation.name;
}

/**
 * Check if translation is available
 *
 * @param translation Translation data
 * @returns Boolean indicating availability
 */
export function isTranslationAvailable(translation: Translation): boolean {
  return translation.available;
}

/**
 * Sort translations by display order
 *
 * @param translations Array of translations
 * @returns Sorted array
 */
export function sortTranslationsByOrder(translations: Translation[]): Translation[] {
  return [...translations].sort((a, b) => {
    const orderA = a.display_order ?? 999;
    const orderB = b.display_order ?? 999;
    return orderA - orderB;
  });
}
