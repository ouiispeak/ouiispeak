import Link from 'next/link';
import { createServerSupabase } from '@/lib/supabaseServer';
import { registeredLessonSlugs } from '@/lessons/registry';

export const dynamic = 'force-dynamic';

export default async function LessonsIndex() {
  const supabase = await createServerSupabase();
  const { data: { user: _user } } = await supabase.auth.getUser();
  // Optional guard:
  // if (!user) redirect('/auth');

  const featuredLessons = registeredLessonSlugs.filter(
    (slug) => slug !== 'templates/blank' && !slug.startsWith('slide template ref'),
  );

  const humanizeSlug = (slug: string) => {
    if (slug.includes('slide-templates')) {
      return 'Prototype de diapositive';
    }

    return slug
      .split('/')
      .map((segment) => segment.replace(/-/g, ' '))
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' · ');
  };

  return (
    <main>
      <h1>Leçons</h1>
      <ul>
        {featuredLessons.map((slug) => (
          <li key={slug}>
            <Link href={`/lecons/${slug}`}>{humanizeSlug(slug)}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
