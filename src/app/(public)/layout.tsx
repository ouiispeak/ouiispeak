import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
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
            <a href="/">Page de destination</a>
            <a href="/accueil">Accueil</a>
            <a href="/a-propos">À propos</a>
            <a href="/abonnements">Abonnements</a>
            <a href="/contact">Contact</a>
          </nav>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <a href="/auth">Se connecter</a>
          </div>
        </div>
      </header>
      {children}
    </section>
  );
}
