import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { extractLanguageFromTranslation } from "@/lib/books";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const translationCode = url.searchParams.get("translation");

  if (!q || !translationCode)
    return NextResponse.json({ error: "q and translation required" }, { status: 400 });

  // Step 1: Get translation ID
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

  // Step 2: Search in verse_translations and join with verses and books
  const { data, error } = await supabase
    .from("verse_translations")
    .select(`
      text,
      verse_id,
      verses!inner (
        id,
        chapter,
        verse,
        book_id,
        books!inner (
          id,
          abbr_eng,
          book_names (
            language,
            name
          )
        )
      )
    `)
    .eq("translation_id", translationData.id)
    .ilike("text", `%${q}%`)
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Step 3: Format results with book names in translation's language
  const language = extractLanguageFromTranslation(translationCode);
  const results = (data || []).map((vt: any) => {
    const verse = vt.verses;
    const book = verse.books;
    const bookName = book.book_names.find((bn: any) => bn.language === language);
    const displayBookName = bookName ? bookName.name :
      (book.book_names.find((bn: any) => bn.language === 'en')?.name || book.abbr_eng);

    return {
      id: verse.id,
      text: vt.text,
      book: displayBookName,
      book_abbr_eng: book.abbr_eng, // English abbreviation for URL
      chapter: verse.chapter,
      verse: verse.verse,
    };
  });

  return NextResponse.json({ results });
}
