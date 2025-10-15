'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMsg(error.message);
    else {
      setMsg('Compte créé. Redirection…');
      router.replace('/tableau-de-bord');
      router.refresh();
    }
    setLoading(false);
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(error.message);
    else {
      setMsg('Connexion réussie. Redirection…');
      router.replace('/tableau-de-bord');
      router.refresh();
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
        />
      </div>
      <div>
        <label>Mot de passe</label><br />
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button onClick={handleSignUp} disabled={loading}>
          S’inscrire
        </button>
        {' '}
        <button onClick={handleSignIn} disabled={loading}>
          Se connecter
        </button>
      </div>
      {msg && <p>{msg}</p>}
    </form>
  );
}
