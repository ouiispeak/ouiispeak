'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
};

export default function ProfileForm() {
  const router = useRouter();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [fullName, setFullName] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [msg, setMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setMsg(null);

      // get current session (faster + reliable)
const { data: sessionData } = await supabase.auth.getSession();
const session = sessionData?.session;
if (!session) {
  router.replace('/auth');
  return;
}
const user = session.user;

      // ensure a profile row exists (covers older accounts)
      await supabase.from('profiles').upsert({ id: user.id, email: user.email }).select();

      // fetch profile
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error(error);
        setMsg(error.message);
      } else {
        setProfile(data as Profile);
        setFullName(data?.full_name ?? '');
      }

      setLoading(false);
    }

    load();

    // also react to auth changes without full page reloads
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      mounted = false;
      sub?.subscription.unsubscribe();
    };
  }, [router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setMsg(null);
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq('id', profile.id);

    if (error) setMsg(error.message);
    else setMsg('Saved ✅');

    setLoading(false);
  }

  if (loading) return <p>Loading…</p>;
  if (!profile) return null; // we redirected already

  return (
    <form onSubmit={saveProfile} className="max-w-sm">
      <div>
        <label>Email</label>
        <input value={profile.email ?? ''} disabled className="w-full" />
      </div>
      <div>
        <label>Full name</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your name"
          className="w-full"
        />
      </div>
      <button type="submit" disabled={loading} className="disabled:opacity-60">
        {loading ? 'Saving…' : 'Save profile'}
      </button>
      {msg && <p>{msg}</p>}
    </form>
  );
}
