import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabaseServer";
import AppHeader from "@/components/AppHeader";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <>
      {/* Global header bar on beige background */}
      <div className="bg-[#f6f5f3] text-[#222326]">
        <AppHeader email={user?.email ?? null} />
      </div>

      {/* Let each route (dashboard, lesson, etc.) control its own frame */}
      {children}
    </>
  );
}
