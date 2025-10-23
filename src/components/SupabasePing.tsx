'use client';
import React from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SupabasePing() {
  const [status, setStatus] = React.useState('checking…');

  React.useEffect(() => {
    (async () => {
      try {
        // quick sanity: print the public envs that Next exposes
        // (they should NOT be empty)
        console.log('ENV URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('ENV ANON length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length);

        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        setStatus(`connected ✅ (session: ${data.session ? 'yes' : 'no'})`);
        console.log('Supabase session:', data.session);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.error('Supabase ping error:', e);
        setStatus('connection error ❌ — check console for details');
      }
    })();
  }, []);

  return <p className="mt-4 text-sm text-gray-600">Supabase: {status}</p>;
}
