// middleware.ts (project root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // This keeps the auth cookie/session in sync on navigation & refresh
  const supabase = createMiddlewareClient({ req, res });
  await supabase.auth.getSession();

  return res;
}

// Optional: skip static assets and API routes (adjust as you like)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|api).*)',
  ],
};
