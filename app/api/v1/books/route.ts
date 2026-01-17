import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

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

  // Process books to add name field
  // UI는 항상 한국어이므로 translation/language 매개변수와 관계없이 한국어 책 이름 사용
  let books = data || [];

  books = books.map((book: any) => {
    // 항상 한국어 책 이름 반환 (UI 한국어 고정 정책)
    const koreanName = book.book_names.find((bn: any) => bn.language === 'ko');
    const bookName = koreanName ? koreanName.name : book.abbr_eng;

    return {
      ...book,
      name: bookName,
      // book_names는 전체 반환 (필터링 제거 - 필요시 클라이언트에서 처리)
      book_names: book.book_names,
    };
  });

  return NextResponse.json({ books });
}
