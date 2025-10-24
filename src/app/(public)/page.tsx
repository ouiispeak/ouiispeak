import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'OuiiSpeak — Page de destination' };

export default function LandingPage() {
  return (
    <main className="section">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">OuiiSpeak</h1>
          <p className="text-xl text-text/70 mb-8">Bienvenue sur votre plateforme d'apprentissage du français</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth" className="btn btn-primary">
              Commencer l'apprentissage
            </a>
            <a href="/a-propos" className="btn btn-secondary">
              En savoir plus
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

