'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSignUp() {
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMsg(error.message);
    else {
      setMsg('Compte créé. Redirection…');
      // Wait a moment for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/tableau-de-bord');
    }
    setLoading(false);
  }

  async function handleSignIn() {
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(error.message);
    else {
      setMsg('Connexion réussie. Redirection…');
      // Wait a moment for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push('/tableau-de-bord');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <div>
        <label>Email</label><br />
        <input
          type="email"
          placeholder="email@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
      </div>
      <div>
        <label>Mot de passe</label><br />
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <button type="button" onClick={handleSignUp} disabled={loading}>
          S’inscrire
        </button>{' '}
        <button type="button" onClick={handleSignIn} disabled={loading}>
          Se connecter
        </button>
      </div>
      {msg && <p>{msg}</p>}
    </form>
  );
}
