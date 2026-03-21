import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || "";
export const ANTHROPIC_KEY = process.env.REACT_APP_ANTHROPIC_KEY || "";

export const supabaseConfigured =
  SUPABASE_URL.startsWith("https://") && SUPABASE_ANON_KEY.length > 20;

export const supabase = supabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export async function loadUserData(userId) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("user_data")
      .select("payload")
      .eq("user_id", userId)
      .single();
    if (error) {
      console.warn("loadUserData error:", error.message);
      return null;
    }
    return data?.payload || null;
  } catch (e) {
    console.warn("loadUserData exception:", e);
    return null;
  }
}

export async function saveUserData(userId, payload) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from("user_data")
      .upsert(
        { user_id: userId, payload, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    if (error) {
      console.error("saveUserData error:", error.message, error.details, error.hint);
      return false;
    }
    return true;
  } catch (e) {
    console.error("saveUserData exception:", e);
    return false;
  }
}

export function getEdgeFunctionUrl(name) {
  return SUPABASE_URL + "/functions/v1/" + name;
}
