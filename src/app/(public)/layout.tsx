import type { ReactNode } from 'react';

// Minimal group layout — no header here
export default function PublicGroupLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
