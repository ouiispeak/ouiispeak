'use client';

import { useRouter } from 'next/navigation';
import { getShowValue } from '@/lib/slideUtils';

type LessonEndAction = {
  type: 'restart' | 'progress';
  label: string;
};

type LessonEndSlideProps = {
  title?: string;
  message?: string;
  actions?: LessonEndAction[];
  onRestart?: () => void;
};

export default function LessonEndSlide({ 
  title, 
  message, 
  actions,
  onRestart 
}: LessonEndSlideProps) {
  const router = useRouter();
  
  const defaultActions: LessonEndAction[] = [
    { type: 'restart', label: 'Recommencer la leçon' },
    { type: 'progress', label: 'Voir ma progression' },
  ];

  const effectiveActions = actions ?? defaultActions;

  const handleAction = (type: 'restart' | 'progress') => {
    switch (type) {
      case 'restart':
        onRestart?.();
        break;
      case 'progress':
        router.push('/progression');
        break;
    }
  };

  const showTitle = getShowValue(title);
  const showMessage = getShowValue(message);

  return (
    <div className="flex min-h-[60vh] md:h-full w-full flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:py-10 leading-relaxed md:leading-loose pt-2 md:pt-4">
      <div className="flex flex-col gap-4 max-w-2xl text-center">
        {showTitle && (
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-[#222326]">
            {showTitle}
          </h2>
        )}
        {showMessage && (
          <p className="text-base sm:text-lg leading-relaxed sm:leading-loose text-[#222326]">
            {showMessage}
          </p>
        )}

        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {effectiveActions.map((action) => (
            <button
              key={action.type}
              type="button"
              onClick={() => handleAction(action.type)}
              className="rounded-xl border border-[#d9d2c6] px-4 py-2 text-sm font-medium text-[#222326] hover:bg-[#f0ede9] transition-colors duration-200"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

