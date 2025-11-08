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

  async function handleSignUp() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMsg(error.message);
    } else {
      setMsg('Compte créé. Redirection…');
      await new Promise((resolve) => setTimeout(resolve, 150));
      router.push('/tableau-de-bord');
    }

    setLoading(false);
  }

  async function handleSignIn() {
    setLoading(true);
    setMsg(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setMsg(error.message);
    } else {
      setMsg('Connexion réussie. Redirection…');
      await new Promise((resolve) => setTimeout(resolve, 150));
      router.push('/tableau-de-bord');
    }

    setLoading(false);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Title */}
      <h1 className="text-2xl font-semibold tracking-tight mb-8">
        Connexion / Inscription
      </h1>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="space-y-6"
      >
        {/* Email */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="email@exemple.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full px-3 py-2 border rounded outline-none"
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium"
          >
            Mot de passe
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 pr-20 border rounded outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm disabled:opacity-60"
            >
              {showPassword ? 'Masquer' : 'Afficher'}
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleSignIn}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 rounded border disabled:opacity-60"
          >
            Se connecter
          </button>

          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 rounded border disabled:opacity-60"
          >
            S&apos;inscrire
          </button>
        </div>

        {/* Message */}
        {msg && (
          <p className="text-sm text-gray-600">
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}
