import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase();
  const url = new URL(req.url);
  const testament = url.searchParams.get("testament"); // 'OT' or 'NT'

  let query = supabase
    .from("books")
    .select("id, name, testament, chapters, book_order")
    .order("book_order", { ascending: true });

  if (testament && (testament === "OT" || testament === "NT")) {
    query = query.eq("testament", testament);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ books: data });
}
