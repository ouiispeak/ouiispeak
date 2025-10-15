import { redirect } from 'next/navigation';
import { createServerSupabase } from '../../lib/supabaseServer';

export default async function ProfilePage() {
  const supabase = createServerSupabase();

  const { data, error } = await (await supabase).auth.getSession();
  const session = data?.session;

  // If there is no session on the SERVER, redirect to /auth
  if (!session) {
    redirect('/auth');
  }

  return (
    <main className="p-8 space-y-3">
      <h1 className="text-2xl font-bold">Profile (SSR)</h1>
      <p>Signed in as <strong>{session.user?.email}</strong></p>
    </main>
  );
}
