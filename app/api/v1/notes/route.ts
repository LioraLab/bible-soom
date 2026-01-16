import { NextRequest, NextResponse } from "next/server";
import { authGuard } from "@/lib/auth";

export async function GET() {
  const guard = await authGuard();
  if ("error" in guard) return guard.error;
  const { supabase, user } = guard;

  const { data, error } = await supabase
    .from("notes")
    .select(`
      id,
      content,
      verse_id,
      updated_at,
      verses!inner(
        id,
        book_id,
        chapter,
        verse,
        books!inner(
          abbr_eng
        )
      )
    `)
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Format response to include book abbreviation
  const formattedData = data?.map((n: any) => ({
    id: n.id,
    content: n.content,
    verse_id: n.verse_id,
    updated_at: n.updated_at,
    verses: {
      book: n.verses.books.abbr_eng,
      chapter: n.verses.chapter,
      verse: n.verses.verse
    }
  }));

  return NextResponse.json({ notes: formattedData });
}

export async function POST(req: NextRequest) {
  const guard = await authGuard();
  if ("error" in guard) return guard.error;
  const { supabase, user } = guard;

  const body = await req.json();
  const { verseId, content } = body;

  if (!verseId || !content)
    return NextResponse.json({ error: "missing fields" }, { status: 400 });

  const { data, error } = await supabase
    .from("notes")
    .upsert({
      user_id: user.id,
      verse_id: verseId,
      content,
      updated_at: new Date().toISOString(),
    } as any)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ note: data });
}
