'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ContentBox from './ContentBox';
import { getShowValue } from '@/lib/slideUtils';
import { fetchSpeechAsset } from '@/lib/speech';

type TextSlideProps = {
  title?: string;
  subtitle?: string;
  body?: string;
  body1?: string;
  body2?: string;
  bodies?: string[];
};

const PlayIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
    aria-hidden="true"
  >
    <path d="M7 5l12 7-12 7V5z" />
  </svg>
);

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

  const contentBlocks =
    bodies?.filter(Boolean) ??
    [body, body1, body2].filter(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    );

  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean[]>(() => contentBlocks.map(() => false));
  const audioRefs = useRef<(HTMLAudioElement | null)[]>(contentBlocks.map(() => null));
  const assetRefs = useRef<Array<{ url: string; revoke?: () => void } | null>>(contentBlocks.map(() => null));

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioRefs.current.forEach((audio) => {
        audio?.pause();
        audio?.removeAttribute('src');
      });
      assetRefs.current.forEach((asset) => asset?.revoke?.());
    };
  }, []);

  const playText = useCallback(async (index: number, text: string) => {
    // Stop any currently playing audio
    audioRefs.current.forEach((audio, i) => {
      if (audio && i !== index) {
        audio.pause();
        audio.removeAttribute('src');
        audioRefs.current[i] = null;
      }
    });

    // Stop current audio if already playing
    if (audioRefs.current[index]) {
      audioRefs.current[index]?.pause();
      audioRefs.current[index]?.removeAttribute('src');
      audioRefs.current[index] = null;
      setPlayingIndex(null);
      return;
    }

    setIsLoading((prev) => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });

    try {
      // Fetch TTS audio using French voice
      const asset = await fetchSpeechAsset(
        { mode: 'tts', text, lang: 'fr' },
        { fallbackLang: 'fr', fallbackText: text }
      );
      
      assetRefs.current[index] = asset;

      // Create and play audio
      const audio = new Audio(asset.url);
      audioRefs.current[index] = audio;

      audio.addEventListener('ended', () => {
        setPlayingIndex(null);
        audioRefs.current[index] = null;
      });

      audio.addEventListener('error', () => {
        setPlayingIndex(null);
        setIsLoading((prev) => {
          const newState = [...prev];
          newState[index] = false;
          return newState;
        });
        audioRefs.current[index] = null;
      });

      setPlayingIndex(index);
      await audio.play();
    } catch (err) {
      console.error('Error playing text:', err);
      setPlayingIndex(null);
    } finally {
      setIsLoading((prev) => {
        const newState = [...prev];
        newState[index] = false;
        return newState;
      });
    }
  }, []);

  return (
    <div className="flex min-h-[60vh] md:h-full w-full flex-col px-4 py-6 sm:px-6 sm:py-8 lg:py-10 leading-relaxed md:leading-loose pt-2 md:pt-4">
      {showTitle && <h2 className="mb-3 sm:mb-4 md:mb-6 text-left text-xl sm:text-2xl md:text-3xl font-normal tracking-wide text-balance text-[#222326]">{showTitle}</h2>}
      {showSubtitle && <p className="mb-3 sm:mb-4 md:mb-6 text-left text-base sm:text-lg leading-relaxed sm:leading-loose text-[#192026]/80 text-balance">{showSubtitle}</p>}
      <div className="flex flex-1 items-center justify-center">
        <div className="flex max-w-full flex-col items-center justify-center text-center text-[#192026]">

          <div className="flex flex-col items-center justify-center">
            {contentBlocks.map((content, index) => {
              const isPlaying = playingIndex === index;
              const isLoadingBlock = isLoading[index];
              const showValue = getShowValue(content);
              
              return (
                <div key={index} className="flex w-full justify-center">
                  <ContentBox>
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => playText(index, showValue)}
                        disabled={isLoadingBlock}
                        className={`flex-shrink-0 mt-1 p-2 rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          isPlaying
                            ? 'border-[#0c9599] bg-[#0c9599] text-white'
                            : 'border-[#e3e0dc] bg-transparent text-[#222326] hover:border-[#0c9599] hover:text-[#0c9599]'
                        }`}
                        aria-label={isPlaying ? 'Arrêter la lecture' : 'Lire le texte'}
                      >
                        {isLoadingBlock ? (
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        ) : (
                          <PlayIcon />
                        )}
                      </button>
                      <p className="text-base sm:text-lg leading-relaxed sm:leading-loose flex-1">{showValue}</p>
                    </div>
                  </ContentBox>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
