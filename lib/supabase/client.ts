import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://fvuhclexexsfzxsexzfu.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_DkjrWg1NOUeSjZ7cB4HZ2g_4m44sB2k";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY
  );
}
