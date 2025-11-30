import { NextRequest, NextResponse } from 'next/server';
import { requireApiUser } from '@/lib/api/auth';

export async function GET(req: NextRequest) {
  const auth = await requireApiUser();
  if (!auth.authorized) {
    return auth.response;
  }
  const { supabase, user } = auth;

  const { searchParams } = new URL(req.url);
  const lesson_slug = searchParams.get('lesson_slug') ?? undefined;

  let query = supabase
    .from('lesson_bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (lesson_slug) query = query.eq('lesson_slug', lesson_slug);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const auth = await requireApiUser();
  if (!auth.authorized) {
    return auth.response;
  }
  const { supabase, user } = auth;

  const body = await req.json().catch(() => null);
  const { lesson_slug, slide_id } = body || {};
  if (!lesson_slug || !slide_id) {
    return NextResponse.json({ error: 'lesson_slug and slide_id are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('lesson_bookmarks')
    .upsert(
      { user_id: user.id, lesson_slug, slide_id },
      { onConflict: 'user_id,lesson_slug,slide_id', ignoreDuplicates: true }
    )
    .select()
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiUser();
  if (!auth.authorized) {
    return auth.response;
  }
  const { supabase, user } = auth;

  const body = await req.json().catch(() => null);
  const { lesson_slug, slide_id } = body || {};
  if (!lesson_slug || !slide_id) {
    return NextResponse.json({ error: 'lesson_slug and slide_id are required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('lesson_bookmarks')
    .delete()
    .eq('user_id', user.id)
    .eq('lesson_slug', lesson_slug)
    .eq('slide_id', slide_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
