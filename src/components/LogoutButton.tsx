"use client";

import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    await new Promise((resolve) => setTimeout(resolve, 100));
    router.push("/");
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded border border-black/10 px-3 py-1 text-sm font-medium hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/30"
    >
      Se déconnecter
    </button>
  );
}
