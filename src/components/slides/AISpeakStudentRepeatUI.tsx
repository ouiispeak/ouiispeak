import type { AiSpeakStudentRepeatElement } from '@/lessons/types';
import { getShowValue } from '@/lib/slideUtils';
import { getElementStyles, type ElementStatus } from './aiSpeakStudentRepeatStyles';
import { OpenSourcePronunciation } from '@/components/lesson/OpenSourcePronunciation';

// Icons
export const AudioIcon = () => (
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
    <path d="M11 5L6 9H2v6h4l5 4V5z" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

export const PauseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);

export const ResumeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden="true"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

// Element Chip Component
type ElementChipProps = {
  text: string;
  status: ElementStatus;
  isCurrent: boolean;
  isPlayed: boolean;
  onClick: () => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLSpanElement>) => void;
};

export const ElementChip = ({
  text,
  status,
  isCurrent,
  isPlayed,
  onClick,
  onKeyDown,
}: ElementChipProps) => {
  const styles = getElementStyles(isCurrent, isPlayed, status);

  return (
    <span
      className={`flex h-10 w-auto min-w-[2.5rem] sm:h-12 sm:min-w-[3rem] md:h-14 md:min-w-[3.5rem] lg:h-16 lg:min-w-[4rem] items-center justify-center rounded-xl border ${styles.borderColor} bg-transparent px-4 text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal font-sans ${styles.textColor} transition-colors duration-200 cursor-pointer transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {text}
    </span>
  );
};

// Element Row Component
type ElementRowProps = {
  elements: AiSpeakStudentRepeatElement[];
  rowStartIndex: number;
  currentElementIndex: number | null;
  elementStatus: ElementStatus[];
  isSequenceStarted: boolean;
  onElementClick: (absoluteIndex: number) => void;
};

export const ElementRow = ({
  elements,
  rowStartIndex,
  currentElementIndex,
  elementStatus,
  isSequenceStarted,
  onElementClick,
}: ElementRowProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
      {elements.map((element, colIndex) => {
        const elementIndex = rowStartIndex + colIndex;
        const repeatText = element.referenceText ?? element.samplePrompt;
        const showSamplePrompt = getShowValue(element.samplePrompt);
        const isCurrentElement = currentElementIndex === elementIndex;
        const isPlayed = isSequenceStarted && currentElementIndex !== null && currentElementIndex > elementIndex;
        const status = elementStatus[elementIndex];

        if (!showSamplePrompt || !repeatText) return null;

        return (
          <ElementChip
            key={elementIndex}
            text={repeatText}
            status={status}
            isCurrent={isCurrentElement}
            isPlayed={isPlayed}
            onClick={() => onElementClick(elementIndex)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onElementClick(elementIndex);
              }
            }}
          />
        );
      })}
    </div>
  );
};

// Skip Button Component
type SkipButtonProps = {
  show: boolean;
  onClick: () => void;
};

export const SkipButton = ({ show, onClick }: SkipButtonProps) => {
  if (!show) return null;

  return (
    <div className="flex justify-center pb-2">
      <button
        type="button"
        onClick={onClick}
        className="flex flex-col items-center gap-1 rounded-xl border border-[#e3e0dc] bg-transparent px-4 py-2.5 text-center font-normal font-sans text-sm text-[#222326] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2 sm:px-5 sm:py-3 sm:text-base w-[100px] sm:w-[110px]"
        style={{ opacity: 0.6 }}
      >
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
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
        <span className="text-xs text-[#222326] whitespace-nowrap">Passer</span>
      </button>
    </div>
  );
};

// Control Buttons Component
type ControlButtonsProps = {
  onListen: () => void;
  onPauseToggle: () => void;
  isPaused: boolean;
  isSequenceStarted: boolean;
  currentElementIndex: number | null;
  isLoading: boolean[];
  isPlaying: boolean[];
  error: (string | null)[];
  elementsListLength: number;
  recordButtonProps: {
    referenceText: string;
    onWordResults: (results: { reference: string; actual: string | null; correct: boolean }[]) => void;
    autoStart: boolean;
    onRecordingComplete: () => void;
    key: string;
  };
};

export const ControlButtons = ({
  onListen,
  onPauseToggle,
  isPaused,
  isSequenceStarted,
  currentElementIndex,
  isLoading,
  isPlaying,
  error,
  elementsListLength,
  recordButtonProps,
}: ControlButtonsProps) => {
  const hasError = currentElementIndex !== null && error[currentElementIndex] !== null;
  const errorMessage = currentElementIndex !== null ? error[currentElementIndex] : null;
  const isLoadingCurrent = currentElementIndex !== null && isLoading[currentElementIndex];
  const isPlayingCurrent = currentElementIndex !== null && isPlaying[currentElementIndex];
  const hasCurrentElement = currentElementIndex !== null && currentElementIndex < elementsListLength;

  return (
    <div className="flex flex-col items-center gap-4 pb-4">
      {hasError && errorMessage && (
        <p className="text-xs text-red-600 text-center">{errorMessage}</p>
      )}
      
      <div className="flex items-center justify-center gap-4">
        {/* Listen button - always visible */}
        <button
          type="button"
          onClick={onListen}
          disabled={
            isPaused ||
            (currentElementIndex !== null && 
            (isLoadingCurrent || isPlayingCurrent || !hasCurrentElement))
          }
          className="flex flex-col items-center gap-1 rounded-xl border px-4 py-2.5 text-center font-normal font-sans text-sm transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:px-5 sm:py-3 sm:text-base w-[100px] sm:w-[110px]"
          style={{
            borderColor: isPlayingCurrent ? '#9bbfb2' : '#e3e0dc',
            backgroundColor: isPlayingCurrent ? '#9bbfb2' : 'transparent',
            color: '#222326',
            opacity: isPlayingCurrent ? 1 : 0.6,
          }}
        >
          <AudioIcon />
          <span className="text-xs whitespace-nowrap" style={{ color: '#222326' }}>
            {isLoadingCurrent 
              ? 'Chargement...' 
              : isPlayingCurrent
              ? 'Lecture...'
              : 'Écouter'}
          </span>
        </button>
        
        {/* Pause/Resume button - always visible */}
        <button
          type="button"
          onClick={onPauseToggle}
          disabled={!isSequenceStarted}
          className="flex flex-col items-center gap-1 rounded-xl border border-[#e3e0dc] bg-transparent px-4 py-2.5 text-center font-normal font-sans text-sm text-[#222326] transition-transform duration-200 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0c9599] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 sm:px-5 sm:py-3 sm:text-base w-[100px] sm:w-[110px]"
          style={{ opacity: !isSequenceStarted ? 0.6 : 0.6 }}
          aria-label={isPaused ? 'Resume activity' : 'Pause activity'}
        >
          {isPaused ? (
            <>
              <ResumeIcon />
              <span className="text-xs text-[#222326] whitespace-nowrap">Reprendre</span>
            </>
          ) : (
            <>
              <PauseIcon />
              <span className="text-xs text-[#222326] whitespace-nowrap">Pause</span>
            </>
          )}
        </button>
        
        {/* Record button - always visible, render for first element if sequence started */}
        <div className="flex flex-col items-center w-[100px] sm:w-[110px]">
          {(currentElementIndex !== null || isSequenceStarted) ? (
            <div className={isPaused ? 'opacity-50 pointer-events-none w-full' : 'w-full'}>
              <OpenSourcePronunciation 
                key={recordButtonProps.key}
                referenceText={recordButtonProps.referenceText}
                showReferenceLabel={false} 
                buttonOnly={true}
                onWordResults={recordButtonProps.onWordResults}
                hideWordChips={true}
                autoStart={isPaused ? false : recordButtonProps.autoStart}
                onRecordingComplete={recordButtonProps.onRecordingComplete}
                buttonColor="#9bbfb2"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 w-[100px] sm:w-[110px]">
              <div className="flex flex-col items-center gap-1 rounded-xl border border-[#e3e0dc] bg-transparent px-4 py-2.5 text-center font-normal font-sans text-sm text-[#222326] opacity-50 sm:px-5 sm:py-3 sm:text-base w-full">
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
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                <span className="text-xs text-[#222326] whitespace-nowrap">Record</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
