import { createServerSupabase } from '@/lib/supabaseServer';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LessonsIndex() {
  const supabase = await createServerSupabase();
  const { data: { user: _user } } = await supabase.auth.getUser();
  // Optional guard:
  // if (!user) redirect('/auth');

  // For now, show a single entry to our test lesson
  return (
    <main style={{ padding: 16 }}>
      <h1>Leçons</h1>
      <ul>
        <li>
          <Link href="/lecons/module-1/lesson-1">Module 1 / Leçon 1 — Interface</Link>
        </li>
      </ul>
    </main>
  );
}

