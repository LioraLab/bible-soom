import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { extractLanguageFromTranslation, getBookNameByTranslation } from "@/lib/books";

/**
 * GET /api/v1/books
 *
 * Fetches list of books with multilingual names
 *
 * Query Parameters:
 * - testament: Optional filter by "OT" or "NT"
 * - language: Optional language filter for book_names (default: all languages)
 * - translation: Translation code to determine book name language (e.g., 'korHRV', 'NIV')
 *
 * Returns:
 * - Array of books with multilingual names
 */
export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const url = new URL(req.url);

  const testament = url.searchParams.get("testament"); // 'OT' or 'NT'
  const language = url.searchParams.get("language");   // 'ko', 'en', 'zh', 'ja'
  const translation = url.searchParams.get("translation"); // 'korHRV', 'NIV', etc.

  // Build query with book_names relationship
  let query = supabase
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
    .order("book_order", { ascending: true });

  // Filter by testament if provided
  if (testament && (testament === "OT" || testament === "NT")) {
    query = query.eq("testament", testament);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  // Process books to add name field based on translation/language
  let books = data || [];

  // Add name field based on translation or language parameter
  books = books.map((book: any) => {
    let bookName = '';

    if (translation) {
      // Use translation code to determine language
      bookName = getBookNameByTranslation(book, translation);
    } else if (language) {
      // Use language parameter directly
      const bookNameObj = book.book_names.find((bn: any) => bn.language === language);
      bookName = bookNameObj ? bookNameObj.name : book.abbr_eng;
    } else {
      // Default to Korean
      const koreanName = book.book_names.find((bn: any) => bn.language === 'ko');
      bookName = koreanName ? koreanName.name : book.abbr_eng;
    }

    return {
      ...book,
      name: bookName,
      // Optionally filter book_names if language is specified
      book_names: language
        ? book.book_names.filter((bn: any) => bn.language === language)
        : book.book_names,
    };
  });

  return NextResponse.json({ books });
}
