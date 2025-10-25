import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabaseServer";
import AppHeader from "@/components/AppHeader";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // This layout wraps all AUTHENTICATED pages.
  // It is NOT the root layout, so:
  // - no <html> / <body> tags here
  // - no globals.css import here

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header at the top of the private app */}
      <AppHeader email={user?.email ?? null} />

      {/* Page content area */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
