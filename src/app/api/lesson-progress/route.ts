import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const { lesson_slug, slide_id, percent, done } = await req.json();
    if (!lesson_slug || typeof lesson_slug !== 'string') {
      return NextResponse.json({ error: 'lesson_slug manquant' }, { status: 400 });
    }
    const [moduleSlug, lessonSlug] = lesson_slug.split('/');
    if (!moduleSlug || !lessonSlug) {
      return NextResponse.json({ error: 'Format lesson_slug invalide' }, { status: 400 });
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    // 1) Get module id
    const { data: mod, error: modErr } = await supabase
      .from('modules')
      .select('id')
      .eq('slug', moduleSlug)
      .maybeSingle();
    if (modErr || !mod) return NextResponse.json({ error: 'Module introuvable' }, { status: 404 });

    // 2) Get lesson id
    const { data: lesson, error: lesErr } = await supabase
      .from('lessons')
      .select('id')
      .eq('module_id', mod.id)
      .eq('slug', lessonSlug)
      .maybeSingle();
    if (lesErr || !lesson) return NextResponse.json({ error: 'Leçon introuvable' }, { status: 404 });

    const pct = Math.max(0, Math.min(100, Number(percent ?? 0)));

    // Try update first
    const { data: upd, error: updErr } = await supabase
      .from('user_lessons')
      .update({
        score: pct,
        ...(done ? { completed_at: new Date().toISOString() } : {}),
      })
      .eq('user_id', user.id)
      .eq('lesson_id', lesson.id)
      .select('id');

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 400 });
    }

    if (!upd || upd.length === 0) {
      // Insert
      const { error: insErr } = await supabase
        .from('user_lessons')
        .insert({
          user_id: user.id,
          lesson_id: lesson.id,
          score: pct,
          ...(done ? { completed_at: new Date().toISOString() } : {}),
        });
      if (insErr) {
        return NextResponse.json({ error: insErr.message }, { status: 400 });
      }
    }

    return NextResponse.json({ ok: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Erreur inconnue' }, { status: 500 });
  }
}
