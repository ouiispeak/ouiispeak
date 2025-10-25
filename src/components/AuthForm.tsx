'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function handleSignIn(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMsg(error.message);
    } else {
      setMsg('Connexion réussie. Redirection…');
      router.push('/tableau-de-bord');
    }

    setLoading(false);
  }

  async function handleSignUp() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMsg(error.message);
    } else {
      setMsg('Compte créé. Redirection…');
      router.push('/tableau-de-bord');
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSignIn}>
      {/* Email field */}
      <div>
        <label htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full"
          placeholder="email@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      {/* Password field with show/hide */}
      <div>
        <label htmlFor="password">
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="w-full pr-16"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 disabled:opacity-50"
            disabled={loading}
          >
            {showPassword ? 'Masquer' : 'Afficher'}
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col">
        <button
          type="submit"
          disabled={loading}
          className="w-full disabled:opacity-50"
        >
          Se connecter
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={handleSignUp}
          className="w-full disabled:opacity-50"
        >
          S'inscrire
        </button>
      </div>

      {msg && (
        <p>
          {msg}
        </p>
      )}
    </form>
  );
}
