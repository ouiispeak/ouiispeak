import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'OuiiSpeak — Page de destination' };

export default function LandingPage() {
  return (
    <main>
      <div>
        <div className="text-center max-w-3xl mx-auto">
          <h1>OuiiSpeak</h1>
          <p>Bienvenue sur votre plateforme d&rsquo;apprentissage du français</p>
          <div className="flex flex-col sm:flex-row justify-center">
            <a href="/auth">
              Commencer l&rsquo;apprentissage
            </a>
            <a href="/a-propos">
              En savoir plus
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

