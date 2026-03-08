import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseKey(): string {
  if (globalThis.window === undefined && serviceRoleKey) {
    return serviceRoleKey;
  }
  return anonKey;
}

export const supabase = createClient(supabaseUrl, getSupabaseKey());
