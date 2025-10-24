import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Atkinson_Hyperlegible } from 'next/font/google';
import './globals.css';

const atkinsonHyperlegible = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = { title: 'OuiiSpeak' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={atkinsonHyperlegible.variable}>
      <body className="min-h-screen bg-background text-text">
        <div className="min-h-screen px-6 py-8 md:px-16 md:py-12 lg:px-20 lg:py-16">
          {children}
        </div>
      </body>
    </html>
  );
}
