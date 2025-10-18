// src/app/(app)/carnet/page.tsx
import { redirect } from 'next/navigation'
import { createServerSupabase } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic' // don't cache this page

type NoteRow = {
  id: string
  lesson_slug: string
  slide_id: string | null
  content: string
  created_at: string
}

export default async function CarnetPage() {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: notes, error } = await supabase
    .from('lesson_notes')
    .select('id, lesson_slug, slide_id, content, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main style={{ padding: 16 }}>
        <h1>Carnet</h1>
        <p style={{ color: 'crimson' }}>Erreur: {error.message}</p>
      </main>
    )
  }

  if (!notes || notes.length === 0) {
    return (
      <main style={{ padding: 16 }}>
        <h1>Carnet</h1>
        <p>Aucune note pour le moment.</p>
      </main>
    )
  }

  return (
    <main style={{ padding: 16 }}>
      <h1>Carnet</h1>
      <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0' }}>
        {notes.map((n: NoteRow) => {
          const d = new Date(n.created_at)
          const pretty = d.toLocaleString()
          // Optional: deep link back to the lesson/slide if you have that route
          const href = `/lecons/${encodeURIComponent(n.lesson_slug)}${n.slide_id ? `#${encodeURIComponent(n.slide_id)}` : ''}`
          return (
            <li key={n.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
                {pretty} · {n.lesson_slug}{n.slide_id ? ` · ${n.slide_id}` : ''}
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{n.content}</div>
              <div style={{ marginTop: 8 }}>
                <a href={href}>Ouvrir la leçon</a>
              </div>
            </li>
          )
        })}
      </ul>
    </main>
  )
}
