import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabaseServer';
import AuthForm from '@/components/AuthForm';

export const metadata: Metadata = {
  title: 'Connexion — OuiiSpeak',
};

export default async function AuthPage() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/tableau-de-bord');
  }

  return (
    <main>
      <AuthForm />
    </main>
  );
}
