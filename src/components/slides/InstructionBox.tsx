'use client';

import type { ReactNode } from 'react';
import PaperCard from '@/components/ui/PaperCard';

type InstructionBoxProps = {
  children: ReactNode;
  className?: string;
};

/**
 * InstructionBox component - Same styling as ContentBox but with a different background color (#f3f1ee)
 * Used for displaying instructions in slides
 */
export default function InstructionBox({ children, className }: InstructionBoxProps) {
  return (
    <PaperCard 
      className={['inline-block max-w-full p-0 text-[1.25em] leading-relaxed text-[#192026]', className]
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundColor: '#f3f1ee' }}
    >
      <div className="px-6 pt-6 pb-4 [&>p:last-child]:mb-0">
        {children}
      </div>
    </PaperCard>
  );
}

