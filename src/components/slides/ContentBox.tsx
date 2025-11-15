'use client';

import type { ReactNode } from 'react';
import PaperCard from '@/components/ui/PaperCard';

type ContentBoxProps = {
  children: ReactNode;
  className?: string;
};

export default function ContentBox({ children, className }: ContentBoxProps) {
  return (
    <PaperCard className={['inline-block max-w-full px-6 py-4 text-[1.25em] leading-relaxed text-[#192026]', className]
      .filter(Boolean)
      .join(' ')}>
      {children}
    </PaperCard>
  );
}
