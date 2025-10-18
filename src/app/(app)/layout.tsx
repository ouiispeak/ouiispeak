import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '../../lib/supabaseServer';
import LogoutButton from '../../components/LogoutButton';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth');
  }

  return (
    <section>
      <header style={{ padding: '12px 16px', borderBottom: '1px solid #ddd' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <nav style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="/tableau-de-bord">Tableau de bord</a>
            <a href="/lecons">Leçons</a>
            <a href="/progression">Progression</a>
            <a href="/carnet">Carnet</a>
            <a href="/activites">Activités</a>
            <a href="/compte">Compte</a>
          </nav>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span>{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>
      {children}
    </section>
  );
}
