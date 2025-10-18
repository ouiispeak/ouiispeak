import type { ReactNode } from 'react';

export default function LessonLayout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: 'minmax(260px, 20%) 1fr',
      }}
    >
      <aside
        style={{
          borderRight: '1px solid #e5e7eb',
          padding: '16px',
          overflow: 'auto',
        }}
      >
        <h2 style={{ margin: '0 0 12px' }}>Menu de la leçon</h2>
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gap: '8px',
          }}
        >
          <li>📝 Notes</li>
          <li>🧠 Aide (IA)</li>
          <li>🔖 Signet</li>
          <li>💾 Enregistrer &amp; quitter</li>
          <li>↺ Redémarrer</li>
        </ul>
      </aside>

      <section style={{ position: 'relative', overflow: 'auto' }}>
        <div style={{ padding: 16 }}>{children}</div>

        {/* Bottom nav inside the 80% content area */}
        <div
          style={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            display: 'flex',
            gap: 8,
          }}
        >
          <button type="button">◀ Précédent</button>
          <button type="button">Suivant ▶</button>
        </div>
      </section>
    </div>
  );
}
