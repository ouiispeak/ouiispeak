'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function LogoutButton() {
  const router = useRouter();
  
  async function handleLogout() {
    await supabase.auth.signOut();
    // Wait a moment for auth state to propagate
    await new Promise(resolve => setTimeout(resolve, 100));
    router.push('/');
  }
  
  return <button onClick={handleLogout}>Se déconnecter</button>;
}

