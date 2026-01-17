import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import type { BookWithNames } from "@/lib/books";

/**
 * GET /api/v1/passages
 *
 * Fetches verses for a specific book/chapter/translation
 *
 * Query Parameters:
 * - translation: Translation code (e.g., "korHRV", "NIV")
 * - book: English abbreviation (e.g., "Gen", "Matt")
 * - chapter: Chapter number
 *
 * Returns:
 * - Verses with translated text
 * - Book name in translation's language
 */
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const url = new URL(req.url);

  const translationCode = url.searchParams.get("translation");
  const bookAbbr = url.searchParams.get("book");
  const chapter = Number(url.searchParams.get("chapter") ?? 1);

  // Validate required parameters
  if (!translationCode || !bookAbbr) {
    return NextResponse.json(
      { error: "translation and book required" },
      { status: 400 }
    );
  }

  // Step 1: Verify translation exists
  const { data: translationData, error: translationError } = await supabase
    .from("translations")
    .select("id, code, name, language")
    .eq("code", translationCode)
    .single();

  if (translationError || !translationData) {
    return NextResponse.json(
      { error: `Translation not found: ${translationCode}` },
      { status: 404 }
    );
  }

  // Step 2: Find book by English abbreviation
  const { data: bookData, error: bookError } = await supabase
    .from("books")
    .select(`
      id,
      abbr_eng,
      testament,
      book_order,
      chapters,
      book_names (
        id,
        book_id,
        language,
        name,
        abbr
      )
    `)
    .eq("abbr_eng", bookAbbr)
    .single();

  if (bookError || !bookData) {
    return NextResponse.json(
      { error: `Book not found: ${bookAbbr}` },
      { status: 404 }
    );
  }

  const book = bookData as unknown as BookWithNames;

  // Validate chapter number
  if (chapter < 1 || chapter > book.chapters) {
    return NextResponse.json(
      { error: `Invalid chapter: ${chapter}. Valid range: 1-${book.chapters}` },
      { status: 400 }
    );
  }

  // Step 3: Fetch verses with translations
  const { data: versesData, error: versesError } = await supabase
    .from("verses")
    .select(`
      id,
      chapter,
      verse,
      verse_translations!inner (
        text
      )
    `)
    .eq("book_id", book.id)
    .eq("chapter", chapter)
    .eq("verse_translations.translation_id", translationData.id)
    .order("verse", { ascending: true });

  if (versesError) {
    return NextResponse.json(
      { error: versesError.message },
      { status: 500 }
    );
  }

  // Step 4: Get book name - UI는 항상 한국어 고정
  const koreanBookName = book.book_names.find(bn => bn.language === 'ko');
  const displayBookName = koreanBookName ? koreanBookName.name : book.abbr_eng;

  // Step 5: Format response
  const verses = (versesData || []).map((v: any) => ({
    id: v.id,
    chapter: v.chapter,
    verse: v.verse,
    text: v.verse_translations[0]?.text || "",
  }));

  return NextResponse.json({
    translation: translationCode,
    translation_name: translationData.name,
    book: book.abbr_eng,
    book_name: displayBookName,
    chapter,
    verses,
  });
}
