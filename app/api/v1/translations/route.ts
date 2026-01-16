import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * GET /api/v1/translations
 *
 * Returns list of available Bible translations
 */
export async function GET() {
  const supabase = await createServerSupabase();

  const { data, error } = await supabase
    .from("translations")
    .select("*")
    .eq("available", true)
    .order("display_order", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    translations: data || [],
  });
}
