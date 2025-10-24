import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabaseServer';
import AuthForm from '@/components/AuthForm';

export const metadata: Metadata = {
  title: 'Connexion — OuiiSpeak',
};

export default async function AuthPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    redirect('/tableau-de-bord');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f5f3] text-[#222326] px-6 py-12">
      <div className="w-full max-w-sm border border-[#ddd] rounded-xl bg-white text-[#222326] shadow-sm p-6">
        <h1 className="text-lg font-medium mb-4">
          Connexion / Inscription
        </h1>

        <AuthForm />
      </div>
    </main>
  );
}
