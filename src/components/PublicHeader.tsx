import Link from "next/link";

export default function PublicHeader() {
  return (
    <header className="border-b border-black/10 mb-8 md:mb-12">
      <div className="flex w-full flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
        {/* LEFT: Brand + nav */}
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            OuiiSpeak
          </Link>

          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm md:text-base">
            <Link
              href="/accueil"
              className="px-2 py-1 rounded hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/30"
            >
              Accueil
            </Link>
            <Link
              href="/a-propos"
              className="px-2 py-1 rounded hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/30"
            >
              À propos
            </Link>
            <Link
              href="/abonnements"
              className="px-2 py-1 rounded hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/30"
            >
              Abonnements
            </Link>
            <Link
              href="/contact"
              className="px-2 py-1 rounded hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/30"
            >
              Contact
            </Link>
          </nav>
        </div>

        {/* RIGHT: Auth link */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth"
            className="rounded border border-black/10 px-3 py-1 text-sm font-medium hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black/30"
          >
            Se connecter / S&apos;inscrire
          </Link>
        </div>
      </div>
    </header>
  );
}
