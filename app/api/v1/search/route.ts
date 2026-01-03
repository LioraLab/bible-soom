import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { TRANSLATION_COLUMNS } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const translation = url.searchParams.get("translation");

  if (!q || !translation)
    return NextResponse.json({ error: "q and translation required" }, { status: 400 });

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
    .ilike(columnName, `%${q}%`)
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    results: data.map((v: any) => ({
      id: v.id,
      text: v[columnName],
      book: v.book,
      chapter: v.chapter,
      verse: v.verse,
    })),
  });
}
