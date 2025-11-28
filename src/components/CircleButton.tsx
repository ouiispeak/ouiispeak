'use client';

import { useState, useEffect } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type SoftIconButtonProps = {
  children: ReactNode;
  ariaLabel: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function SoftIconButton({
  children,
  ariaLabel,
  className = '',
  onClick,
  ...rest
}: SoftIconButtonProps) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsClicked(true);
    onClick?.(e);
  };

  useEffect(() => {
    if (isClicked) {
      const timer = setTimeout(() => {
        setIsClicked(false);
      }, 1200); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isClicked]);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={handleClick}
      className={[
        'inline-flex h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 items-center justify-center rounded-full',
        'bg-[#f0ede9] text-[#222326]',
        'shadow-[1px_1px_3px_rgba(0,0,0,0.12),-1px_-1px_2px_rgba(255,255,255,0.9)]',
        'active:translate-y-[1px]',
        'focus-visible:outline-none',
        'transition-shadow transition-transform transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50',
        'hover:bg-[#e6e0da]',
        isClicked ? 'click-ring-active' : '',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
