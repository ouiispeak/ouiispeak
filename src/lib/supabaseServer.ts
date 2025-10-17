import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      // Reading cookies is allowed in server components / layouts
      get: (name: string) => cookieStore.get(name)?.value,
      // But writing cookies in RSC/SSR will throw. No-ops here:
      set: () => {},
      remove: () => {},
    },
  });
}
