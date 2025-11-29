'use client';

import { useState } from 'react';
import Link from 'next/link';

type LessonInfo = {
  slug: string;
  module: string;
  lesson: string;
  displayName: string;
};

type ModuleDropdownProps = {
  moduleName: string;
  lessons: LessonInfo[];
};

const ChevronDownIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const ChevronUpIcon = ({ className = 'h-5 w-5' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="m18 15-6-6-6 6" />
  </svg>
);

export default function ModuleDropdown({ moduleName, lessons }: ModuleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg bg-[#f4f2ee] shadow-[1px_1px_3px_rgba(0,0,0,0.1),-1px_-1px_2px_rgba(255,255,255,0.9)]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg px-4 py-4 text-left font-normal text-[#222326] transition-colors duration-200 hover:bg-[#e6e0da] sm:px-6 sm:py-5"
        aria-expanded={isOpen}
        aria-controls={`module-${moduleName}-lessons`}
      >
        <span className="text-lg sm:text-xl">{moduleName}</span>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5 text-[#222326]" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-[#222326]" />
        )}
      </button>
      {isOpen && (
        <div
          id={`module-${moduleName}-lessons`}
          className="rounded-lg bg-[#f4f2ee] px-4 pb-4 sm:px-6 sm:pb-5"
        >
          <div className="grid gap-2 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => (
              <Link
                key={lesson.slug}
                href={`/lecons/${lesson.slug}`}
                className="rounded-lg bg-[#f4f2ee] px-4 py-3 text-sm font-normal text-[#222326] shadow-[1px_1px_3px_rgba(0,0,0,0.1),-1px_-1px_2px_rgba(255,255,255,0.9)] transition-colors duration-200 hover:bg-[#f0ede9]"
              >
                {lesson.displayName}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

