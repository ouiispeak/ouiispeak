'use client';

import ContentBox from './ContentBox';
import { getShowValue } from '@/lib/slideUtils';

type TextSlideProps = {
  title?: string;
  subtitle?: string;
  body?: string;
  body1?: string;
  body2?: string;
  bodies?: string[];
};

export default function TextSlide({
  title,
  subtitle,
  body,
  body1,
  body2,
  bodies,
}: TextSlideProps) {
  // Parse NS (no show) syntax
  const showTitle = getShowValue(title);
  const showSubtitle = getShowValue(subtitle);
  
  const splitIntoLines = (text: string, wordsPerLine = 7) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    const lines: string[] = [];

    for (let i = 0; i < words.length; i += wordsPerLine) {
      lines.push(words.slice(i, i + wordsPerLine).join(' '));
    }

    return lines;
  };

  const contentBlocks =
    bodies?.filter(Boolean) ??
    [body, body1, body2].filter(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    );

  return (
    <div className="flex h-full w-full flex-col px-6 py-10 leading-relaxed md:leading-loose pt-2 md:pt-4">
      {showTitle && <h2 className="mb-4 md:mb-6 text-left text-[1.5em] font-normal tracking-wide text-balance text-[#222326]">{showTitle}</h2>}
      {showSubtitle && <p className="mb-4 md:mb-6 text-left text-[1.2em] text-[#192026]/80 text-balance">{showSubtitle}</p>}
      <div className="flex flex-1 items-center justify-center">
        <div className="flex max-w-full flex-col items-center justify-center text-center text-[#192026]">

          <div className="flex flex-col items-center justify-center">
            {contentBlocks.map((content, index) => (
              <div key={index} className="flex w-full justify-center">
                <ContentBox>
                  {splitIntoLines(content).map((line, lineIndex, array) => (
                    <p key={lineIndex} className={lineIndex === array.length - 1 ? '' : 'mb-4 md:mb-5'}>{line}</p>
                  ))}
                </ContentBox>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
