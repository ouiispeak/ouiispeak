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
    <div className="bg-[#f6f5f3] text-[#222326] min-h-screen flex flex-col">
      {/* Header stays at the top */}
      <AppHeader email={user?.email ?? null} />

      {/* Page body goes here */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
