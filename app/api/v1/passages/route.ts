import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { TRANSLATION_COLUMNS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const url = new URL(req.url);
  const translation = url.searchParams.get("translation");
  const book = url.searchParams.get("book");
  const chapter = Number(url.searchParams.get("chapter") ?? 1);

  if (!translation || !book)
    return NextResponse.json({ error: "translation and book required" }, { status: 400 });

  // URL 디코딩
  const decodedBook = decodeURIComponent(book);

  // 번역본 컬럼명 가져오기
  const columnName = TRANSLATION_COLUMNS[translation];
  if (!columnName) {
    return NextResponse.json(
      { error: `Unsupported translation: ${translation}` },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("verses")
    .select(`id, book, chapter, verse, ${columnName}`)
    .eq("book", decodedBook)
    .eq("chapter", chapter)
    .order("verse", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    translation,
    book,
    chapter,
    verses: data.map((v: any) => ({
      id: v.id,
      text: v[columnName],
      book: v.book,
      chapter: v.chapter,
      verse: v.verse,
    })),
  });
}
