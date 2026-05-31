import { createClient } from '@supabase/supabase-js'

/**
 * Admin client using the service role key — bypasses Row Level Security.
 * ONLY use this in server-side code (API routes, Server Components).
 * Never expose this client or the service role key to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable.\n' +
      'Get your service_role key from: Supabase Dashboard → Settings → API → service_role'
    )
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
