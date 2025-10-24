import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabaseServer";
import AppHeader from "@/components/AppHeader";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/auth');
  }

  return (
    <section className="min-h-screen bg-[#f6f5f3] text-[#222326]">
      <AppHeader email={user?.email ?? null} />
      <main className="px-6 pb-12">
        {children}
      </main>
    </section>
  );
}
