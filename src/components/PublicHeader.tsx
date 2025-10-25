import Link from "next/link";

export default function PublicHeader() {
  return (
    <header>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        
        {/* LEFT: NAV LINKS */}
        <nav className="flex flex-wrap items-center">
          <Link href="/accueil">
            Accueil
          </Link>
          <Link href="/a-propos">
            A propos
          </Link>
          <Link href="/abonnements">
            Abonnements
          </Link>
          <Link href="/contact">
            Contact
          </Link>
        </nav>

        {/* RIGHT: AUTH LINK */}
        <div>
          <Link href="/auth">
            Se connecter / S'inscrire
          </Link>
        </div>
      </div>
    </header>
  );
}
