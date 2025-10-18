import { createServerSupabase } from '@/lib/supabaseServer';
import Link from 'next/link';
import { redirect } from 'next/navigation';

type BmRow = {
  id: string;
  lesson_slug: string;
  slide_id: string | null;
  created_at: string;
};

export const dynamic = 'force-dynamic';

export default async function ActivitesPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { data, error } = await supabase
    .from('user_bookmarks')
    .select('id, lesson_slug, slide_id, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const bookmarks = (data ?? []) as BmRow[];

  return (
    <main style={{ padding: 16 }}>
      <h1>Activités — Signets</h1>
      {bookmarks.length === 0 && <p>Aucun signet pour le moment.</p>}
      <ul style={{ paddingLeft: 18 }}>
        {bookmarks.map(b => (
          <li key={b.id} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {new Date(b.created_at).toLocaleString()} · diapo: {b.slide_id ?? '—'}
            </div>
            <Link href={`/lecons/${b.lesson_slug}?slide=${b.slide_id ?? ''}`}>
              Ouvrir la leçon {b.lesson_slug}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}