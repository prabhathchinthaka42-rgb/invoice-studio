import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * ⚠️ SERVICE ROLE CLIENT
 *
 * This client bypasses Row Level Security (RLS).
 * ONLY use in server-side contexts where RLS cannot be enforced:
 * - Webhooks
 * - Cron jobs
 * - Admin scripts
 *
 * NEVER expose this client to the browser!
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}