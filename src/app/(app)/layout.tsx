import { ReactNode } from "react";
import { requireUser } from "@/lib/auth";
import AppHeader from "@/components/AppHeader";

export default async function AppLayout({ children }: { children: ReactNode }) {
  // This layout wraps all AUTHENTICATED pages.
  // It is NOT the root layout, so:
  // - no <html> / <body> tags here
  // - no globals.css import here

  const { user } = await requireUser();

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
