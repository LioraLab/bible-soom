import PassageClient from "@/components/passage/passage-client";
import { createServerSupabase } from "@/lib/supabase/server";

// 번역본 코드 → 컬럼명 매핑
const TRANSLATION_COLUMNS: Record<string, string> = {
  korHRV: "korhrv",
  korRV: "korrv",
  korNRSV: "kornrsv",
  NIV: "niv",
};

export default async function Page(props: {
  params: Promise<{ translation: string; book: string; chapter: string }>;
}) {
  const params = await props.params;
  const supabase = await createServerSupabase();

  // URL 디코딩
  const decodedBook = decodeURIComponent(params.book);

  // 번역본 컬럼명 가져오기
  const columnName = TRANSLATION_COLUMNS[params.translation] || "korhrv";

  const { data } = await supabase
    .from("verses")
    .select(`id, book, chapter, verse, ${columnName}`)
    .eq("book", decodedBook)
    .eq("chapter", Number(params.chapter))
    .order("verse");

  const verses = (data ?? []).map((v: any) => ({
    id: v.id,
    text: v[columnName],
    book: v.book,
    chapter: v.chapter,
    verse: v.verse,
  }));

  return (
    <PassageClient
      translation={params.translation}
      book={params.book}
      chapter={Number(params.chapter)}
      verses={verses}
    />
  );
}
