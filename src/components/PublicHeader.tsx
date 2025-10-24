import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="w-full bg-[#f6f5f3] text-[#222326] border-b border-[#ddd] px-6 py-4 mb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        
        {/* LEFT: NAV LINKS */}
        <nav className="flex flex-wrap items-center gap-6 md:gap-8 text-base">
          <Link href="/accueil" className="text-[#222326] hover:text-blue-600 hover:underline">
            Accueil
          </Link>
          <Link href="/a-propos" className="text-[#222326] hover:text-blue-600 hover:underline">
            A propos
          </Link>
          <Link href="/abonnements" className="text-[#222326] hover:text-blue-600 hover:underline">
            Abonnements
          </Link>
          <Link href="/contact" className="text-[#222326] hover:text-blue-600 hover:underline">
            Contact
          </Link>
        </nav>

        {/* RIGHT: AUTH LINK */}
        <div className="text-base">
          <Link
            href="/auth"
            className="text-[#222326] hover:text-blue-600 hover:underline"
          >
            Se connecter / S'inscrire
          </Link>
        </div>
      </div>
    </header>
  );
}
