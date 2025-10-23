import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
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
            <Link href="/tableau-de-bord">Tableau de bord</Link>
            <Link href="/lecons">Leçons</Link>
            <Link href="/progression">Progression</Link>
            <Link href="/carnet">Carnet</Link>
            <Link href="/activites">Activités</Link>
            <Link href="/compte">Compte</Link>
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
