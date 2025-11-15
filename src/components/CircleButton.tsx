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
        'bg-[#f0eeeb] text-[#222326]',
        'shadow-[0_1px_4px_rgba(0,0,0,0.08)]',
        'active:translate-y-[1px]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222326] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f5f3]',
        'transition-shadow transition-transform transition-colors duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-50',
        'hover:bg-[#e8e5e1] focus:outline-none focus:ring-2 focus:ring-[#cfcac5] focus:ring-offset-2 focus:ring-offset-transparent',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}
