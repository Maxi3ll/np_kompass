import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client that bypasses RLS.
 * Use only in server-side contexts where the user is not yet authenticated
 * (e.g., auth callback, middleware email checks).
 */
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
