import { NextResponse } from "next/server";
import { createServerSupabase } from "./supabase/server";

export async function authGuard() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user)
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  return { supabase, user: data.user };
}
