import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '../../lib/supabaseServer';
import AuthForm from '../../components/AuthForm';

export const metadata: Metadata = { title: 'Connexion — OuiiSpeak' };

export default async function AuthPage() {
  const supabase = await createServerSupabase(); // ✅ await here
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect('/tableau-de-bord');
  }

  return (
    <main>
      <h1>Connexion / Inscription</h1>
      <AuthForm />
    </main>
  );
}
