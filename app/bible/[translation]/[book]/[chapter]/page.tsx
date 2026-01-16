import PassageClient from "@/components/passage/passage-client";
import { createServerSupabase } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { BookWithNames } from "@/lib/books";
import { extractLanguageFromTranslation } from "@/lib/books";

export default async function Page(props: {
  params: Promise<{ translation: string; book: string; chapter: string }>;
}) {
  const params = await props.params;
  const supabase = await createServerSupabase();

  // params.book은 이제 영어 약어 (예: "Gen", "Matt")
  const bookAbbr = params.book;
  const translationCode = params.translation;
  const chapterNum = Number(params.chapter);

  // Step 1: Fetch all books with names (for navigation and display)
  const { data: booksData, error: booksError } = await supabase
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

  if (booksError || !booksData) {
    console.error("Failed to fetch books:", booksError);
    return notFound();
  }

  const books = booksData as unknown as BookWithNames[];

  // Step 2: Find the requested book
  const book = books.find(b => b.abbr_eng.toLowerCase() === bookAbbr.toLowerCase());
  if (!book) {
    console.error(`Book not found: ${bookAbbr}`);
    return notFound();
  }

  // Validate chapter number
  if (chapterNum < 1 || chapterNum > book.chapters) {
    console.error(`Invalid chapter: ${chapterNum} for book ${book.abbr_eng}`);
    return notFound();
  }

  // Step 3: Fetch translation
  const { data: translationData, error: translationError } = await supabase
    .from("translations")
    .select("id, code, name, language")
    .eq("code", translationCode)
    .single();

  if (translationError || !translationData) {
    console.error(`Translation not found: ${translationCode}`, translationError);
    return notFound();
  }

  // Step 4: Fetch verses with translation
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
    .eq("chapter", chapterNum)
    .eq("verse_translations.translation_id", translationData.id)
    .order("verse", { ascending: true });

  if (versesError) {
    console.error("Failed to fetch verses:", versesError);
    return notFound();
  }

  // Step 5: Get book name in translation's language
  const language = extractLanguageFromTranslation(translationCode);
  const bookName = book.book_names.find(bn => bn.language === language);
  const displayBookName = bookName ? bookName.name :
    (book.book_names.find(bn => bn.language === 'en')?.name || book.abbr_eng);

  // Format verses
  const verses = (versesData || []).map((v: any) => ({
    id: v.id,
    book: displayBookName,
    chapter: v.chapter,
    verse: v.verse,
    text: v.verse_translations[0]?.text || "",
  }));

  // Format books for PassageClient (convert BookWithNames to BookInfo with extended fields)
  const availableBooks = books.map((b) => {
    const bookNameInLang = b.book_names.find(bn => bn.language === language);
    const bookDisplayName = bookNameInLang ? bookNameInLang.name :
      (b.book_names.find(bn => bn.language === 'en')?.name || b.abbr_eng);

    return {
      id: b.id,
      name: bookDisplayName,
      testament: b.testament,
      chapters: b.chapters,
      abbr_eng: b.abbr_eng,
      book_names: b.book_names,
    };
  });

  return (
    <PassageClient
      translation={translationCode}
      translationName={translationData.name}
      bookAbbrEng={book.abbr_eng}
      bookName={displayBookName}
      chapter={chapterNum}
      verses={verses}
      availableBooks={availableBooks as any}
    />
  );
}
