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
        'inline-flex h-14 w-14 items-center justify-center rounded-full',
        'bg-[#e4e1db] text-[#222326]',
        'shadow-[4px_4px_8px_rgba(0,0,0,0.18),-3px_-3px_6px_rgba(255,255,255,0.8)]',
        'hover:shadow-[2px_2px_4px_rgba(0,0,0,0.22),-2px_-2px_4px_rgba(255,255,255,0.9)]',
        'active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.25),inset_-3px_-3px_6px_rgba(255,255,255,0.9)] active:translate-y-[1px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222326] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f5f3]',
        'transition-shadow transition-transform duration-100 ease-out disabled:cursor-not-allowed disabled:opacity-50',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
