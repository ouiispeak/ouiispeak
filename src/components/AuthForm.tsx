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
    <form onSubmit={handleSignIn} className="text-[#222326]">
      {/* Email field */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full border border-[#ccc] rounded-md px-3 py-2 bg-white text-[#222326]"
          placeholder="email@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      {/* Password field with show/hide */}
      <div className="mb-4">
        <label htmlFor="password" className="block text-sm mb-1">
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            className="w-full border border-[#ccc] rounded-md px-3 py-2 pr-16 bg-white text-[#222326]"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#222326] underline disabled:no-underline disabled:opacity-50"
            disabled={loading}
          >
            {showPassword ? 'Masquer' : 'Afficher'}
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3 mt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md py-2 px-4 font-medium text-white bg-[#222326] disabled:opacity-50"
        >
          Se connecter
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={handleSignUp}
          className="w-full rounded-md py-2 px-4 font-medium text-[#222326] bg-[#f6f5f3] border border-[#222326]/20 disabled:opacity-50"
        >
          S'inscrire
        </button>
      </div>

      {msg && (
        <p className="text-sm mt-4 text-[#222326]">
          {msg}
        </p>
      )}
    </form>
  );
}
