import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { createServerSupabase } from '../lib/supabaseServer';
import LogoutButton from '../components/LogoutButton';

export const metadata: Metadata = { title: 'OuiiSpeak' };

export default async function RootLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="fr">
      <body>
        <header style={{ padding: '12px 16px', borderBottom: '1px solid #ddd' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <nav style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="/">Page de destination</a>
              <a href="/accueil">Accueil</a>
              <a href="/a-propos">À propos</a>
              <a href="/abonnements">Abonnements</a>
              <a href="/contact">Contact</a>
              <a href="/tableau-de-bord">Tableau de bord</a>
            </nav>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {user ? (
                <>
                  <span>{user.email}</span>
                  <LogoutButton />
                </>
              ) : (
                <a href="/auth">Se connecter</a>
              )}
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
