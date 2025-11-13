'use client';

import ContentBox from './ContentBox';

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
    <div className="flex h-full w-full items-center justify-center px-6 py-10">
      <div className="flex max-w-full flex-col items-center text-center text-[#192026]">
        {title && <h2 className="mb-2 text-[1.5em] font-semibold">{title}</h2>}
        {subtitle && <p className="mb-6 text-[1.2em] text-[#192026]/80">{subtitle}</p>}

        <div className="flex flex-col items-center gap-4">
          {contentBlocks.map((content, index) => (
            <div key={index} className="flex w-full justify-center">
              <ContentBox>
                {splitIntoLines(content).map((line, lineIndex) => (
                  <p key={lineIndex}>{line}</p>
                ))}
              </ContentBox>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
