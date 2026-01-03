import { NextRequest, NextResponse } from "next/server";
import { authGuard } from "@/lib/auth";

export async function GET() {
  const guard = await authGuard();
  if ("error" in guard) return guard.error;
  const { supabase, user } = guard;

  const { data, error } = await supabase
    .from("bookmarks")
    .select("id, verse_id, verses!inner(book, chapter, verse), created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookmarks: data });
}

export async function POST(req: NextRequest) {
  const guard = await authGuard();
  if ("error" in guard) return guard.error;
  const { supabase, user } = guard;

  const body = await req.json();
  const { verseId } = body;

  if (!verseId)
    return NextResponse.json({ error: "missing verseId" }, { status: 400 });

  const { data, error } = await supabase
    .from("bookmarks")
    .upsert({
      user_id: user.id,
      verse_id: verseId,
    } as any)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookmark: data });
}

export async function DELETE(req: NextRequest) {
  const guard = await authGuard();
  if ("error" in guard) return guard.error;
  const { supabase, user } = guard;

  const body = await req.json();
  const { verseId } = body;

  if (!verseId)
    return NextResponse.json({ error: "missing verseId" }, { status: 400 });

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("verse_id", verseId)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
