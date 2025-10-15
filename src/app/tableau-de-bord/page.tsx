import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '../../lib/supabaseServer';

export const metadata: Metadata = { title: 'Tableau de bord — OuiiSpeak' };

export default async function TableauDeBordPage() {
  const supabase = await createServerSupabase();

  // Gate access quickly with the cookie-backed session
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth');

  // Use an authenticated fetch for anything you display
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    // If user fetch fails for any reason, send to auth
    redirect('/auth');
  }

  return (
    <main>
      <h1>Tableau de bord</h1>
      <p>Connecté en tant que : <strong>{user?.email}</strong></p>
    </main>
  );
}
