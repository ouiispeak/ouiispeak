// Server-side Supabase client for App Router pages/layouts.

import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export function createServerSupabase() {
  // Pass the Next.js cookies function directly (sync), as expected by auth-helpers.
  return createServerComponentClient({ cookies });
}
