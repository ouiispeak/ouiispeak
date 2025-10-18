import type { ReactNode } from 'react';

export default function LessonGroupLayout({ children }: { children: ReactNode }) {
  // No site header in lessons; the player itself handles the chrome
  return <>{children}</>;
}
