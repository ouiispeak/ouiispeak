"use client";

import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function AppHeader({ email }: { email: string | null }) {
  return (
    <header className="border-b border-black/10 mb-8 md:mb-12">
      <div className="flex w-full flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
        {/* LEFT: Brand + nav links */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/tableau-de-bord"
            className="text-lg font-semibold tracking-tight"
          >
            OuiiSpeak
          </Link>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm md:text-base">
            <Link
              href="/tableau-de-bord"
              className="px-2 py-1 rounded hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/30"
            >
              Tableau de bord
            </Link>
            <Link
              href="/lecons"
              className="px-2 py-1 rounded hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/30"
            >
              Leçons
            </Link>
            <Link
              href="/compte"
              className="px-2 py-1 rounded hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/30"
            >
              Compte
            </Link>
          </nav>
        </div>

        {/* RIGHT: Email + logout */}
        <div className="flex flex-wrap items-center gap-3 text-sm md:text-base">
          {email && (
            <span
              className="max-w-[12rem] truncate text-gray-600"
              title={email}
            >
              {email}
            </span>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
