import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

// HANYA dipakai di server (kunci service role tidak pernah dikirim ke browser).
// Tanpa env, situs memakai data contoh (read-only) agar tetap bisa dicoba di komputer sendiri.
export const db: SupabaseClient | null = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;

export const tabelHilang = (e: { code?: string } | null | undefined) =>
  !!e && ["42P01", "42703", "PGRST205", "PGRST204"].includes(e.code ?? "");
