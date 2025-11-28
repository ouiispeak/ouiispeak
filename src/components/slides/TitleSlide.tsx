'use client';

import { getShowValue } from '@/lib/slideUtils';

type TitleSlideProps = {
  title: string;
  subtitle?: string;
};

export default function TitleSlide({ title, subtitle }: TitleSlideProps) {
  // Parse NS (no show) syntax
  const showTitle = getShowValue(title);
  const showSubtitle = getShowValue(subtitle);
  
  return (
    <div className="flex min-h-[60vh] md:h-full w-full flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-8 text-center md:px-10 leading-relaxed md:leading-loose pt-2 md:pt-4">
      {showTitle && (
        <h1 className="mb-3 sm:mb-4 md:mb-6 max-w-3xl text-balance font-normal text-[#0c9599]" style={{ fontSize: 'clamp(3.375rem, 6vw, 5.625rem)' }}>
          {showTitle}
        </h1>
      )}
      {showSubtitle && (
        <p className="mb-4 md:mb-5 max-w-2xl text-balance text-xl font-normal text-[#222326] md:text-2xl lg:text-3xl">
          {showSubtitle}
        </p>
      )}
    </div>
  );
}
