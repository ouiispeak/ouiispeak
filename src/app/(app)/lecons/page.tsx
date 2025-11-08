import { createServerSupabase } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export default async function LessonsIndex() {
  const supabase = await createServerSupabase();
  const { data: { user: _user } } = await supabase.auth.getUser();
  // Optional guard:
  // if (!user) redirect('/auth');

  // Placeholder while lessons are being rebuilt
  return (
    <main>
      <h1>Leçons</h1>
      <ul>
        <li>
          Aucune leçon disponible pour le moment. Créez votre première leçon pour commencer.
        </li>
      </ul>
    </main>
  );
}
