'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type SoftIconButtonProps = {
  children: ReactNode;
  ariaLabel: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function SoftIconButton({
  children,
  ariaLabel,
  className = '',
  ...rest
}: SoftIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      className={[
        'inline-flex h-16 w-16 items-center justify-center rounded-full',
        'bg-[#f0ede9] text-[#222326]',
        'shadow-[1px_1px_3px_rgba(0,0,0,0.12),-1px_-1px_2px_rgba(255,255,255,0.9)]',
        'active:translate-y-[1px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222326] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f0ede9]',
        'transition-shadow transition-transform transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50',
        'hover:bg-[#e6e0da] focus:outline-none focus:ring-2 focus:ring-[#cfcac5] focus:ring-offset-2 focus:ring-offset-transparent',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
