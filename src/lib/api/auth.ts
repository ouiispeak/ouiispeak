import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';

type SupabaseClient = Awaited<ReturnType<typeof createServerSupabase>>;
type User = NonNullable<Awaited<ReturnType<SupabaseClient['auth']['getUser']>>['data']['user']>;

type AuthorizedResult = {
  authorized: true;
  supabase: SupabaseClient;
  user: User;
};

type UnauthorizedResult = {
  authorized: false;
  response: NextResponse;
};

async function getUserFromSupabase() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  return { supabase, user: data?.user ?? null, error };
}

export async function requireApiUser(): Promise<AuthorizedResult | UnauthorizedResult> {
  const { supabase, user, error } = await getUserFromSupabase();

  if (error || !user) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'unauthorized' }, { status: 401 }),
    };
  }

  return {
    authorized: true,
    supabase,
    user,
  };
}

