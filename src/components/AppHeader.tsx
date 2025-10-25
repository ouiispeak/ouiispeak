"use client";

import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default function AppHeader({ email }: { email: string | null }) {
  return (
    <header>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        {/* LEFT: Nav links for logged-in users */}
        <nav className="flex flex-wrap items-center">
          <Link href="/tableau-de-bord">
            Tableau de bord
          </Link>
          <Link href="/lecons">
            Leçons
          </Link>
          <Link href="/progression">
            Progression
          </Link>
          <Link href="/carnet">
            Carnet
          </Link>
          <Link href="/activites">
            Activités
          </Link>
          <Link href="/compte">
            Compte
          </Link>
        </nav>

        {/* RIGHT: User email + Logout */}
        <div className="flex flex-wrap items-center">
          {email && <span>{email}</span>}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
