import { redirect } from 'next/navigation';

import { createServerSupabase } from '@/lib/supabaseServer';

import type { User } from '@supabase/supabase-js';

type RequireUserResult = {
  supabase: Awaited<ReturnType<typeof createServerSupabase>>;
  user: User;
};

export async function requireUser(): Promise<RequireUserResult> {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect('/auth');
  }

  return { supabase, user: data.user };
}

