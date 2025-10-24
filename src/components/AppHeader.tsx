"use client";

import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function AppHeader({ email }: { email: string | null }) {
  return (
    <header className="w-full bg-[#f6f5f3] text-[#222326] border-b border-[#ddd] px-6 py-4 mb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* LEFT: Nav links for logged-in users */}
        <nav className="flex flex-wrap items-center gap-6 md:gap-8 text-base">
          <Link href="/tableau-de-bord" className="text-[#222326] hover:text-blue-600 hover:underline">
            Tableau de bord
          </Link>
          <Link href="/lecons" className="text-[#222326] hover:text-blue-600 hover:underline">
            Leçons
          </Link>
          <Link href="/progression" className="text-[#222326] hover:text-blue-600 hover:underline">
            Progression
          </Link>
          <Link href="/carnet" className="text-[#222326] hover:text-blue-600 hover:underline">
            Carnet
          </Link>
          <Link href="/activites" className="text-[#222326] hover:text-blue-600 hover:underline">
            Activités
          </Link>
          <Link href="/compte" className="text-[#222326] hover:text-blue-600 hover:underline">
            Compte
          </Link>
        </nav>

        {/* RIGHT: User email + Logout */}
        <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
          {email && <span>{email}</span>}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
