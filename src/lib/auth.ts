import { redirect } from 'next/navigation';

import { createServerSupabase } from '@/lib/supabaseServer';

import type { User } from '@supabase/supabase-js';

export async function requireUser() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect('/auth');
  }

  return { supabase, user: data.user };
}

