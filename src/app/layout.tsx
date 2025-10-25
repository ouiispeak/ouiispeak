import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Atkinson_Hyperlegible } from 'next/font/google';
import './globals.css';
// TEMPORARY: Readability layer for accessibility - removing this import will revert to unstyled/raw markup
// Final product styling will eventually replace this file
import './readability.css';

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
      <body>
        <div>
          {children}
        </div>
      </body>
    </html>
  );
}