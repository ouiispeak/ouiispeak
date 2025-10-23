import type { ReactNode } from 'react';
import Link from 'next/link';

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
            <Link href="/">Page de destination</Link>
            <Link href="/accueil">Accueil</Link>
            <Link href="/a-propos">À propos</Link>
            <Link href="/abonnements">Abonnements</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/auth">Se connecter</Link>
          </div>
        </div>
      </header>
      {children}
    </section>
  );
}
