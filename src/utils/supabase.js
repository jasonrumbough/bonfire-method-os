import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://rqbsyadjyvzbbirsdfan.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxYnN5YWRqeXZ6YmJpcnNkZmFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5OTc3NzgsImV4cCI6MjA4OTU3Mzc3OH0.iTUpkU-0TMUeLYt4rRa4wslLyfjV2HkwRLJ9IACs43k";
export const ANTHROPIC_KEY = "";

export const supabaseConfigured = true;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export async function loadUserData(userId) {
  try {
    const { data, error } = await supabase
      .from("user_data")
      .select("payload")
      .eq("user_id", userId)
      .single();
    if (error) { console.warn("loadUserData error:", error.message); return null; }
    return data?.payload || null;
  } catch (e) { console.warn("loadUserData exception:", e); return null; }
}

export async function saveUserData(userId, payload) {
  try {
    const { error } = await supabase
      .from("user_data")
      .upsert(
        { user_id: userId, payload, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    if (error) { console.error("saveUserData error:", error.message); return false; }
    return true;
  } catch (e) { console.error("saveUserData exception:", e); return false; }
}

export function getEdgeFunctionUrl(name) {
  return SUPABASE_URL + "/functions/v1/" + name;
}
