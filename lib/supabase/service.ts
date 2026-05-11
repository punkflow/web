import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Service-role Supabase client. Bypasses Row Level Security entirely.
 *
 * Use for admin operations (writes from publishing pipeline, webhook handlers,
 * scheduled jobs). NEVER expose to the browser; the service role key must
 * never reach client-side code.
 */
export function createServiceClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "Service-role Supabase client cannot be used in the browser.",
    );
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
