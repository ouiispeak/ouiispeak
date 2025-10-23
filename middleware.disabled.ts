// middleware.ts
import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  // This keeps the Supabase auth cookie in sync so SSR sees the session.
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set: (name: string, value: string, options?: any) => {
          cookieStore.set({ name, value, ...options });
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        remove: (name: string, options?: any) => {
          cookieStore.set({ name, value: '', ...options, maxAge: 0 });
        },
      },
    }
  )
  await supabase.auth.getSession()
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
