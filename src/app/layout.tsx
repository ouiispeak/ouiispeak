import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Atkinson_Hyperlegible } from 'next/font/google';
import '@/styles/tailwind.css';

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
     <body className="bg-[#f6f5f3] text-[#222326] font-sans antialiased">
  <div className="min-h-screen flex flex-col px-6 py-6 md:px-12 md:py-10">
    {children}
  </div>
</body>

    </html>
  );
}