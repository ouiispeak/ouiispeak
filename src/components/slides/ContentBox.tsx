'use client';

import type { ReactNode } from 'react';
import PaperCard from '@/components/ui/PaperCard';

type ContentBoxProps = {
  children: ReactNode;
  className?: string;
};

export default function ContentBox({ children, className }: ContentBoxProps) {
  return (
    <PaperCard 
      className={['inline-block max-w-full p-0 text-[1.25em] leading-relaxed sm:leading-loose text-[#192026]', className]
        .filter(Boolean)
        .join(' ')}
      style={{ backgroundColor: '#e7f4f5' }}
    >
      <div className="px-6 pt-6 pb-4 [&>p:last-child]:mb-0">
        {children}
      </div>
    </PaperCard>
  );
}
